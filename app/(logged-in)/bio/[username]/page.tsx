import { db } from "@/server/db";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BioWithSlugProps {
  params: {
    username: string;
  };
}

const BioWithSlug = async ({ params }: BioWithSlugProps) => {
  const { username } = await params;
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
        <Image
          src={user.image ?? ""}
          alt={username}
          width={100}
          height={100}
          className="rounded-full"
        />
        <p>{user.bio}</p>
      </CardContent>
    </Card>
  );
};

export default BioWithSlug;
