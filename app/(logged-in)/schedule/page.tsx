import JoinRoomButton from "@/components/join-room-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { meetingMembers, meetings, users } from "@/server/schema";
import { format } from "date-fns";
import { eq, asc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const Schedule = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }
  const meets = await db
    .select()
    .from(meetingMembers)
    .leftJoin(meetings, eq(meetingMembers.meetingId, meetings.meetingId))
    .leftJoin(users, eq(meetings.admin, users.id))
    .where(eq(meetingMembers.userId, userId))
    .orderBy(asc(meetings.date));
  return (
    <main className="flex flex-col m-4 items-center">
      <section className="flex items-center flex-col gap-2 justify-center">
        <h2 className="text-2xl font-semibold">My Meetings</h2>
        <ul className="flex flex-wrap w-[100vw] items-center justify-center">
          {meets.map((meet) => (
            <li
              key={meet.meeting?.meetingId}
              className="flex rounded-md bg-gray-200 dark:bg-blue-900 border-yellow-500 border-2 p-3 m-2 w-[350px] h-[200px] items-center justify-evenly flex-col"
            >
              <h3 className="text-lg font-semibold">{meet.meeting?.title}</h3>
              <p className="text-sm break-all">{meet.meeting?.description}</p>
              <p className="text-sm">
                {meet.meeting?.date
                  ? format(meet.meeting?.date, "PPPp")
                  : "No date available"}
              </p>
              {meet.meeting?.date &&
              new Date(meet.meeting.date).getTime() - 30 * 60 * 1000 <=
                new Date().getTime() &&
              new Date(meet.meeting.date).getTime() + 120 * 60 * 1000 >=
                new Date().getTime() ? (
                <JoinRoomButton url={`/room/${meet.meeting?.meetingId}`} />
              ) : null}

              <p className="text-sm">
                <Link href={`/bio/${meet.user?.username}`}>
                  {meet.user?.username}
                </Link>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default Schedule;
