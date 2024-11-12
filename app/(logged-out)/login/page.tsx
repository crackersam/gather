"use client";
import { FcGoogle } from "react-icons/fc";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/types/login-schema";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { loginAction } from "@/server/actions/login";
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
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

const LoginPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [otp, setOTP] = React.useState("");
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      token: otp,
    },
  });
  const { execute, status } = useAction(loginAction, {
    onSuccess: (data) => {
      if (data?.data?.error) {
        form.setError("root", { message: data.data.error });
      }
      if (data?.data?.twoFactorRequired) {
        setStep(2);
      }
      if (data?.data?.success) {
        toast({
          title:
            data?.data?.success === true
              ? "Login successful"
              : data?.data?.success,
          className: "bg-green-500 text-white",
        });
        router.push("/");
      }
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    execute({ email: values.email, password: values.password, token: otp });
  }
  return (
    <main className="flex items-center justify-center h-screen">
      {step === 1 && (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Login to your acccount here</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@doe.com" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="******"
                          type="password"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!!form.formState.errors.root?.message && (
                  <FormMessage>
                    {form.formState.errors.root.message}
                  </FormMessage>
                )}
                <Button className="w-full" type="submit">
                  Submit
                </Button>
              </form>
            </Form>
            <Button
              className="mt-4 flex justify-center items-center w-full"
              variant={"outline"}
              onClick={() =>
                signIn("google", {
                  redirect: true,
                  callbackUrl: "/username",
                })
              }
            >
              Signin with Google
              <FcGoogle />
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs">
              Want an account?{" "}
              <Link className="underline text-blue-600" href="/register">
                Click here to go to the Register page
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      )}
      {step === 2 && (
        <Card className="w-[350px]">
          <CardHeader>
            Two factor authentication
            <CardDescription>
              Enter the one-time-passcode displayed on your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-2 items-center"
              >
                <InputOTP maxLength={6} value={otp} onChange={setOTP}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {!!form.formState.errors.root?.message && (
                  <FormMessage>
                    {form.formState.errors.root.message}
                  </FormMessage>
                )}
                <Button disabled={otp.length !== 6} type="submit">
                  Verify OTP
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default LoginPage;
