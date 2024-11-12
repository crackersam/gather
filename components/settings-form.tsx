"use client";
import React, { useEffect } from "react";
import { set, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { profileFormSchema } from "@/types/profile-form-schema";
import { useAction } from "next-safe-action/hooks";
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
import { Session } from "next-auth";
import Image from "next/image";
import { UploadButton } from "@/app/api/uploadthing/upload";
import { profileAction } from "@/server/actions/profile";
import { useToast } from "@/hooks/use-toast";

const ProfileForm = ({
  session,
  image,
}: {
  session: Session;
  image: string;
}) => {
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      password: null,
      newPassword: null,
      newPasswordConfirmation: null,
      image: "",
      // bio: "",
      id: session.user?.id,
    },
  });
  const { execute, status } = useAction(profileAction, {
    onSuccess: (data) => {
      if (data?.data?.error) {
        toast({ title: data.data.error, variant: "destructive" });
      }
      if (data?.data?.success) {
        toast({
          title: data.data?.success,
          className: "bg-green-500 text-white",
        });
      }
    },
  });
  const user = session.user;

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    execute(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <div className="flex flex-row items-center">
                {!image ? (
                  <div className="rounded-full bg-red-400 w-10 h-10 flex justify-center items-center text-2xl">
                    {user?.name?.[0]}
                  </div>
                ) : !form.getValues("image") ? (
                  <Image
                    src={image}
                    alt={"User Avatar"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <Image
                    src={form.getValues("image")!}
                    alt={"User Avatar"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}

                <UploadButton
                  endpoint={"avatarUploader"}
                  onClientUploadComplete={(res) => {
                    console.log(res[0].url);
                    form.setValue("image", res[0].url);
                    setAvatarUploading(false);
                  }}
                  onUploadBegin={() => setAvatarUploading(true)}
                  className="scale-75"
                />
              </div>
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password:</FormLabel>
              <FormControl>
                <Input
                  placeholder="******"
                  type="password"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password:</FormLabel>
              <FormControl>
                <Input
                  placeholder="******"
                  type="password"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPasswordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password:</FormLabel>
              <FormControl>
                <Input
                  placeholder="******"
                  type="password"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button disabled={avatarUploading === true} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
