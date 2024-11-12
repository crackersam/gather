"use client";
import React from "react";
import { Button } from "./ui/button";
import {
  disable2FA,
  enable2FA,
  get2FASecret,
} from "@/server/actions/two-factor";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const TwoFactorForm = ({ enabled }: { enabled: boolean }) => {
  const { toast } = useToast();
  const [isActivated, setIsActivated] = React.useState(enabled);
  const [step, setStep] = React.useState(1);
  const [code, setCode] = React.useState("");
  const [otp, setOTP] = React.useState("");
  const handleClick = async () => {
    const response = await get2FASecret();
    if (response.error) {
      toast({
        variant: "destructive",
        title: response.error,
      });
      return;
    }
    setStep(2);
    setCode(response.twoFactorSecret ?? "");
  };
  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await enable2FA(otp);
    if (response?.error) {
      toast({
        variant: "destructive",
        title: response.error,
      });
      return;
    }
    toast({
      className: "bg-green-500 text-white",
      title: "Two Factor Auth enabled",
    });
    setIsActivated(true);
    setCode("");
    setStep(1);
  };
  const disable2fa = async () => {
    const response = await disable2FA();
    if (response.success) {
      toast({
        className: "bg-green-500 text-white",
        title: response.success,
      });
    }
    setIsActivated(false);
  };

  return (
    <div className="flex-1">
      {step === 1 && (
        <Button
          variant={isActivated ? "destructive" : "default"}
          onClick={!isActivated ? () => handleClick() : () => disable2fa()}
          size={"sm"}
        >
          {isActivated ? "Disable" : "Enable"} Two Factor Auth
        </Button>
      )}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center w-full">
          <p className="py-2 text-xs text-muted-foreground">
            Scan the QR code below with your authenticator app to activate 2FA
            for your Gather account.
          </p>
          <QRCodeSVG value={code} />
          <div className="flex my-2 flex-row gap-4">
            <Button onClick={() => setStep(3)}>Scanned</Button>
            <Button onClick={() => setStep(1)} variant={"outline"}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      {step === 3 && (
        <form
          onSubmit={handleOTPSubmit}
          className="flex flex-col items-center justify-center"
        >
          <p className="my-4 text-xs text-muted-foreground">
            Enter the code from your authenticator app to complete the setup.
          </p>
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
          <div className="flex my-4 flex-row gap-4">
            <Button disabled={otp.length !== 6} type="submit">
              Submit and Activate
            </Button>
            <Button onClick={() => setStep(2)} variant={"outline"}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TwoFactorForm;
