"use client";
import { PrimaryButton } from "@/components/Button/PrimaryButton";
import { ShadowedContainer } from "@/components/Container";
import { UserWallet } from "@/components/LoginWallet/UserWallet";
import { Spinner, Textarea } from "@chakra-ui/react";
import { ChevronLeftIcon, CircleAlertIcon } from "lucide-react";
import { BeneficiaryCard } from "./ChoosePool";
import { Beneficiary } from "@/types";
import { APP_CONFIG } from "@/config";
import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";
import React, { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import {
  MiniKit,
  ResponseEvent,
  VerifyCommandInput,
} from "@worldcoin/minikit-js";

const WORLD_ID_ACTION = "give-social-pledge";

export const Pledge = ({
  onGoBack,
  beneficiary,
  onPledge,
  isLoading,
}: {
  onGoBack: () => void;
  beneficiary: Beneficiary;
  onPledge: (proof: ISuccessResult, rating: number, comments: string) => void;
  isLoading?: boolean;
}) => {
  const [rating, setRatings] = useState(5);
  const [comments, setComments] = useState("");
  const [proof, setProof] = useState<ISuccessResult | null>(null);
  const { isMiniApp } = useWallet();

  const onSuccess = () => {
    console.log("success");
    onPledge(proof as ISuccessResult, rating, comments);
  };

  const minikitSendVerifyAction = async () => {
    const verifyPayload: VerifyCommandInput = {
      action: WORLD_ID_ACTION,
      verification_level: VerificationLevel.Device,
      // signal: '0x12312', // Optional
    };

    //send verift command
    const payload = await MiniKit.commandsAsync.verify(verifyPayload);
    console.log("minikit payload: ", payload);
    onPledge(payload.finalPayload as ISuccessResult, rating, comments);
  };

  //testing here: https://simulator.worldcoin.org/select-id
  const verifyProof = async (proof: ISuccessResult) => {
    // //Verify proof with backend
    // const verifyRes = await axios.get(
    //   "https://eth-bkk-be.vercel.app//verify-proof",
    //   {
    //     params: {
    //       proof,
    //       action: WORLD_ID_ACTION,
    //     },
    //   }
    // );

    console.log("verified proof res: ", proof);
    setProof(proof);
  };

  // //subscribe to minikit verify action
  // useEffect(() => {
  //   if (!isMiniApp) {
  //     return;
  //   }

  //   MiniKit.subscribe(ResponseEvent.MiniAppVerifyAction, async (payload) => {
  //     if (payload.status === "error") {
  //       return console.log("Error payload", payload);
  //     }

  //     console.log("minikit payload: ", payload);
  //   });

  //   return () => {
  //     // Clean up on unmount
  //     MiniKit.unsubscribe(ResponseEvent.MiniAppVerifyAction);
  //   };
  // }, []);

  const finalDisabled = comments.length === 0 || isLoading;

  return (
    <ErrorBoundary>
      <ShadowedContainer className="w-[90%] max-w-[560px] min-h-[360px]">
        <div className="flex justify-between items-center  mb-6 px-4">
          <div className="flex items-center gap-2">
            <button onClick={onGoBack}>
              <ChevronLeftIcon />
            </button>
            <div className="text-2xl font-bold text-center">Give Pledge</div>
          </div>
          <UserWallet />
        </div>

        <div className="px-4 [&>div]:min-h-[120px]">
          <BeneficiaryCard beneficiary={beneficiary} />
        </div>

        <div className="px-4 mt-2">
          <div className="text-lg text-gray-500">Give your comments</div>
          <Textarea
            className="border border-gray-400 rounded-lg p-2 mt-2 resize-none w-full h-[140px]"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Your comments"
          />
          <div className="text-xs flex items-center text-[#d05c12]">
            <CircleAlertIcon
              className="w-4 mr-1 inline-block"
              color="#d05c12"
            />
            Powered by Sign Protocol
          </div>

          {!isMiniApp && (
            <IDKitWidget
              app_id={APP_CONFIG.worldAppId as `app_${string}`}
              action={WORLD_ID_ACTION}
              onSuccess={() => onSuccess()}
              handleVerify={verifyProof}
              verification_level={VerificationLevel.Device}
            >
              {({ open }) => (
                <PrimaryButton
                  className="w-full mt-6"
                  disableShadow
                  onClick={open}
                  disabled={finalDisabled}
                  isLoading={isLoading}
                >
                  Pledge (Verify with World ID)
                </PrimaryButton>
              )}
            </IDKitWidget>
          )}
          {isMiniApp && (
            <PrimaryButton
              className="w-full mt-6"
              disableShadow
              disabled={finalDisabled}
              onClick={minikitSendVerifyAction}
              isLoading={isLoading}
            >
              Pledge (Verify inside MiniApp)
            </PrimaryButton>
          )}
        </div>
      </ShadowedContainer>
    </ErrorBoundary>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log("error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error</div>;
    }

    return this.props.children;
  }
}
