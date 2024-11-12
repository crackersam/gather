"use server";
import { actionClient } from "@/lib/safe-action";
import { profileFormSchema } from "@/types/profile-form-schema";
import { db } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export const profileAction = actionClient.schema(profileFormSchema).action(
  async ({
    parsedInput: {
      password,
      newPassword,
      newPasswordConfirmation,
      image,
      // bio,
      id,
    },
  }) => {
    // Update the user's profile
    if (image) {
      await db
        .update(users)
        .set({
          image,
        })
        .where(eq(users.id, id!));
    }
    if (newPasswordConfirmation && newPassword && password) {
      const [user] = await db.select().from(users).where(eq(users.id, id!));
      if (!user.password) {
        return { error: "User password not found" };
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return { error: "Incorrect password" };
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db
        .update(users)
        .set({
          password: hashedPassword,
        })
        .where(eq(users.id, id!));
    }
    revalidatePath("/profile");
    return { success: "Profile updated" };
  }
);
