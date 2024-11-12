import NextAuth from "next-auth";
import { db } from "./db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.image = token.image as string;
      return session;
    },
  },
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      credentials: { email: {}, password: {}, token: {} },
      async authorize(credentials) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string));
        if (!user) throw new Error("Invalid credentials");
        if (!user.password) throw new Error("No password set, use Google");
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password!
        );
        if (!passwordMatch) throw new Error("Invalid credentials");
        if (user.twoFactorEnabled) {
          const tokenValid = authenticator.check(
            credentials.token as string,
            user.twoFactorSecret!
          );
          if (!tokenValid) throw new Error("Invalid token");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
});
