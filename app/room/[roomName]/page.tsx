import React from "react";
import { db } from "@/server/db";
import { meetings, users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import RoomNamed from "./RoomNamed";
import { auth } from "@/server/auth";

const Room = async ({ params }: { params: Promise<{ roomName: string }> }) => {
  const roomName = (await params).roomName;
  const session = await auth();

  if (!session) {
    redirect("/login");
    return null;
  }

  if (!session.user) {
    redirect("/login");
    return null;
  }

  const roomNamed = await db
    .select()
    .from(meetings)
    .where(eq(meetings.meetingId, roomName))
    .leftJoin(users, eq(users.id, session.user?.id ?? ""));

  if (roomNamed.length === 0) {
    redirect("/404");
  }
  return (
    <RoomNamed
      roomName={roomName!}
      isAdmin={session?.user?.id === roomNamed[0].meeting.admin}
      username={roomNamed[0].user?.username}
    />
  );
};

export default Room;
