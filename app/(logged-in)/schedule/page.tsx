import JoinRoomButton from "@/components/join-room-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { meetingMembers, meetings, users } from "@/server/schema";
import { format } from "date-fns";
import { eq, asc, desc, count } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import Pagination from "../../../components/Pagination";

const Schedule = async ({ searchParams }: any) => {
  const { page } = (await searchParams) || 1;
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
    .orderBy(desc(meetings.date))
    .limit(10)
    .offset((page - 1) * 10);
  const rows = await db
    .select({ count: count() })
    .from(meetingMembers)
    .where(eq(meetingMembers.userId, userId));
  const totalCourses = rows[0].count;
  console.log(Math.ceil(totalCourses / 10));

  return (
    <main className="flex flex-col m-4 items-center">
      <section className="flex items-center flex-col gap-2 justify-center">
        <h2 className="text-2xl font-semibold">My Meetings</h2>
        <ul className="flex flex-wrap w-[100vw] items-center justify-center">
          {meets.map((meet) => (
            <li
              key={meet.meeting?.meetingId}
              className=" relative flex rounded-md bg-gray-200 dark:bg-blue-900 border-yellow-500 border-2 p-3 m-2 w-[350px] h-[200px] items-center justify-evenly flex-col"
            >
              {meet.user?.image ? (
                <Link href={`/bio/${meet.user?.username}`}>
                  <Image
                    src={meet.user?.image}
                    width={50}
                    height={50}
                    className="absolute top-[5px] left-[5px] rounded-full"
                    alt={""}
                  />
                </Link>
              ) : (
                <Link href={`/bio/${meet.user?.username}`}>
                  <div className="absolute top-[5px] left-[5px] rounded-full border-2 border-slate-300 flex justify-center items-center w-10 h-10 bg-slate-300">
                    {meet.user?.username ? meet.user.username[0] : ""}
                  </div>
                </Link>
              )}

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
        <Pagination finalPage={Math.ceil(totalCourses / 10)} />
      </section>
    </main>
  );
};

export default Schedule;
