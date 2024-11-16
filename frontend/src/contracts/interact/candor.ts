import { createPublicClient, encodeFunctionData, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  CANDOR_SP_HOOK_ADDRESS,
  CANDOR_SP_HOOK_JSON_ABI,
  CANDOR_ADDRESS,
  CANDOR_JSON_ABI,
  ERC20_JSON_ABI,
} from "../abi";
import { BLOCKCHAIN_NETWORK } from "@/types";
import { getCandorAddress } from "@/utils/address";

type TxnEntity = { to: string; data: string } & any; // sorry

// interact utils
export const approve = (
  tokenAddress: string,
  amount: bigint,
  spender: string
): TxnEntity => {
  const fnData = {
    abi: ERC20_JSON_ABI,
    functionName: "approve",
    args: [spender, amount],
  };
  return {
    to: tokenAddress,
    data: encodeFunctionData(fnData),
  };
};

export const donateByBaseCurrency = (
  network: BLOCKCHAIN_NETWORK,
  beneficiaryId: number,
  amount: bigint,
  data: string = "0x"
): TxnEntity => {
  const fnData = {
    abi: CANDOR_JSON_ABI,
    functionName: "donateByBaseCurrency",
    args: [beneficiaryId, amount, data],
  };
  return {
    to: getCandorAddress(network),
    data: encodeFunctionData(fnData),
  };
};

export const attestPledge = (
  network: BLOCKCHAIN_NETWORK,
  beneficiaryId: number,
  data: string,
  encodedProof: string
): TxnEntity => {
  const fnData = {
    abi: CANDOR_JSON_ABI,
    functionName: "attestPledge",
    args: [beneficiaryId, data, encodedProof],
  };
  return {
    to: getCandorAddress(network),
    data: encodeFunctionData(fnData),
  };
};

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// pre-setup contracts for multicalls
const candorContract = {
  address: CANDOR_ADDRESS,
  abi: CANDOR_JSON_ABI,
} as const;

const candorSpHookContract = {
  address: CANDOR_SP_HOOK_ADDRESS,
  abi: CANDOR_SP_HOOK_JSON_ABI,
} as const;

// fetch utils
export const fetchEpochSeconds = async () => {
  const [startRes, intervalRes] = (await publicClient.multicall({
    contracts: [
      { ...candorContract, functionName: "START_TIME" },
      { ...candorContract, functionName: "EPOCH_INTERVAL" },
    ],
    allowFailure: false,
  })) as [unknown, unknown] as [bigint, bigint];

  return {
    start: Number(startRes),
    end: Number(startRes + intervalRes),
  };
};

export const fetchSocialScore = async (users: string[]) => {
  const res = (await publicClient.multicall({
    contracts: users.map((u) => ({
      ...candorSpHookContract,
      functionName: "balanceOf",
      args: [u],
    })),
    allowFailure: false,
  })) as bigint[];

  return res;
};
