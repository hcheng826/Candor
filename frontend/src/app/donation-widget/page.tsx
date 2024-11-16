"use client";
import { BgImage } from "../Home";
import { useSmartWallet, useWallet } from "@/hooks/useWallet";
import { Beneficiary, BLOCKCHAIN_NETWORK } from "@/types";
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
import { MiniKit, Tokens, PayCommandInput } from "@worldcoin/minikit-js";
import {
  approve,
  attestPledge,
  donateByBaseCurrency,
} from "@/contracts/interact/candor";
import { encodeWorldcoinProof } from "@/contracts/interact/worldcoin";
import { encodeSPCandorPledge } from "@/contracts/interact/sign-protocol";
import { BACKEND_URL, toWei } from "@/utils";
import { addressToToken, WalletType } from "@/config";
import { BACKEND_TRIGGOR, getCandorAddress } from "@/utils/address";
import {
  CreateSessionDataParams,
  NexusClient,
  ParamCondition,
  SessionData,
} from "@biconomy/sdk";
import { CANDOR_JSON_ABI, ERC20_JSON_ABI } from "@/contracts/abi";
import { ethers, uuidV4 } from "ethers";
import { BiconomySmartAccountV2, PaymasterMode } from "@biconomy/account";
import { SmartSessionMode } from "@rhinestone/module-sdk/module";
import axios from "axios";

const PledgeDynamic = dynamic(
  () => import("./Pledge").then((mod) => mod.Pledge),
  {
    ssr: false,
  }
);

export default function DonationWidget() {
  const { walletAddress, connectedChain, isMiniApp, miniAppAddress } =
    useWallet();
  const { smartAccount, smartSessionAccount } = useSmartWallet();
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
    isRecurring,
  }: {
    tokenAddress: string;
    amount: number;
    isRecurring: boolean;
  }) => {
    console.log(
      `ondonate for ${tokenAddress}, ${amount}, ${chosenBeneficiary?.id}, ${connectedChain?.walletType}`
    );
    console.log(smartAccount);
    if (!smartAccount || !chosenBeneficiary || !connectedChain) return;

    const network = connectedChain.id;
    const token = addressToToken(tokenAddress, connectedChain.chainIdNum);
    if (token == null) {
      console.error(
        `no token for ${tokenAddress}, ${connectedChain.chainIdNum}`
      );
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

    if (connectedChain.id === BLOCKCHAIN_NETWORK.WORLD_MAIN && isMiniApp) {
      const payload: PayCommandInput = {
        reference: crypto.randomUUID(),
        to: candorAddy,
        tokens: [
          {
            symbol: Tokens.USDCE,
            token_amount: weiAmount.toString(),
          },
        ],
        description: "Donation",
      };

      const { finalPayload: payRes } = await MiniKit.commandsAsync.pay(payload);
      if (payRes.status === "error") {
        toaster.create({
          title: "Donation failed!",
          description: "There was something wrong with your request",
          placement: "top-end",
          type: "error",
        });
        return;
      }

      //trigger worldId native pay
      toaster.create({
        title: "You have successfully donated!",
        description: "You have successfully donated",
        placement: "top-end",
        type: "success",
      });
      setScreen("donation-success");
      return;
    }

    //TODO: handle when donating to generic pool
    try {
      setIsLoading(true);
      let transactionHash = "";

      switch (connectedChain.walletType) {
        case WalletType.NEXUS: {
          // via nexus
          if (isRecurring) {
            if (!smartSessionAccount) return;

            //ask permission for future txs
            const sessionPublicKey = BACKEND_TRIGGOR;
            const sessionRequestedInfo: CreateSessionDataParams[] = [
              {
                sessionPublicKey,
                actionPoliciesInfo: [
                  {
                    // approve token policy
                    contractAddress: tokenAddress as `0x${string}`,
                    rules: [
                      {
                        condition: ParamCondition.EQUAL,
                        offsetIndex: 0,
                        isLimited: false,
                        ref: candorAddy,
                        usage: {
                          limit: BigInt(100),
                          used: BigInt(0),
                        },
                      },
                      {
                        condition: ParamCondition.EQUAL,
                        offsetIndex: 1,
                        isLimited: false,
                        ref: weiAmount,
                        usage: {
                          limit: BigInt(100),
                          used: BigInt(0),
                        },
                      },
                    ],
                    functionSelector:
                      new ethers.Interface(ERC20_JSON_ABI as any).getFunction(
                        "approve"
                      )?.selector || "",
                  },
                  {
                    //donate via base currency
                    contractAddress: getCandorAddress(network) as `0x${string}`,
                    // beneficiaryId, amount
                    rules: [
                      {
                        condition: ParamCondition.EQUAL,
                        offsetIndex: 0,
                        isLimited: false,
                        ref: chosenBeneficiary.id,
                        usage: {
                          limit: BigInt(100),
                          used: BigInt(0),
                        },
                      },
                      {
                        condition: ParamCondition.EQUAL,
                        offsetIndex: 1,
                        isLimited: false,
                        ref: weiAmount,
                        usage: {
                          limit: BigInt(100),
                          used: BigInt(0),
                        },
                      },
                    ],
                    functionSelector:
                      new ethers.Interface(CANDOR_JSON_ABI as any).getFunction(
                        "donateByBaseCurrency"
                      )?.selector || "",
                  },
                ],
              },
            ];

            console.log("granting permission.....", sessionRequestedInfo);
            const createSessionsResponse =
              await smartSessionAccount.grantPermission({
                sessionRequestedInfo,
              });

            const [cachedPermissionId] = createSessionsResponse.permissionIds;
            console.log("granted permission: ", createSessionsResponse);

            const operationReceipt =
              await smartSessionAccount.waitForUserOperationReceipt({
                hash: createSessionsResponse.userOpHash,
              });
            console.log("granted permission success: ", operationReceipt);
            transactionHash = operationReceipt?.receipt?.transactionHash;
            const sessionData = {
              granter: (smartAccount as NexusClient)?.account?.address || "",
              sessionPublicKey,
              moduleData: {
                permissionIds: [cachedPermissionId],
                mode: SmartSessionMode.USE,
              },
            };

            const compressedSessionData = JSON.stringify(sessionData);
            console.log("compressedSessionData", compressedSessionData);

            const body = {
              sessionData,
              recurAmount: weiAmount.toString(),
              beneficiaryId: Number(chosenBeneficiary.id),
              data: "0x",
              times: 12,
              interval: 15_000, // 15 seconds for demo purpose (not 1 month)
            };
            console.log("sending data to backend: ", body);
            axios({
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              method: "POST",
              baseURL: BACKEND_URL,
              url: `/store-session?chainId=${connectedChain.chainIdNum}`,
              data: body,
            });
          } else {
            const client = smartAccount as NexusClient;
            const hash = await client.sendTransaction({
              calls: txs,
            });
            transactionHash = hash;
            console.log("tx hash: ", hash);
            const receipt = await client.waitForTransactionReceipt({
              hash,
            });
            console.log("tx receipt: ", receipt);
          }

          break;
        }
        case WalletType.LEGACY_BICO: {
          const client = smartAccount as BiconomySmartAccountV2;
          const { wait, waitForTxHash } = await client.sendTransaction(txs, {
            paymasterServiceData: {
              mode: PaymasterMode.SPONSORED,
            },
            simulationType: "validation_and_execution",
          });
          const { reason } = await wait();
          console.log("reason: ", reason);
          const { transactionHash: txHash } = await waitForTxHash();
          console.log(txHash);
          transactionHash = txHash || "";
          break;
        }
      }

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
        description: (
          <div>
            You have successfully donated.&nbsp;
            <a
              href={`${connectedChain.blockscoutUrl}/tx/${transactionHash}`}
              target="_blank"
              className="underline"
            >
              View on explorer
            </a>
          </div>
        ),
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
    if (!smartAccount || !chosenBeneficiary || !connectedChain) return;

    const encodedProof = encodeWorldcoinProof();
    const pledgeData = encodeSPCandorPledge(rating, comments);
    console.log("data", encodedProof, pledgeData);

    const network = connectedChain.id;
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
    let transactionHash = "";

    // //handle specially for Worldchain mini app
    // if (connectedChain.id === BLOCKCHAIN_NETWORK.WORLD_MAIN && isMiniApp) {
    //   const { commandPayload, finalPayload } =
    //     await MiniKit.commandsAsync.sendTransaction({
    //       transaction: [
    //         {
    //           address: getCandorAddress(network) as `0x${string}`,
    //           abi: CANDOR_JSON_ABI,
    //           functionName: "attestPledge",
    //           args: [Number(chosenBeneficiary.id), pledgeData, encodedProof],
    //         },
    //       ],
    //     });

    //   if (finalPayload.status === "error") {
    //     toaster.create({
    //       title: "Pledge failed!",
    //       description: "There was something wrong with your request",
    //       placement: "top-end",
    //       type: "error",
    //     });
    //     return;
    //   }

    //   toaster.create({
    //     title: "You have successfully pledged!",
    //     description: "You have successfully pledged to the beneficiary",
    //     placement: "top-end",
    //     type: "success",
    //   });
    //   setScreen("pledge-success");
    //   return;
    // }

    try {
      setIsLoading(true);
      switch (connectedChain.walletType) {
        case WalletType.NEXUS: {
          const client = smartAccount as NexusClient;
          // toaster.create({
          //   title: "test",
          //   description: JSON.stringify(client.account || {}),
          //   placement: "top-end",
          //   type: "success",
          // });

          if (isMiniApp) {
            //no need to wait
            client.sendTransaction({
              calls: txs,
            });
            await new Promise((resolve) => setTimeout(resolve, 5000));
            break;
          }

          const hash = await client.sendTransaction({
            calls: txs,
          });
          transactionHash = hash || "";
          console.log("tx hash: ", hash);
          const receipt = await client.waitForTransactionReceipt({
            hash,
          });
          console.log("tx receipt: ", receipt);
          break;
        }
        case WalletType.LEGACY_BICO: {
          const client = smartAccount as BiconomySmartAccountV2;
          const { wait, waitForTxHash } = await client.sendTransaction(txs, {
            paymasterServiceData: {
              mode: PaymasterMode.SPONSORED,
            },
            simulationType: "validation_and_execution",
          });
          const { reason } = await wait();
          console.log("reason: ", reason);
          const { transactionHash: txHash } = await waitForTxHash();
          console.log(txHash);
          transactionHash = txHash || "";
          break;
        }
      }

      setIsLoading(false);
      toaster.create({
        title: "You have successfully pledged!",
        description: (
          <div>
            You have successfully pledged to the beneficiary.&nbsp;
            <a
              href={`${connectedChain.blockscoutUrl}/tx/${transactionHash}`}
              target="_blank"
              className="underline"
            >
              View on explorer
            </a>
          </div>
        ),
        placement: "top-end",
        type: "success",
      });
      setScreen("pledge-success");
      return;
    } catch (e: any) {
      console.error("Error sending attestation", e);
      setIsLoading(false);
      toaster.create({
        title: "Attest failed!",
        description:
          "There was something wrong with your request" +
          (e as any)?.toString(),
        placement: "top-end",
        type: "error",
      });
    }
  };

  const renderContent = () => {
    if (!walletAddress) return <LoginPage />;
    if (isMiniApp && !miniAppAddress) return <LoginPage />;

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
