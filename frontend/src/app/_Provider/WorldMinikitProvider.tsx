"use client";

import { ReactNode, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export function WorldMiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      MiniKit.install();
    }
  }, []);

  return <>{children}</>;
}
