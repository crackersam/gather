"use client";
import { AiOutlineCalendar } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { GoSignOut, GoGear } from "react-icons/go";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Session } from "next-auth";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

const Navigation = ({
  session,
  expires,
  image,
}: {
  session: Session;
  expires: string;
  image: string;
}) => {
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  return (
    <nav className="w-full flex justify-between items-center p-4">
      <Link href="/">Home</Link>
      <DropdownMenu>
        <DropdownMenuTrigger>
          {image ? (
            <Image
              width={40}
              className="rounded-full"
              height={40}
              src={image}
              alt={"User Avatar"}
            />
          ) : (
            <div className="rounded-full bg-red-400 w-10 h-10 flex justify-center items-center text-2xl">
              {session?.user?.name?.[0] ?? "U"}
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="flex justify-center items-center bg-yellow-400 rounded-md p-4">
            {image ? (
              <Image
                src={image}
                className="rounded-full"
                alt={"User Avatar"}
                width={50}
                height={50}
              />
            ) : (
              <div className="rounded-full bg-red-400 w-10 h-10 flex justify-center items-center text-2xl">
                {session?.user?.name?.[0] ?? "U"}
              </div>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <GoGear />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/bio")}>
            <CgProfile />
            Bio
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/schedule")}>
            <AiOutlineCalendar />
            Schedule
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
            }}
          >
            <SunIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <MoonIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            {theme === "dark" ? "Light" : "Dark"} Mode
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()}>
            <GoSignOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default Navigation;
