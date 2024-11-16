"use client";

import { ReactNode, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { APP_CONFIG } from "@/config";

export function WorldMiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      MiniKit.install(APP_CONFIG.worldAppId);
    }
  }, []);

  return <>{children}</>;
}
