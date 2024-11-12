"use server";

import { actionClient } from "@/lib/safe-action";
import { bioSchema } from "@/types/bio-schema";
import { db } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { auth } from "../auth";

export const bioAction = actionClient
  .schema(bioSchema)
  .action(async ({ parsedInput: { bio } }) => {
    const session = await auth();
    await db
      .update(users)
      .set({ bio })
      .where(eq(users.id, session?.user?.id ?? ""));
    return { success: "Bio updated" };
  });
