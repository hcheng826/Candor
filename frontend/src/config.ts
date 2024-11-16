import { ethers } from "ethers";
import { BLOCKCHAIN_NETWORK } from "./types";
import { getBundlerUrl, getPaymasterUrl } from "./utils/url-parse";
import {
  baseSepolia,
  Chain,
  mantleSepoliaTestnet,
  polygonAmoy,
  worldchain,
  celoAlfajores,
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
  walletType: WalletType;
  bundlerUrl?: string;
  paymasterUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  tokens: BlockchainTokenConfig[];
  logoUrl: string;
};

export enum WalletType {
  NEXUS = "nexus",
  LEGACY_BICO = "legacy_bico",
  INJECTED = "injected",
}

const baseSepoliaConfig: BlockchainConfig = {
  id: BLOCKCHAIN_NETWORK.BASE_SEPOLIA,
  chainIdNum: 84532,
  chainIdHex: "0x14a34",
  viem: baseSepolia,
  name: "Base Sepolia",
  rpcUrl: "https://base-sepolia.infura.io/v3/a105a52275ac464b8c44ca1a3a664375",
  explorerUrl: "https://sepolia.basescan.org",
  blockscoutUrl: "https://base-sepolia.blockscout.com",
  logoUrl: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
  walletType: WalletType.NEXUS,
  bundlerUrl: getBundlerUrl(84532, 3),
  paymasterUrl: getPaymasterUrl(
    84532,
    2,
    "Kl5UsFJy-.b9637f30-cfd3-4b7a-81f2-8af00d7a4a34"
  ),
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
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
  walletType: WalletType.LEGACY_BICO,
  bundlerUrl: getBundlerUrl(80002, 2),
  logoUrl:
    "https://s3.coinmarketcap.com/static-gravity/image/b8db9a2ac5004c1685a39728cdf4e100.png",
  paymasterUrl: getPaymasterUrl(
    80002,
    1,
    "_A-QOYhVo.b5f821a8-713d-4d71-88f0-9e2c46df91d4"
  ),
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
  walletType: WalletType.LEGACY_BICO,
  bundlerUrl: getBundlerUrl(5003, 2),
  logoUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE1pCfA41AX3CHwIN473YFsuJahs_dfp7neA&s",
  paymasterUrl: getPaymasterUrl(
    5003,
    1,
    "YGCntgMrf.43fbcdf8-964f-434f-873f-d3d6d02f144e"
  ),
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

const celoTestnetConfig: BlockchainConfig = {
  id: BLOCKCHAIN_NETWORK.CELO_TESTNET,
  chainIdNum: 44787,
  chainIdHex: "0x11807",
  viem: celoAlfajores,
  name: "Celo Alfajores Testnet",
  rpcUrl: "https://alfajores-forno.celo-testnet.org",
  explorerUrl: "https://celo-alfajores.blockscout.com",
  walletType: WalletType.LEGACY_BICO,
  logoUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgQ0Bsk6AWZlHnWOhiwlnjtHhogIVprFx8ow&s",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18,
  },
  tokens: [
    {
      address: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
      logoUrl:
        "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
    },
  ],
};

const worldMainConfig: BlockchainConfig = {
  id: BLOCKCHAIN_NETWORK.WORLD_MAIN,
  chainIdNum: 480,
  chainIdHex: "0x1e0",
  viem: worldchain,
  name: "World Mainnet",
  rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public",
  explorerUrl: "https://worldscan.org",
  walletType: WalletType.NEXUS,
  logoUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQReNAB3NIkgokHUuY4fXrde2fLujSn46xw9g&s",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  tokens: [
    {
      address: ethers.ZeroAddress,
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logoUrl:
        "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628",
    },
    {
      address: "0x79a02482a880bce3f13e09da970dc34db4cd24d1",
      name: "USDC.e",
      symbol: "USDC.e",
      decimals: 6,
      logoUrl:
        "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
    },
  ],
};

export const BLOCKCHAIN_CONFIGS = [
  baseSepoliaConfig,
  polygonAmoyConfig,
  mantleSepoliaConfig,
  celoTestnetConfig,
  worldMainConfig,
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
