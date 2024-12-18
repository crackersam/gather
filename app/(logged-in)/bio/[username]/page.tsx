import { db } from "@/server/db";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BioWithSlug = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const username = (await params).username;
  const [user] = await db
    .select({ bio: users.bio, image: users.image })
    .from(users)
    .where(eq(users.username, username));
  if (!user) {
    redirect("/404");
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>{username}'s bio</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-2">
        {user.image ? (
          <Image
            src={user.image ?? ""}
            alt={username}
            width={100}
            height={100}
            className="rounded-full"
          />
        ) : (
          <div className="w-24 h-24 flex justify-center items-center text-5xl bg-gray-300 rounded-full">
            {username ? username[0] : ""}
          </div>
        )}
        <p>{user.bio}</p>
      </CardContent>
    </Card>
  );
};

export default BioWithSlug;
