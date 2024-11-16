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
  BiconomyPaymaster,
  IPaymaster,
  IBundler,
  Bundler,
  BiconomySmartAccountV2,
} from "@biconomy/account";
import { smartSessionCreateActions } from "@biconomy/sdk";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import {
  APP_CONFIG,
  BlockchainConfig,
  getChainConfig,
  WalletType,
} from "@/config";
import { useCallback, useEffect, useState } from "react";
import { getRpcProvider } from "@dynamic-labs/ethers-v6";
import { MiniKit } from "@worldcoin/minikit-js";
import {
  createBicoPaymasterClient,
  createNexusClient,
  NexusClient,
  NexusClientConfig,
  toSmartSessionsValidator,
} from "@biconomy/sdk";
import { http } from "viem";

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
const createSmartAccount = async (
  config: BlockchainConfig,
  walletClient: any
) => {
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
  const { refresh } = useGlobalStore(
    useShallow((state) => ({
      refresh: state.refresh,
    }))
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
    embeddedWallet,
    walletAddress: embeddedWallet?.address || "",
    miniAppAddress: isMiniApp ? MiniKit.walletAddress : "",
    connectedChain: config,
    onLogout: handleLogOut,
    showAuthFlow: setShowAuthFlow,
    getRpcProvider: getRpcProvider as any,
    isMiniApp,
    localNonce,
    refresh,
    setChain: async (chainId: string | number) => {
      await embeddedWallet?.switchNetwork(chainId);
    },
  };
};

interface SmartSessionClient extends NexusClient {
  grantPermission: (params: any) => Promise<any>;
}
const useSmartWalletStore = create<{
  smartAccount: NexusClient | BiconomySmartAccountV2 | null;
  smartSessionAccount: SmartSessionClient | null;
  smartAccountChain: Record<string, boolean>;
  setSmartAccount: (
    smartAccount: NexusClient | BiconomySmartAccountV2 | null
  ) => void;
  setSmartSessionAccount: (
    smartSessionAccount: SmartSessionClient | null
  ) => void;
  setSmartAccountChain: (chain: Record<string, boolean>) => void;
}>((set) => ({
  smartAccount: null,
  smartSessionAccount: null,
  smartAccountChain: {},
  setSmartAccount: (
    smartAccount: NexusClient | BiconomySmartAccountV2 | null
  ) => set({ smartAccount }),
  setSmartSessionAccount: (smartSessionAccount: SmartSessionClient | null) =>
    set({ smartSessionAccount }),
  setSmartAccountChain: (chain: Record<string, boolean>) =>
    set((prevState) => ({
      smartAccountChain: { ...prevState.smartAccountChain, ...chain },
    })),
}));

export const useGlobalStore = create<{
  refresh: number;
  setRefresh: () => void;
}>((set) => ({
  refresh: 0,
  setRefresh: () =>
    set({
      refresh: Math.floor(Math.random() * 1000000000),
    }),
}));

export function useSmartWallet() {
  const { embeddedWallet, isMiniApp, connectedChain } = useWallet();
  const {
    smartAccount,
    smartSessionAccount,
    smartAccountChain,
    setSmartAccount,
    setSmartSessionAccount,
    setSmartAccountChain,
  } = useSmartWalletStore(
    useShallow((state) => ({
      smartAccount: state.smartAccount,
      setSmartAccount: state.setSmartAccount,
      smartSessionAccount: state.smartSessionAccount,
      setSmartSessionAccount: state.setSmartSessionAccount,
      smartAccountChain: state.smartAccountChain,
      setSmartAccountChain: state.setSmartAccountChain,
    }))
  );
  const { refresh } = useGlobalStore(
    useShallow((state) => ({
      refresh: state.refresh,
    }))
  );

  const createAndSetSmartAccount = useCallback(async () => {
    if (!connectedChain || smartAccountChain[connectedChain?.id]) return;

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
      if (config == null) {
        console.log("no chain config");
        return;
      }

      switch (config.walletType) {
        case WalletType.NEXUS: {
          const newSmartAccount = await createNexusSmartAccount(
            config,
            walletClient
          );
          if (!newSmartAccount) return;

          setSmartAccount(newSmartAccount);
          setSmartAccountChain({
            [connectedChain?.id]: true,
          });
          // console.log(
          //   "set smart account",
          //   newSmartAccount,
          //   connectedChain?.id,
          //   {
          //     [connectedChain?.id]: true,
          //   }
          // );

          console.log(
            "to smart session vlidator: ",
            newSmartAccount,
            walletClient
          );
          walletClient.address = walletClient.account?.address;
          const sessionsModule = toSmartSessionsValidator({
            account: newSmartAccount.account,
            signer: walletClient,
          });
          const isSmartSessionInstalledBefore = localStorage.getItem(
            "smartSessionInstalled"
          );

          const allAccountData =
            (JSON.parse(isSmartSessionInstalledBefore || "{}") as Record<
              string,
              boolean
            >) || {};
          console.log("installement allAccountData", allAccountData);
          const isInstalled = allAccountData[newSmartAccount.account.address];
          if (!isInstalled) {
            const hash = await newSmartAccount.installModule({
              module: sessionsModule.moduleInitData,
            });
            const installOperationReceipt =
              await newSmartAccount.waitForUserOperationReceipt({ hash });
            console.log("install operation: ", hash, installOperationReceipt);
            localStorage.setItem(
              "smartSessionInstalled",
              JSON.stringify({
                ...allAccountData,
                [newSmartAccount.account.address]: true,
              })
            );
          }

          const nexusSessionClient = newSmartAccount.extend(
            smartSessionCreateActions(sessionsModule)
          );
          console.log("set smart session account", nexusSessionClient);

          setSmartSessionAccount(nexusSessionClient as any); //TODO: check type again
          break;
        }
        case WalletType.LEGACY_BICO: {
          const newSmartAccount = await createSmartAccount(
            config,
            walletClient
          );
          if (!newSmartAccount) return;
          setSmartAccountChain({
            [connectedChain?.id]: true,
          });
          setSmartAccount(newSmartAccount);
          console.log("set smart account", newSmartAccount);
          break;
        }
        default:
          throw new Error("unhandled wallet type!");
      }
    } catch (error) {
      console.error(
        "Error fetching wallet clients or creating smart account:",
        error
      );
    }
  }, [embeddedWallet, smartAccount, connectedChain, smartAccountChain]);

  useEffect(() => {
    createAndSetSmartAccount();
  }, [createAndSetSmartAccount, connectedChain]);

  return { smartAccount, smartSessionAccount, refresh };
}

const getChainIdFromEmbeddedWallet = (ew: any) => {
  const connector = ew?.connector as any;
  const activeChain = connector?.activeChain;
  return activeChain?.id || connector?._selectedChainId;
};
