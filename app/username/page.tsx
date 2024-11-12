import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UsernameForm from "@/components/username-form";

const UsernamePage = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return null;
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id!));
  console.log(user.username);
  if (user.username === null) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Username</CardTitle>
          <CardDescription>Choose a username for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <UsernameForm id={user.id} />
        </CardContent>
      </Card>
    );
  } else {
    redirect("/");
  }
};

export default UsernamePage;
