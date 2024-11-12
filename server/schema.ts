import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { ActionMetadataValidationError } from "next-safe-action";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  username: text("username").unique(),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false),
  twoFactorSecret: text("twoFactorSecret"),
  bio: text("bio"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);
export const meetings = pgTable("meeting", {
  admin: text("admin").references(() => users.id, { onDelete: "cascade" }),
  meetingId: text("meetingId")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title"),
  description: text("description"),
  date: timestamp("date", { mode: "date" }),
});
export const meetingMembers = pgTable(
  "meeting_member",
  {
    meetingId: text("meetingId").references(() => meetings.meetingId, {
      onDelete: "cascade",
    }),
    userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("member"),
    joinedAt: timestamp("joinedAt"),
  },
  (meetingMember) => ({
    compoundKey: primaryKey({
      columns: [meetingMember.meetingId, meetingMember.userId],
    }),
  })
);
