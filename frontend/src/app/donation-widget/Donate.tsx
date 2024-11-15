import { PrimaryButton } from "@/components/Button/PrimaryButton";
import { ShadowedContainer } from "@/components/Container";
import { UserWallet } from "@/components/LoginWallet/UserWallet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { useSmartWallet, useWallet } from "@/hooks/useWallet";
import { Token } from "@/types";
import { ChevronLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { isNativeToken, toEther } from "@/utils";
import { ERC20_JSON_ABI } from "@/contracts/abi";

const EMPTY_IMAGE =
  "https://t4.ftcdn.net/jpg/05/17/53/57/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg";

export const Donate = ({
  onGoBack,
  onDonate,
  isLoading,
}: {
  onGoBack: () => void;
  onDonate: ({
    tokenAddress,
    amount,
    beneficiaryId,
  }: {
    tokenAddress: string;
    amount: number;
    beneficiaryId?: string;
  }) => void;
  isLoading?: boolean;
}) => {
  const { connectedChain, embeddedWallet, getRpcProvider } = useWallet();
  const { smartAccount } = useSmartWallet();
  const [token, setToken] = useState<Token | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    if (connectedChain?.tokens) {
      setToken(connectedChain.tokens[0]);
    }
  }, [connectedChain]);

  useEffect(() => {
    getBalance();
  }, [token, smartAccount]);

  const getBalance = async () => {
    if (!token || !smartAccount) return;
    const [smartAddress, provider] = await Promise.all([
      smartAccount?.account.getCounterFactualAddress(),
      getRpcProvider(embeddedWallet),
    ]);
    console.log(`smart address at: ${smartAddress}`);

    if (isNativeToken(token.address)) {
      const balanceWei = await provider?.getBalance(smartAddress);
      const balance = toEther(balanceWei, token.decimals);
      setBalance(balance);
    } else {
      const erc20Contract = new ethers.Contract(
        token.address,
        ERC20_JSON_ABI as any,
        provider
      );
      const balanceWei = await erc20Contract.balanceOf(smartAddress);
      const balance = toEther(balanceWei, token.decimals);
      setBalance(balance);
    }
  };

  const disabled =
    Number(amount) > balance || !balance || Number(amount) <= 0 || isLoading;
  return (
    <ShadowedContainer className="w-[90%] max-w-[560px] min-h-[280px]">
      <div className="flex justify-between items-center  mb-6 px-4">
        <div className="flex items-center gap-2">
          <button onClick={onGoBack}>
            <ChevronLeftIcon />
          </button>
          <div className="text-2xl font-bold text-center">Donate</div>
        </div>
        <UserWallet />
      </div>

      <div className="px-4">
        <div className="flex justify-between items-center gap-4">
          <input
            className="w-full bg-transparent border-b-2 border-gray-400 focus:outline-none text-4xl"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <TokenDropdown token={token} setToken={setToken} />
        </div>
        <div className="text-md text-gray-400 text-left mt-1">
          Balance: {balance} {token?.symbol}
        </div>

        <div className="mt-6">
          <PrimaryButton
            className="w-full"
            disableShadow
            disabled={disabled}
            isLoading={isLoading}
            loadingText="Donating..."
            onClick={() =>
              onDonate({
                tokenAddress: token?.address || "",
                amount: Number(amount),
              })
            }
          >
            Donate
          </PrimaryButton>
        </div>
      </div>
    </ShadowedContainer>
  );
};

const TokenDropdown = ({
  token,
  setToken,
}: {
  token: Token | null;
  setToken: (token: Token) => void;
}) => {
  const { connectedChain } = useWallet();
  const tokens = connectedChain?.tokens || [];

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          background={"transparent"}
          className="text-3xl"
        >
          <Image
            src={token?.logoUrl || EMPTY_IMAGE}
            alt=""
            width={30}
            height={30}
            className="mr-1"
          />
          {token?.symbol}
        </Button>
      </MenuTrigger>
      <MenuContent className="bg-white text-black">
        {tokens.map((token) => (
          <MenuItem
            value={token.address}
            className="text-gray-600 hover:bg-gray-100  cursor-pointer text-xl"
            onClick={() => setToken(token)}
            key={token.address}
          >
            <Image
              src={token?.logoUrl || EMPTY_IMAGE}
              alt=""
              width={30}
              height={30}
              className="mr-1"
            />
            {token.symbol}
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  );
};
