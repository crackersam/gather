"use client";
import React from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { joinMeeting } from "@/server/actions/join-meeting";

const JoinButton = ({ id }: { id: string }) => {
  const { toast } = useToast();

  const joinMeet = async (id: string) => {
    const res = await joinMeeting(id);
    if (res.error) {
      toast({ title: res.error, variant: "destructive" });
    }
    if (res.success) {
      toast({ title: res.success, className: "bg-green-500 text-white" });
    }
  };

  return <Button onClick={() => joinMeet(id)}>Join</Button>;
};

export default JoinButton;
