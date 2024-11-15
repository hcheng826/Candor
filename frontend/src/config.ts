import { ethers } from "ethers";
import { BLOCKCHAIN_NETWORK } from "./types";
import { getBundlerUrl, getPaymasterUrl } from "./utils/url-parse";
import {
  baseSepolia,
  Chain,
  mantleSepoliaTestnet,
  polygonAmoy,
} from "viem/chains";

export const APP_CONFIG = {
  name: "Condor",
  logoUrl: "",
  description: "",
  worldAppId: "app_staging_bb43e863a4ff2d2cf514a2a906710ee7",
  dynamicEnvironmentId: "487da2cf-a64b-48f6-9cf2-9ece6031d44b",
  pushChannelAddress: "0xB88460Bb2696CAb9D66013A05dFF29a28330689D",
  enableMiniKit: false,
};

export type BlockchainTokenConfig = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
};

export type BlockchainConfig = {
  id: BLOCKCHAIN_NETWORK;
  chainIdNum: number;
  chainIdHex: string;
  viem: Chain;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  blockscoutUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  bundlerUrl?: string;
  paymasterUrl?: string;
  tokens: BlockchainTokenConfig[];
};

const baseSepoliaConfig: BlockchainConfig = {
  id: BLOCKCHAIN_NETWORK.BASE_SEPOLIA,
  chainIdNum: 84532,
  chainIdHex: "0x14a34",
  viem: baseSepolia,
  name: "Base Sepolia",
  rpcUrl: "https://base-sepolia.infura.io/v3/a105a52275ac464b8c44ca1a3a664375",
  explorerUrl: "https://sepolia.basescan.org",
  blockscoutUrl: "https://base-sepolia.blockscout.com",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  bundlerUrl: getBundlerUrl(84532, 3),
  paymasterUrl: getPaymasterUrl(
    84532,
    2,
    "fT96odBdr.bd3bbd25-b25b-4583-83a3-508e55044517"
  ),
  tokens: [
    {
      address: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
      logoUrl:
        "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
    },
    {
      address: "0x323e78f944A9a1FcF3a10efcC5319DBb0bB6e673",
      name: "USDT",
      symbol: "USDT",
      decimals: 6,
      logoUrl:
        "https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1693742585",
    },
    {
      address: ethers.ZeroAddress,
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      logoUrl:
        "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
    },
  ],
};

const polygonAmoyConfig: BlockchainConfig = {
  id: BLOCKCHAIN_NETWORK.POLYGON_AMOY,
  chainIdNum: 80002,
  chainIdHex: "0x13882",
  viem: polygonAmoy,
  name: "Polygon Amoy",
  rpcUrl: "https://rpc.ankr.com/polygon_amoy",
  explorerUrl: "https://amoy.polygonscan.com",
  blockscoutUrl: "https://explorer.sepolia.mantle.xyz/",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  tokens: [
    {
      address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
      logoUrl:
        "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
    },
    {
      address: "0x1616d425Cd540B256475cBfb604586C8598eC0FB",
      name: "USDT",
      symbol: "USDT",
      decimals: 6,
      logoUrl:
        "https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1693742585",
    },
    {
      address: ethers.ZeroAddress,
      name: "POL",
      symbol: "POL",
      decimals: 18,
      logoUrl:
        "https://assets.coingecko.com/coins/images/32440/standard/polygon.png?1698233684",
    },
  ],
};

const mantleSepoliaConfig: BlockchainConfig = {
  id: BLOCKCHAIN_NETWORK.MANTLE_SEPOLIA,
  chainIdNum: 5003,
  chainIdHex: "0x138b",
  viem: mantleSepoliaTestnet,
  name: "Mantle Sepolia Testnet",
  rpcUrl: "https://rpc.sepolia.mantle.xyz",
  explorerUrl: "https://mantlescan.info",
  nativeCurrency: {
    name: "MNT",
    symbol: "MNT",
    decimals: 18,
  },
  tokens: [
    {
      address: "0xTODO", //TODO:
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
      logoUrl:
        "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
    },
    {
      address: "0xTODO", //TODO: no
      name: "USDT",
      symbol: "USDT",
      decimals: 6,
      logoUrl:
        "https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1693742585",
    },
    {
      address: ethers.ZeroAddress,
      name: "MNT",
      symbol: "MNT",
      decimals: 18,
      logoUrl:
        "https://assets.coingecko.com/coins/images/32440/standard/polygon.png?1698233684",
    },
  ],
};

export const BLOCKCHAIN_CONFIGS = [
  baseSepoliaConfig,
  polygonAmoyConfig,
  mantleSepoliaConfig,
];

export const addressToToken = (address: string, chainId: number | string) => {
  const config = getChainConfig(chainId);
  if (!config?.tokens || config.tokens.length === 0) return null;

  const lowered = address.toLowerCase();
  return config.tokens.find((t) => t.address.toLowerCase() === lowered);
};

export const getChainConfig = (chainId: number | string) => {
  return BLOCKCHAIN_CONFIGS.find(
    (config) =>
      Number(config.chainIdNum) === Number(chainId) ||
      config.chainIdHex === chainId
  );
};
