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
    .select({ image: users.image, bio: users.bio })
    .from(users)
    .where(eq(users.id, session?.user?.id ?? ""));
  return (
    <main className="flex flex-col m-4 items-center">
      <Image
        src={user.image!}
        alt="User avatar"
        width={100}
        height={100}
        className="rounded-full"
      />
      <BioForm biography={user.bio!} />
    </main>
  );
};

export default BioPage;
