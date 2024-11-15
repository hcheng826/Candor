import React from "react";
import {
  DynamicUserProfile,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { CircleUserIcon } from "lucide-react";

export const UserWallet = () => {
  const { setShowDynamicUserProfile } = useDynamicContext();
  return (
    <div>
      <button onClick={() => setShowDynamicUserProfile(true)}>
        <CircleUserIcon width={30} height={30} style={{
            opacity: '0.5'
        }} />
      </button>
      <DynamicUserProfile />
    </div>
  );
};
