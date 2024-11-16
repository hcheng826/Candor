import React, { useEffect } from "react";
import {
  DynamicUserProfile,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { CircleUserIcon } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import Image from "next/image";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { Button } from "../ui/button";
import { BLOCKCHAIN_CONFIGS } from "@/config";
import { useMediaQuery } from "@chakra-ui/react";
import { useIsMobile } from "@/hooks/isMobile";
import { BLOCKCHAIN_NETWORK } from "@/types";

export const UserWallet = () => {
  const { setShowDynamicUserProfile } = useDynamicContext();

  return (
    <div className="flex items-center">
      <ChainDropdown />
      <button onClick={() => setShowDynamicUserProfile(true)} className="ml-2">
        <CircleUserIcon
          width={30}
          height={30}
          style={{
            opacity: "0.5",
          }}
        />
      </button>
      <DynamicUserProfile />
    </div>
  );
};

const ChainDropdown = () => {
  const { connectedChain, setChain, isMiniApp } = useWallet();
  const isMobile = useIsMobile();

  //fallback to world main if mini app
  let finalChain = connectedChain;
  if (isMiniApp) {
    finalChain = BLOCKCHAIN_CONFIGS.find(
      (c) => c.id === BLOCKCHAIN_NETWORK.WORLD_MAIN
    );
  }

  useEffect(() => {
    if (isMiniApp && finalChain) {
      setChain(finalChain.chainIdNum);
    }
  }, [isMiniApp]);

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          background={"transparent"}
          className="text-sm"
        >
          {
            <Image
              src={finalChain?.logoUrl || ""}
              alt=""
              width={30}
              height={30}
              className="mr-1"
            />
          }

          {!isMobile && finalChain?.name}
        </Button>
      </MenuTrigger>
      <MenuContent className="bg-white text-black">
        {BLOCKCHAIN_CONFIGS.map((item) => (
          <MenuItem
            value={item.id}
            className="text-gray-600 hover:bg-gray-100  cursor-pointer text-sm"
            onClick={() => setChain(item.chainIdNum)}
            key={item.name}
          >
            <Image
              src={item?.logoUrl || ""}
              alt=""
              width={30}
              height={30}
              className="mr-1"
            />
            {item.name}
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  );
};
