"use client";
import {
  useDynamicContext,
  useUserWallets,
  Wallet,
} from "@dynamic-labs/sdk-react-core";
import {
  createSmartAccountClient,
  DEFAULT_ENTRYPOINT_ADDRESS,
  ECDSAOwnershipValidationModule,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
  BiconomySmartAccountV2,
  BiconomyPaymaster,
  IPaymaster,
  IBundler,
  Bundler,
} from "@biconomy/account";
import {
  APP_CONFIG,
  BLOCKCHAIN_CONFIGS,
  BlockchainConfig,
  getChainConfig,
} from "@/config";
import { useCallback, useEffect, useState } from "react";
import { getRpcProvider } from "@dynamic-labs/ethers-v6";
import { MiniKit } from "@worldcoin/minikit-js";
import {
  createBicoPaymasterClient,
  createNexusClient,
  NexusClient,
  NexusClientConfig,
} from "@biconomy/sdk";
import { http } from "viem";
import { baseSepolia } from "viem/chains";

const createBundler = (config: BlockchainConfig) => {
  if (config?.bundlerUrl == null) return null;

  const bundler: IBundler = new Bundler({
    bundlerUrl: config.bundlerUrl,
    chainId: config.chainIdNum,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS, // This is a Biconomy constant
  });
  return bundler;
};

const createPaymaster = (config: BlockchainConfig) => {
  if (config?.paymasterUrl == null) return null;

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: config.paymasterUrl,
  });
  return paymaster;
};

const createValidationModule = async (signer: any) => {
  return await ECDSAOwnershipValidationModule.create({
    signer: signer,
    moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE, // This is a Biconomy constant
  });
};

// nexus biconomy
const createNexusSmartAccount = async (
  config: BlockchainConfig,
  walletClient: any // this can get buggy
) => {
  if (config?.paymasterUrl == null) return null;

  const nConfig: NexusClientConfig = {
    signer: walletClient,
    chain: {
      ...config.viem,
      rpcUrls: {
        default: { http: [config.rpcUrl] },
      },
    },
    transport: config?.rpcUrl ? http(config.rpcUrl) : http(),
    bundlerTransport: http(config.bundlerUrl),
    paymaster: createBicoPaymasterClient({
      paymasterUrl: config.paymasterUrl,
    }),
  };
  return await createNexusClient(nConfig);
};

// legacy biconomy
const createSmartAccount = async (chainId: number, walletClient: any) => {
  const config = getChainConfig(chainId);
  if (!config) return;

  const validationModule = await createValidationModule(walletClient);
  const bundler = createBundler(config);
  const paymaster = createPaymaster(config);

  if (!bundler || !paymaster) return null;

  return await createSmartAccountClient({
    signer: walletClient,
    chainId: config.chainIdNum,
    bundler: bundler,
    paymaster: paymaster,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: validationModule,
    activeValidationModule: validationModule,
  });
};

export const useWallet = () => {
  const userWallets = useUserWallets();
  const [localNonce, setLocalNonce] = useState(
    typeof window !== "undefined" ? localStorage.getItem("nonce") : null //nonce for worldID miniApp
  );

  const getLocalNonce = () => {
    //check stored nonce
    if (typeof window === "undefined") {
      return;
    }
    const storedNonce = localStorage.getItem("nonce");
    if (storedNonce) {
      setLocalNonce(storedNonce);
      return storedNonce;
    }

    const nonce = crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem("nonce", nonce);
    setLocalNonce(nonce);
    return nonce;
  };

  useEffect(() => {
    getLocalNonce();
  }, []);

  //use embedded wallet first as default wallet
  const embeddedWallet: Wallet<any> | undefined =
    userWallets.find((wallet) => wallet.connector?.isEmbeddedWallet === true) ||
    userWallets[0];
  const { handleLogOut, setShowAuthFlow } = useDynamicContext();
  const isMiniApp =
    typeof window !== "undefined" && APP_CONFIG.enableMiniKit
      ? MiniKit.isInstalled(false)
      : false;

  const chainId = getChainIdFromEmbeddedWallet(embeddedWallet);
  const config = getChainConfig(chainId);

  return {
    network: config?.id,
    embeddedWallet,
    walletAddress: isMiniApp
      ? MiniKit.walletAddress || embeddedWallet?.address || ""
      : embeddedWallet?.address || "",
    connectedChain: config,
    onLogout: handleLogOut,
    showAuthFlow: setShowAuthFlow,
    getRpcProvider: getRpcProvider as any,
    isMiniApp,
    localNonce,
  };
};

export function useSmartWallet() {
  const { embeddedWallet } = useWallet();
  const [smartAccount, setSmartAccount] = useState<NexusClient | null>(null);

  const createAndSetSmartAccount = useCallback(async () => {
    if (smartAccount) return;

    if (!embeddedWallet) {
      console.log("no embedded wallet");
      setSmartAccount(null);
      return;
    }

    if (!embeddedWallet.connector.isEmbeddedWallet) {
      alert("No embedded wallet selected");
      return;
    }

    try {
      const walletClient = await (embeddedWallet as any).getWalletClient();
      if (!walletClient) {
        console.log("no wallet client");
        return;
      }

      const chainId = getChainIdFromEmbeddedWallet(embeddedWallet);
      const config = getChainConfig(chainId);
      if (!config) {
        console.log("no chain config");
        return;
      }

      const newSmartAccount = await createNexusSmartAccount(
        config,
        walletClient
      );
      setSmartAccount(newSmartAccount);
      console.log("set smart account", newSmartAccount);
    } catch (error) {
      console.error(
        "Error fetching wallet clients or creating smart account:",
        error
      );
    }
  }, [embeddedWallet, smartAccount]);

  useEffect(() => {
    createAndSetSmartAccount();
  }, [createAndSetSmartAccount]);

  return { smartAccount };
}

const getChainIdFromEmbeddedWallet = (ew: any) => {
  const connector = ew?.connector as any;
  const activeChain = connector?.activeChain;
  return activeChain?.id || connector?._selectedChainId;
};
