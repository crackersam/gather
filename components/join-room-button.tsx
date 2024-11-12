"use client";
import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const JoinRoomButton = ({ url }: { url: string }) => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push(url)}
      className="bg-green-600 text-white"
    >
      Join Room
    </Button>
  );
};

export default JoinRoomButton;
