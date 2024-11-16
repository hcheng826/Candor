import { BLOCKCHAIN_NETWORK } from "@/types";
import { BiconomySmartAccountV2 } from "@biconomy/account";
import { NexusClient } from "@biconomy/sdk";

export const CANDOR_ADDYS: {
  [network in BLOCKCHAIN_NETWORK]: {
    candor: string;
    candorSpHook: string;
    worldId: string;
  };
} = {
  [BLOCKCHAIN_NETWORK.BASE_SEPOLIA]: {
    candor: "0x9341BEC4A59ae34f628D978f194b451Bc639bF7D",
    candorSpHook: "0x2987a9b18b1d8FA449DF81406922008bebE31020",
    worldId: "0x0000000000000000000000000000000000000000",
  },
  [BLOCKCHAIN_NETWORK.POLYGON_AMOY]: {
    candor: "0xc570829fa7e4b2088cf2A3544Fba9267B3a6160E",
    candorSpHook: "0x91Fdc87cBED8Be6FBfDe8fF0cFE6d9B945b008E4",
    worldId: "0x0000000000000000000000000000000000000000",
  },
  [BLOCKCHAIN_NETWORK.MANTLE_SEPOLIA]: {
    candor: "0xab1F16edCde814F60f3F9eb227a6cF37EfA988f1",
    candorSpHook: "0xBc32D940b02F4376D73CA908907C953711B05e39",
    worldId: "0x0000000000000000000000000000000000000000",
  },
  [BLOCKCHAIN_NETWORK.WORLD_MAIN]: {
    candor: "0x2FC978bDba0ae5f40E1adF6A924060dEed726E7c",
    candorSpHook: "0x0000000000000000000000000000000000000000",
    worldId: "0x0000000000000000000000000000000000000000",
  },
  [BLOCKCHAIN_NETWORK.CELO_TESTNET]: {
    candor: "0x2FC978bDba0ae5f40E1adF6A924060dEed726E7c",
    candorSpHook: "0x0Ce9551aC3DF1666d4F569FB88A80003DC43E7c7",
    worldId: "0x0000000000000000000000000000000000000000",
  },
};

export const getCandorAddress = (chain: BLOCKCHAIN_NETWORK) =>
  CANDOR_ADDYS[chain].candor;

export const getCandorSpHookAddress = (chain: BLOCKCHAIN_NETWORK) =>
  CANDOR_ADDYS[chain].candorSpHook;

export const getWorldIdAddress = (chain: BLOCKCHAIN_NETWORK) =>
  CANDOR_ADDYS[chain].worldId;

export const getSmartAddressFromSmartAccount = (smartAccount: any) => {
  let address = smartAccount?.account?.address;
  if (address) return address;

  address = smartAccount?.accountAddress;
  if (address) return address;

  return "";
};

export const BACKEND_TRIGGOR = "0xC4a1089795CC5917DF4Ddc8B6A302Ee7275B991e";
