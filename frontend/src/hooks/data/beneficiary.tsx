import { fetchEpochSeconds } from "@/contracts/interact/candor";
import {
  getAllBeneficiaries,
  getBeneficiaryByAddress,
} from "@/graphql/beneficiary";
import { getContributonsByBeneficiaryId } from "@/graphql/contributor";
import { USDC_DECIMALS, isNativeToken, toEther } from "@/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSmartWallet, useWallet } from "../useWallet";
import { ERC20_JSON_ABI } from "@/contracts/abi";
import { ethers } from "ethers";
import { getSmartAddressFromSmartAccount } from "@/utils/address";
import { BLOCKCHAIN_NETWORK } from "@/types";

export const useGetAllBeneficiaries = () => {
  return useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => {
      const res = await getAllBeneficiaries();
      console.log("beneficiaries", res);
      return res;
    },
    placeholderData: keepPreviousData,
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetTokenBalance = ({
  tokenAddress,
  tokenDecimals,
}: {
  tokenAddress?: string;
  tokenDecimals?: number;
}) => {
  const {
    embeddedWallet,
    getRpcProvider,
    connectedChain,
    isMiniApp,
    miniAppAddress,
  } = useWallet();
  const { smartAccount } = useSmartWallet() as any;

  return useQuery({
    queryKey: [
      "token-balance",
      tokenAddress,
      miniAppAddress,
      getSmartAddressFromSmartAccount(smartAccount),
      connectedChain,
      isMiniApp,
    ],
    queryFn: async () => {
      if (!tokenAddress || !smartAccount || !tokenDecimals) return;

      //if using miniApp, read manually from world chain balance
      if (isMiniApp) {
        if (!miniAppAddress || !connectedChain) return 0;
        const provider = new ethers.JsonRpcProvider(connectedChain.rpcUrl);

        if (isNativeToken(tokenAddress)) {
          const ethBalance = await provider.getBalance(miniAppAddress);
          return toEther(ethBalance.toString(), 18);
        } else {
          const erc20Contract = new ethers.Contract(
            tokenAddress,
            ERC20_JSON_ABI as any,
            provider
          );
          const balanceWei = await erc20Contract.balanceOf(miniAppAddress);
          const balance = toEther(balanceWei.toString(), tokenDecimals);
          return balance;
        }
      }

      const smartAddress = getSmartAddressFromSmartAccount(smartAccount);
      const provider = await getRpcProvider(embeddedWallet);
      console.log(`smart address at: ${smartAddress}`);

      if (isNativeToken(tokenAddress)) {
        const balanceWei = await provider?.getBalance(smartAddress);
        const balance = toEther(balanceWei, tokenDecimals);
        return balance;
      } else {
        const erc20Contract = new ethers.Contract(
          tokenAddress,
          ERC20_JSON_ABI as any,
          provider
        );
        const balanceWei = await erc20Contract.balanceOf(smartAddress);
        const balance = toEther(balanceWei, tokenDecimals);

        console.log("balance: ", balance);
        return balance;
      }
    },
    placeholderData: keepPreviousData,
    initialData: 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    refetchInterval: 2500,
    enabled: !!tokenAddress,
  });
};

export const useGetBeneficiary = (address: string) => {
  return useQuery({
    queryKey: ["beneficiaries", address],
    queryFn: async () => {
      return await getBeneficiaryByAddress(address);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetBeneficiaryMetrics = (address: string) => {
  return useQuery({
    queryKey: ["beneficiary-metrics", address],
    queryFn: async () => {
      try {
        const [res, epoch] = await Promise.all([
          getBeneficiaryByAddress(address),
          fetchEpochSeconds(),
        ]);

        return {
          totalDonations: 100, //in base currency
          totalDonationsUSD: toEther(
            res?.directDonationReceived ?? "0",
            USDC_DECIMALS
          ), //in USD
          totalDonators: res?.contributorCount,
          nextEpoch: epoch.end - epoch.start, //in seconds
          genericPool: {
            totalAmount: 1000, //in base currency
            totalAmountUSD: 1000, //in USD
            totalDonators: 100,
            allocation: 0.2, //FIXME:
            allocatedAmount: 200, //in base currency
            allocatedAmountUSD: toEther(
              res?.clrMatchDonationReceived ?? "0",
              USDC_DECIMALS
            ), //in USD
          },
        };
      } catch (err) {
        console.error(err);
      }
    },
  });
};

export const useGetBeneficiaryDonationPledgeTransactions = (
  address: string
) => {
  const { connectedChain } = useWallet();
  return useQuery({
    queryKey: [
      "donation-pledge-transactions",
      address,
      connectedChain?.chainIdNum,
    ],
    queryFn: async () => {
      try {
        if (!connectedChain) return;
        const beneficiary = await getBeneficiaryByAddress(address);
        if (beneficiary?.gqlId == null) return [];

        return await getContributonsByBeneficiaryId(
          beneficiary?.gqlId,
          connectedChain?.chainIdNum
        );
      } catch (err) {
        console.error(err);
      }
    },
  });
};
