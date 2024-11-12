import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/server/db";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/server/auth";
import ProfileForm from "@/components/settings-form";
import TwoFactorForm from "@/components/two-factor-form";

const ProfilePage = async () => {
  const session = await auth();

  if (!session || !session.user) {
    return null;
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id!));
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Welcome to your settings page</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm">Email: {user.email} </p>
        <p className="text-sm">Username: {user.username}</p>
        <div className="text-sm flex gap-4 items-center">
          Two Factor Auth:{" "}
          {user.password === null ? (
            "Unavailable"
          ) : user.twoFactorEnabled ? (
            <TwoFactorForm enabled={true} />
          ) : (
            <TwoFactorForm enabled={false} />
          )}
        </div>

        <ProfileForm session={session} image={user.image!} />
      </CardContent>
    </Card>
  );
};

export default ProfilePage;
