"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UIProvider } from "@/components/ui/provider";
import { WalletProvider } from "./WalletProvider";
// import { NotificationProvider } from "./NotificationProvider";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { WorldMiniKitProvider } from "./WorldMinikitProvider";

const queryClient = new QueryClient();

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={null}>
      <UIProvider>
        <QueryClientProvider client={queryClient}>
          <WorldMiniKitProvider>
            <WalletProvider>
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
