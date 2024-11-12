"use server";

import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { users } from "../schema";
import { authenticator } from "otplib";

export const get2FASecret = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const [user] = await db
    .select({ twoFactorSecret: users.twoFactorSecret, email: users.email })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user) {
    return { error: "User not found" };
  }
  let twoFactorSecret = user.twoFactorSecret;
  if (!twoFactorSecret) {
    twoFactorSecret = authenticator.generateSecret();
    await db
      .update(users)
      .set({ twoFactorSecret })
      .where(eq(users.id, session.user.id));
  }
  if (!user.email) {
    return { error: "User email not found" };
  }
  return {
    twoFactorSecret: authenticator.keyuri(
      user.email,
      "Gather",
      twoFactorSecret
    ),
  };
};

export const enable2FA = async (token: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const [user] = await db
    .select({ twoFactorSecret: users.twoFactorSecret, email: users.email })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user) {
    return { error: "User not found" };
  }
  if (user.twoFactorSecret) {
    const isValid = authenticator.check(token, user.twoFactorSecret);
    if (!isValid) {
      return { error: "Invalid token" };
    }
    await db
      .update(users)
      .set({ twoFactorEnabled: true })
      .where(eq(users.id, session.user.id));
  }
};
export const disable2FA = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  await db
    .update(users)
    .set({ twoFactorEnabled: false })
    .where(eq(users.id, session.user.id));
  return { success: "Two Factor Authentication disabled" };
};
