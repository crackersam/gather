import Navigation from "@/components/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

const LoggedInLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));
  if (!user?.username) {
    redirect("/username");
  }

  return (
    <div className="w-[100vw]">
      <Navigation
        session={session}
        expires={session.expires}
        image={user.image!}
      />
      {children}
    </div>
  );
};

export default LoggedInLayout;
