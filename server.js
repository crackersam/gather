import { createServer } from "https";
import next from "next";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import mediasoup from "mediasoup";
import { Socket } from "socket.io-client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
var __dirname = path.resolve();

app.prepare().then(() => {
  const options = {
    key: fs.readFileSync(path.resolve(__dirname, "certs", "key.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "certs", "cert.pem")),
  };
  const httpsServer = createServer(options, handler);

  const io = new Server(httpsServer);

  let worker;
  let router;
  let transports = [];
  let producers = [];
  let consumers = [];
  let audioLevelObserver;
  let namespaces = {};

  const createWorker = async () => {
    worker = await mediasoup.createWorker({
      rtcMinPort: 2000,
      rtcMaxPort: 2100,
    });
    console.log(`worker pid ${worker.pid}`);

    worker.on("died", (error) => {
      // This implies something serious happened, so kill the application
      console.error("mediasoup worker has died");
      setTimeout(() => process.exit(1), 2000); // exit in 2 seconds
    });

    return worker;
  };

  // We create a Worker as soon as our application starts
  worker = createWorker();

  const mediaCodecs = [
    {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: "video",
      mimeType: "video/VP8",
      clockRate: 90000,
      parameters: {
        "x-google-start-bitrate": 1000,
      },
    },
  ];
  io.on("connection", async (socket) => {
    console.log("a user connected to the default namespace");
    socket.on("joinNamespace", (namespace) => {
      if (!namespaces[namespace]) {
        // Create the namespace dynamically if it doesn't exist
        namespaces[namespace] = io.of(`/${namespace}`);
        namespaces[namespace].on("connection", (nsSocket) => {
          namespaces[namespace].count = (namespaces[namespace].count ?? 0) + 1;

          console.log(`User connected to namespace: ${namespace}`);
          nsSocket.emit("connection-success", {
            data: `User connected to namespace: ${namespace}`,
            socketId: nsSocket.id,
          });

          nsSocket.on("disconnect", () => {
            console.log("user disconnected");

            // remove the transport associated with the socket
            transports = transports.filter(
              (obj) => obj.socketId !== nsSocket.id
            );

            // remove the producer associated with the socket
            producers = producers.filter((obj) => obj.socketId !== nsSocket.id);

            // remove the consumer associated with the socket
            consumers = consumers.filter((obj) => obj.socketId !== nsSocket.id);

            nsSocket.broadcast.emit("producer-remove", {
              socketId: nsSocket.id,
            });
          });

          nsSocket.on("createRoom", async (callback) => {
            if (namespaces[namespace].router === undefined) {
              // worker.createRouter(options)
              // options = { mediaCodecs, appData }
              // mediaCodecs -> defined above
              // appData -> custom application data - we are not supplying any
              // none of the two are required
              namespaces[namespace].router = await worker.createRouter({
                mediaCodecs,
              });
              // Create an AudioLevelObserver on the router
              audioLevelObserver = await namespaces[
                namespace
              ].router.createAudioLevelObserver({
                maxEntries: 1, // Number of participants to detect as active speakers
                threshold: -60, // Volume threshold in dB, above this is considered speech
                interval: 800, // Interval in ms to calculate the audio levels
              });
              // Listen for active speaker changes
              audioLevelObserver.on("volumes", (volumes) => {
                const { producer, volume } = volumes[0]; // Get the most active speaker's producer
                console.log(
                  `Active speaker: ${producer.id}, volume: ${volume}`
                );
                // Send active speaker info to all clients
                namespaces[namespace].emit("activeSpeaker", {
                  producerId: producer.id,
                });
              });

              // Optional: listen for when no one is speaking
              audioLevelObserver.on("silence", () => {
                console.log("No active speakers");
                namespaces[namespace].emit("activeSpeaker", {
                  producerId: null,
                });
              });
              console.log(`Router ID: ${namespaces[namespace].router.id}`);
            }

            getRtpCapabilities(namespace, callback);
          });

          const getRtpCapabilities = (namespace, callback) => {
            const rtpCapabilities =
              namespaces[namespace].router.rtpCapabilities;

            callback({ rtpCapabilities });
          };

          nsSocket.on("createWebRtcTransport", async ({ sender }, callback) => {
            console.log(`Is this a sender request? ${sender}`);
            // The client indicates if it is a producer or a consumer
            // if sender is true, indicates a producer else a consumer
            const transportIndex = transports.findIndex(
              (obj) => obj.sender === sender && obj.socketId === socket.id
            );
            console.log("matching transport found at ", transportIndex);
            if (transportIndex === -1) {
              const newTransport = {
                socketId: nsSocket.id,
                sender,
                transport: await createWebRtcTransport(namespace, callback),
              };
              transports = [...transports, newTransport];
              console.log("-new transport created");
            } else {
              console.log("using transport", transportIndex);
              const t = transports[transportIndex];
              callback({
                // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
                params: {
                  id: t.transport.id,
                  iceParameters: t.transport.iceParameters,
                  iceCandidates: t.transport.iceCandidates,
                  dtlsParameters: t.transport.dtlsParameters,
                },
              });
            }
          });

          nsSocket.on("transport-connect", async ({ dtlsParameters }) => {
            console.log("DTLS PARAMS... ", { dtlsParameters });
            await transports[
              transports.findIndex(
                (obj) => obj.sender && obj.socketId === nsSocket.id
              )
            ].transport.connect({ dtlsParameters });
          });

          nsSocket.on(
            "transport-produce",
            async ({ kind, rtpParameters, appData }, callback) => {
              // call produce based on the prameters from the client
              let producer = await transports[
                transports.findIndex(
                  (obj) => obj.sender && obj.socketId === nsSocket.id
                )
              ].transport.produce({
                kind,
                rtpParameters,
                appData,
              });

              console.log("Producer ID: ", producer.id, producer.kind);
              if (producer.kind === "audio") {
                audioLevelObserver.addProducer({ producerId: producer.id });
              }
              socket.broadcast.emit("producer-add", {
                id: producer.id,
                kind: producer.kind,
              });

              producer.on("transportclose", () => {
                console.log("transport for this producer closed ");
                producer.close();
              });

              producers = [...producers, { socketId: nsSocket.id, producer }];

              // Send back to the client the Producer's id
              callback({
                id: producer.id,
              });
            }
          );

          nsSocket.on("transport-recv-connect", async ({ dtlsParameters }) => {
            console.log(`DTLS PARAMS: ${dtlsParameters}`);
            const i = transports.findIndex(
              (obj) => obj.socketId === nsSocket.id && !obj.sender
            );
            if (!transports[i].transport.appData.connected) {
              console.log("first time connection");
              transports[i].transport.appData.connected = true;
              await transports[i].transport.connect({ dtlsParameters });
            }
          });

          nsSocket.on("getProducers", (callback) => {
            let currentProducers = [];
            producers.forEach((producer) => {
              currentProducers = [
                ...currentProducers,
                { id: producer.producer.id, kind: producer.producer.kind },
              ];
            });
            callback(currentProducers);
          });

          nsSocket.on(
            "consume",
            async ({ rtpCapabilities, producerId }, callback) => {
              try {
                // check if the router can consume the specified producer
                if (
                  namespaces[namespace].router.canConsume({
                    producerId: producerId,
                    rtpCapabilities,
                  })
                ) {
                  const i = transports.findIndex(
                    (obj) => obj.socketId === nsSocket.id && !obj.sender
                  );
                  // transport can now consume and return a consumer

                  const consumer = await transports[i].transport.consume({
                    producerId: producerId,
                    rtpCapabilities,
                    paused: true,
                  });

                  consumer.on("transportclose", () => {
                    console.log("transport close from consumer");
                  });

                  consumer.on("producerclose", () => {
                    console.log("producer of consumer closed");
                  });

                  // from the consumer extract the following params
                  // to send back to the Client
                  const params = {
                    id: consumer.id,
                    producerId: producerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    appData:
                      producers[
                        producers.findIndex((p) => p.producer.id === producerId)
                      ].producer.appData.mediaTag,
                    socketId:
                      producers[
                        producers.findIndex((p) => p.producer.id === producerId)
                      ].socketId,
                  };
                  consumers = [
                    ...consumers,
                    { consumer, socketId: nsSocket.id, producerId },
                  ];
                  // send the parameters to the client
                  callback({ params });
                }
              } catch (error) {
                console.log(error.message, error.stack);
                callback({
                  params: {
                    error: error,
                  },
                });
              }
            }
          );

          nsSocket.on("consumer-resume", async ({ producerId }) => {
            console.log("consumer resume ", producerId);
            await consumers[
              consumers.findIndex(
                (obj) =>
                  obj.socketId === nsSocket.id && obj.producerId === producerId
              )
            ].consumer.resume();
          });
        });
      }
      // Join the user to the namespace
      socket.emit("namespaceJoined", namespace);
    });

    const createWebRtcTransport = async (namespace, callback) => {
      try {
        // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
        const webRtcTransport_options = {
          listenIps: [
            {
              ip: "0.0.0.0", // replace with relevant IP address
              announcedIp: "127.0.0.1",
            },
          ],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        };

        // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
        let transport = await namespaces[
          namespace
        ].router.createWebRtcTransport(webRtcTransport_options);
        console.log(`transport id: ${transport.id}`);

        transport.on("dtlsstatechange", (dtlsState) => {
          if (dtlsState === "closed") {
            transport.close();
          }
        });

        transport.on("close", () => {
          console.log("transport closed");
        });

        // send back to the client the following prameters
        callback({
          // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
          params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          },
        });

        return transport;
      } catch (error) {
        console.log(error);
        callback({
          params: {
            error: error,
          },
        });
      }
    };
  });

  httpsServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on https://${hostname}:${port}`);
    });
});
