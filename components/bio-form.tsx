"use client";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { usernameSchema } from "@/types/username-schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import { usernameAction } from "@/server/actions/username";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { bioSchema } from "@/types/bio-schema";
import { bioAction } from "@/server/actions/bio";

const BioForm = ({ biography }: { biography: string }) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof bioSchema>>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      bio: biography,
    },
  });

  const { execute, status } = useAction(bioAction, {
    onSuccess: (data) => {
      if (data?.data?.success) {
        toast({
          title: data?.data?.success,
          className: "bg-green-500 text-white",
        });
        router.push("/");
      }
    },
  });

  function onSubmit(values: z.infer<typeof bioSchema>) {
    execute(values);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-[80%]"
      >
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} className="w-full h-[100px]" />
              </FormControl>
              <FormDescription>Tell us about yourself.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="flex-0" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default BioForm;
