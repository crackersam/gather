import NewMeetingForm from "@/components/new-meeting-form";
import { db } from "@/server/db";
import { meetings, users } from "@/server/schema";
import { asc, eq, getTableColumns, gte } from "drizzle-orm";
import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import JoinButton from "@/components/join-button";

const HomePage = async () => {
  const meets = await db
    .select({ ...getTableColumns(meetings), username: users.username })
    .from(meetings)
    .leftJoin(users, eq(meetings.admin, users.id))
    .where(gte(meetings.date, new Date(new Date().getTime() - 30 * 60 * 1000)))
    .orderBy(asc(meetings.date))
    .limit(10);

  return (
    <main className="flex flex-col m-4 items-center">
      <NewMeetingForm />
      <section className="flex items-center flex-col gap-2 justify-center">
        <h2 className="text-2xl font-semibold">Upcoming Meetings</h2>
        <ul className="flex flex-wrap w-[100vw] items-center justify-center">
          {meets.map((meet) => (
            <li
              key={meet.meetingId}
              className="flex rounded-md bg-gray-200 dark:bg-blue-900 border-yellow-500 border-2 p-3 m-2 w-[350px] h-[200px] items-center justify-evenly flex-col"
            >
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
      </section>
    </main>
  );
};

export default HomePage;
