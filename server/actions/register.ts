"use server";
import { actionClient } from "@/lib/safe-action";
import { registerSchema } from "@/types/register-schema";
import { db } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const registerAction = actionClient
  .schema(registerSchema)
  .action(
    async ({
      parsedInput: { email, password, passwordConfirmation, username },
    }) => {
      try {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.name, username));
        if (existingUser.length > 0) {
          return { usernameError: "Username already exists" };
        }
        const existingEmail = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
        if (existingEmail.length > 0) {
          return { emailError: "Email already exists" };
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db
          .insert(users)
          .values({ email, password: hashedPassword, name: username });
        return { success: "User created successfully" };
      } catch (error) {
        return { error: (error as Error).message };
      }
    }
  );
