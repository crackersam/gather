import BioForm from "@/components/bio-form";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import React from "react";

const BioPage = async () => {
  const session = await auth();
  const [user] = await db
    .select({ image: users.image, bio: users.bio, username: users.username })
    .from(users)
    .where(eq(users.id, session?.user?.id ?? ""));
  return (
    <main className="flex flex-col m-4 items-center">
      {user.image ? (
        <Image
          src={user.image ?? null}
          alt="User avatar"
          width={100}
          height={100}
          className="rounded-full"
        />
      ) : (
        <div className="w-24 h-24 bg-gray-300 rounded-full">
          {user.username ? user.username[0] : ""}
        </div>
      )}
      <BioForm biography={user.bio!} />
    </main>
  );
};

export default BioPage;
