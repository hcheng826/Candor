import { DynamicEmbeddedWidget } from "@dynamic-labs/sdk-react-core";
import { Container } from "@chakra-ui/react";
import { useWallet } from "@/hooks/useWallet";
import { MiniKit } from "@worldcoin/minikit-js";
import { PrimaryButton } from "../Button/PrimaryButton";
import { toaster, Toaster } from "../ui/toaster";

export const LoginWallet = ({
  title = "Connect Your Wallet",
}: {
  title?: string;
}) => {
  const { walletAddress, isMiniApp, localNonce } = useWallet();

  const signInWithWorldIdWallet = async () => {
    if (!isMiniApp || !localNonce) {
      return;
    }

    const { commandPayload: generateMessageResult, finalPayload } =
      await MiniKit.commandsAsync.walletAuth({
        nonce: localNonce,
        requestId: "0", // Optional
        expirationTime: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000
        ),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement:
          "This is my statement and here is a link https://worldcoin.com/apps",
      });

    if (finalPayload.status === "error") {
      toaster.create({
        title: "Error logging in!",
        description: "There was something wrong with your request",
        placement: "top-end",
        type: "error",
      });
      return;
    } else {
      toaster.create({
        title: "You have successfully logged in!",
        description: "You have successfully logged in",
        placement: "top-end",
        type: "success",
      });
    }
  };

  return (
    <Container className="w-full max-w-[512px] bg-white">
      <div className="text-2xl font-bold text-center mb-6">{title}</div>

      {/* {isMiniApp && (
        <PrimaryButton onClick={signInWithWorldIdWallet}>
          Connect with WorldID
        </PrimaryButton>
      )} */}
      {/* {!isMiniApp && <DynamicEmbeddedWidget />} */}
      <DynamicEmbeddedWidget />
    </Container>
  );
};
