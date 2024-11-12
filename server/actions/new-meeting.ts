"use server";

import { actionClient } from "@/lib/safe-action";
import { newMeetingSchema } from "@/types/new-meeting-schema";
import { auth } from "../auth";
import { db } from "../db";
import { meetings } from "../schema";
import { revalidatePath } from "next/cache";

export const newMeetingAction = actionClient
  .schema(newMeetingSchema)
  .action(async ({ parsedInput: { title, description, date } }) => {
    const session = await auth();
    const id = session?.user?.id;
    if (!id) {
      return { error: "Unauthorized" };
    }
    await db.insert(meetings).values({
      admin: id,
      title,
      description,
      date,
    });
    revalidatePath("/");
    return { success: "Meeting created" };
  });
