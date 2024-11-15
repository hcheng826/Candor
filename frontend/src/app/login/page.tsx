"use client";
import { BgImage } from "../Home";
import { ShadowedContainer } from "@/components/Container";
import { LoginWallet } from "@/components/LoginWallet";
import { useWallet } from "@/hooks/useWallet";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const params = useSearchParams();
  const target = params.get("target");
  const { walletAddress } = useWallet();
  const router = useRouter();

  console.log('walletAddress: ', walletAddress)

  useEffect(() => {
    if (target === "dashboard" && !!walletAddress) {
      console.log("redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [target, walletAddress]);

  useEffect(() => {
    if (target === "donation-widget" && !!walletAddress) {
      console.log("redirecting to donation-widget");
      router.replace("/donation-widget");
    }
  }, [target, walletAddress]);

  return (
    <div className="w-full h-full min-h-screen flex justify-center items-center">
      <BgImage />

      <ShadowedContainer className="w-full max-w-[560px] min-h-[620px]">
        <LoginWallet />
      </ShadowedContainer>
    </div>
  );
}
