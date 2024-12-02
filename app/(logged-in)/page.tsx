import NewMeetingForm from "@/components/new-meeting-form";
import { db } from "@/server/db";
import { meetings, users } from "@/server/schema";
import { asc, count, eq, getTableColumns, gte } from "drizzle-orm";
import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import JoinButton from "@/components/join-button";
import Pagination from "@/components/Pagination";

const HomePage = async () => {
  const meets = await db
    .select({
      ...getTableColumns(meetings),
      username: users.username,
      image: users.image,
    })
    .from(meetings)
    .leftJoin(users, eq(meetings.admin, users.id))
    .where(gte(meetings.date, new Date(new Date().getTime() - 30 * 60 * 1000)))
    .orderBy(asc(meetings.date))
    .limit(10);
  const rows = await db
    .select({ count: count() })
    .from(meetings)
    .where(gte(meetings.date, new Date(new Date().getTime() - 30 * 60 * 1000)));

  return (
    <main className="flex flex-col m-4 items-center">
      <NewMeetingForm />
      <section className="flex items-center flex-col gap-2 justify-center">
        <h2 className="text-2xl font-semibold">Upcoming Meetings</h2>
        <ul className="flex flex-wrap w-[100vw] items-center justify-center">
          {meets.map((meet) => (
            <li
              key={meet.meetingId}
              className="relative flex rounded-md bg-gray-200 dark:bg-blue-900 border-yellow-500 border-2 p-3 m-2 w-[350px] h-[200px] items-center justify-evenly flex-col"
            >
              {meet.image ? (
                <Link href={`/bio/${meet.username}`}>
                  <Image
                    src={meet.image}
                    width={50}
                    height={50}
                    className="absolute top-[5px] left-[5px] rounded-full"
                    alt={""}
                  />
                </Link>
              ) : (
                <Link href={`/bio/${meet.username}`}>
                  <div className="absolute top-[5px] left-[5px] rounded-full border-2 border-slate-300 flex justify-center items-center w-10 h-10 bg-slate-300">
                    {meet.username ? meet.username[0] : ""}
                  </div>
                </Link>
              )}
              <h3 className="text-lg font-semibold">{meet.title}</h3>
              <p className="text-sm break-all">{meet.description}</p>
              <p className="text-sm">
                {meet.date ? format(meet.date, "PPPp") : "No date available"}
              </p>
              <p className="text-sm">
                <Link href={`/bio/${meet.username}`}>{meet.username}</Link>
              </p>
              <JoinButton id={meet.meetingId} />
            </li>
          ))}
        </ul>
        <Pagination finalPage={rows[0].count} />
      </section>
    </main>
  );
};

export default HomePage;
