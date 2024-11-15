"use client";
import { BgImage } from "../Home";
import { useSmartWallet, useWallet } from "@/hooks/useWallet";
import { Beneficiary } from "@/types";
import { useState } from "react";
import { ChoosePool } from "./ChoosePool";
import { default as LoginPage } from "@/app/login/page";
import { Donate } from "./Donate";
import { Pledge } from "./Pledge";
import { SuccessDonation } from "./SuccessDonation";
import { SuccessPledge } from "./SuccessPledge";
import dynamic from "next/dynamic";
import { ISuccessResult } from "@worldcoin/idkit";
import { toaster } from "@/components/ui/toaster";
import {
  approve,
  attestPledge,
  donateByBaseCurrency,
} from "@/contracts/interact/candor";
import { encodeWorldcoinProof } from "@/contracts/interact/worldcoin";
import { encodeSPCandorPledge } from "@/contracts/interact/sign-protocol";
import { toWei } from "@/utils";
import { addressToToken } from "@/config";
import { getCandorAddress } from "@/utils/address";

const PledgeDynamic = dynamic(
  () => import("./Pledge").then((mod) => mod.Pledge),
  {
    ssr: false,
  }
);

export default function DonationWidget() {
  const { network, walletAddress } = useWallet();
  const { smartAccount } = useSmartWallet();
  const [chosenBeneficiary, setChosenBeneficiary] =
    useState<Beneficiary | null>(null);
  const [screen, setScreen] = useState<
    "donate" | "pledge" | "donation-success" | "pledge-success" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const onChooseDonate = (beneficiary: Beneficiary) => {
    setScreen("donate");
    setChosenBeneficiary(beneficiary);
  };

  const onChoosePledge = (beneficiary: Beneficiary) => {
    setScreen("pledge");
    setChosenBeneficiary(beneficiary);
  };

  const onGoBack = () => {
    setScreen(null);
    setChosenBeneficiary(null);
  };

  const onDonate = async ({
    tokenAddress,
    amount,
  }: {
    tokenAddress: string;
    amount: number;
  }) => {
    console.log(
      `ondonate for ${tokenAddress}, ${amount}, ${chosenBeneficiary?.id}`
    );
    console.log(smartAccount);
    if (!smartAccount || !chosenBeneficiary || !network) return;
    //TODO: handle when donating to generic pool
    try {
      setIsLoading(true);
      const token = addressToToken(tokenAddress, smartAccount.chain!.id);
      if (token == null) {
        console.error(`no token for ${tokenAddress}, ${smartAccount.chain}`);
        return;
      }

      const weiAmount = toWei(amount, token.decimals);
      const candorAddy = getCandorAddress(network);
      console.log("approve", token, weiAmount, "spender", candorAddy);

      const txs = [
        // 1. approve token for x amount
        approve(tokenAddress, weiAmount, candorAddy),
        // 2. donate via base currency
        donateByBaseCurrency(network, Number(chosenBeneficiary.id), weiAmount),
      ];
      console.log("txs", txs);

      // via nexus
      const hash = await smartAccount.sendTransaction({
        calls: txs,
      });
      console.log("tx hash: ", hash);
      const receipt = await smartAccount.waitForTransactionReceipt({ hash });
      console.log("tx receipt: ", receipt);

      // via legacy
      // const { wait, waitForTxHash } = await smartAccount.sendTransaction(txs, {
      //   paymasterServiceData: {
      //     mode: PaymasterMode.SPONSORED,
      //   },
      //   simulationType: "validation_and_execution",
      // });

      // const { reason } = await wait();
      // console.log("reason: ", reason);
      // const { transactionHash } = await waitForTxHash();
      // console.log(transactionHash);
      setIsLoading(false);

      toaster.create({
        title: "You have successfully donated!",
        description: "You have successfully donated",
        placement: "top-end",
        type: "success",
      });
      setScreen("donation-success");
      return;
    } catch (e) {
      console.error("Error sending transaction", e);
      setIsLoading(false);
      toaster.create({
        title: "Donation failed!",
        description: "There was something wrong with your request",
        placement: "top-end",
        type: "error",
      });
    }
  };

  const onPledge = async (
    proof: ISuccessResult,
    rating: number,
    comments: string
  ) => {
    console.log(`onpledge for ${proof}, ${comments}, ${chosenBeneficiary?.id}`);
    console.log(smartAccount);
    if (!smartAccount || !chosenBeneficiary || !network) return;

    const encodedProof = encodeWorldcoinProof();
    const pledgeData = encodeSPCandorPledge(rating, comments);
    console.log("data", encodedProof, pledgeData);

    try {
      setIsLoading(true);

      const txs = [
        // onchain attestation for pledge
        attestPledge(
          network,
          Number(chosenBeneficiary.id),
          pledgeData,
          encodedProof
        ),
      ];
      console.log("txs", txs);

      // via nexus
      const hash = await smartAccount.sendTransaction({
        calls: txs,
      });
      console.log("tx hash: ", hash);
      const receipt = await smartAccount.waitForTransactionReceipt({ hash });
      console.log("tx receipt: ", receipt);

      setIsLoading(false);

      toaster.create({
        title: "You have successfully pledged!",
        description: "You have successfully pledged to the beneficiary",
        placement: "top-end",
        type: "success",
      });
      setScreen("pledge-success");
      return;
    } catch (e) {
      console.error("Error sending attestation", e);
      setIsLoading(false);
      toaster.create({
        title: "Attest failed!",
        description: "There was something wrong with your request",
        placement: "top-end",
        type: "error",
      });
    }
  };

  const renderContent = () => {
    if (!walletAddress) return <LoginPage />;
    if (screen === "donate")
      return (
        <Donate onGoBack={onGoBack} onDonate={onDonate} isLoading={isLoading} />
      );
    if (screen === "pledge")
      return (
        <Pledge
          onGoBack={onGoBack}
          beneficiary={chosenBeneficiary!}
          onPledge={onPledge}
          isLoading={isLoading}
        />
      );
    if (screen === "donation-success")
      return (
        <SuccessDonation
          onGoBack={onGoBack}
          beneficiary={chosenBeneficiary}
          onPledge={() => onChoosePledge(chosenBeneficiary!)}
        />
      );
    if (screen === "pledge-success")
      return (
        <SuccessPledge onGoBack={onGoBack} beneficiary={chosenBeneficiary!} />
      );

    return (
      <ChoosePool
        onChooseDonate={onChooseDonate}
        onChoosePledge={onChoosePledge}
      />
    );
  };

  return (
    <div className="w-full h-full min-h-screen flex justify-center items-center">
      <BgImage />
      {renderContent()}
    </div>
  );
}
