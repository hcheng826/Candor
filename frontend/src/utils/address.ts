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
    candor: "0x0000000000000000000000000000000000000000",
    candorSpHook: "0x0000000000000000000000000000000000000000",
    worldId: "0x0000000000000000000000000000000000000000",
  },
  [BLOCKCHAIN_NETWORK.WORLD_MAIN]: {
    candor: "0x388d2dbe834f32a897eb7ed2abb6ad5a45732313",
    candorSpHook: "0x0000000000000000000000000000000000000000",
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
