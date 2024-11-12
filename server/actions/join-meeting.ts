"use server";

import { eq, and } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { meetingMembers } from "../schema";

export const joinMeeting = async (meetingId: string) => {
  const session = await auth();
  if (!session) {
    return { error: "You must be logged in to join a meeting" };
  }
  if (!session.user?.id) {
    return { error: "User ID is undefined" };
  }
  const meeting = await db
    .select()
    .from(meetingMembers)
    .where(
      and(
        eq(meetingMembers.meetingId, meetingId),
        eq(meetingMembers.userId, session.user.id)
      )
    );
  if (meeting.length) {
    return { error: "You have already joined this meeting" };
  }
  await db.insert(meetingMembers).values({
    meetingId,
    userId: session.user?.id,
  });
  return { success: "You have joined the meeting" };
};
