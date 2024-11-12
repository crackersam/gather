"use server";
import { actionClient } from "@/lib/safe-action";
import { loginSchema } from "@/types/login-schema";
import { signIn } from "../auth";
import { AuthError } from "next-auth";
import { db } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password, token } }) => {
    console.log(email, password, token);

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      if (!user) {
        return { error: "Invalid credentials" };
      }
      if (!user.twoFactorEnabled && !token) {
        if (await bcrypt.compare(password, user.password!)) {
          await signIn("credentials", {
            email,
            password,
            token,
            redirect: false,
          });
          return { success: true };
        }
      }
      if (user.twoFactorEnabled && !token) {
        return { twoFactorRequired: true };
      }
      if (user.twoFactorEnabled && token) {
        console.log("checking token");
        await signIn("credentials", {
          email,
          password,
          token,
          redirect: false,
        });
        return { success: true };
      }
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          error: error.cause?.err?.message ?? "An unknown error occurred",
        };
      }
      if (error instanceof Error) {
        return { error: error.message };
      } else {
        return { error: "An unknown error occurred" };
      }
    }
  });
