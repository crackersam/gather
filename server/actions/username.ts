"use server";

import { actionClient } from "@/lib/safe-action";
import { usernameSchema } from "@/types/username-schema";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { db } from "../db";

export const usernameAction = actionClient
  .schema(usernameSchema)
  .action(async ({ parsedInput: { username, id } }) => {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    if (existingUser.length > 0) {
      return { error: "Username already exists" };
    } else {
      await db.update(users).set({ username }).where(eq(users.id, id!));
      return { success: "username set" };
    }
  });
