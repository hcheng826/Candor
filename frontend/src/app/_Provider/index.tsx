"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UIProvider } from "@/components/ui/provider";
import { WalletProvider } from "./WalletProvider";
// import { NotificationProvider } from "./NotificationProvider";
import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { WorldMiniKitProvider } from "./WorldMinikitProvider";
import { useGetAllBeneficiaries, useGetTokenBalance } from "@/hooks/data";
import { useSmartWallet, useWallet } from "@/hooks/useWallet";

const queryClient = new QueryClient();

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={null}>
      <UIProvider>
        <QueryClientProvider client={queryClient}>
          <WorldMiniKitProvider>
            <WalletProvider>
              <Init />
              {children}
              <Toaster />
              {/* <NotificationProvider>{children}</NotificationProvider> */}
            </WalletProvider>
          </WorldMiniKitProvider>
        </QueryClientProvider>
      </UIProvider>
    </Suspense>
  );
};

export const Init = () => {
  const { connectedChain, isMiniApp, setChain } = useWallet();
  useSmartWallet()
  const defaultToken = connectedChain?.tokens[0];
  
  useGetAllBeneficiaries();
  useGetTokenBalance({
    tokenAddress: defaultToken?.address,
    tokenDecimals: defaultToken?.decimals,
  });
  return null;
};
