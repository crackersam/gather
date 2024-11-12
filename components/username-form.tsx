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

const UsernameForm = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
      id: id,
    },
  });

  const { execute, status } = useAction(usernameAction, {
    onSuccess: (data) => {
      if (data?.data?.error) {
        form.setError("username", { message: data.data.error });
      }
      if (data?.data?.success) {
        toast({
          title: data?.data?.success,
          className: "bg-green-500 text-white",
        });
        router.push("/");
      }
    },
  });

  function onSubmit(values: z.infer<typeof usernameSchema>) {
    execute(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default UsernameForm;
