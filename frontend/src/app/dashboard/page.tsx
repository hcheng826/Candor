"use client";
import { ShadowedContainer } from "@/components/Container";
import {
  useGetBeneficiary,
  useGetBeneficiaryDonationPledgeTransactions,
  useGetBeneficiaryMetrics,
} from "@/hooks/data";
import { Table } from "@chakra-ui/react";
import { BgImage } from "../Home";
import { useWallet } from "@/hooks/useWallet";
import { UserWallet } from "@/components/LoginWallet/UserWallet";
import AllocatedFundChart from "./AllocatedFundChart";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  getExplorerUrl,
  getSignProtocolAttestationUrl,
  truncateAddress,
} from "@/utils";
import Link from "next/link";
import { formatDate } from "@/utils";
import { PrimaryButton } from "@/components/Button/PrimaryButton";
import { useRouter } from "next/navigation";

export default function Page() {
  const HARDCODED_WALLET = "0xb78ce55df582074f4cc7cdb2888a1b7cfb021689";

  let { walletAddress, connectedChain } = useWallet();
  const { data: beneficiary, isLoading: isBeneficiaryLoading } =
    useGetBeneficiary(HARDCODED_WALLET);
  const { data: beneficiaryMetrics, isLoading: isBeneficiaryMetricsLoading } =
    useGetBeneficiaryMetrics(HARDCODED_WALLET);
  const { data: txs, isLoading: isTxsLoading } =
    useGetBeneficiaryDonationPledgeTransactions(HARDCODED_WALLET);
  const router = useRouter();

  useEffect(() => {
    if (!walletAddress) {
      router.replace("/login?target=dashboard");
    }
  }, [walletAddress]);

  if (
    isBeneficiaryLoading ||
    isBeneficiaryMetricsLoading ||
    !beneficiary ||
    !beneficiaryMetrics
  ) {
    return (
      <div className="w-full h-full min-h-screen flex flex-col justify-center items-center">
        <BgImage />
        <ShadowedContainer className="w-full max-w-[560px] min-h-[540px]">
          <div className="text-2xl">Loading...</div>
        </ShadowedContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen flex flex-col justify-center items-center overflow-hidden">
      <BgImage />
      <ShadowedContainer className="w-full max-w-[760px] min-h-[140px]">
        <div className="flex items-start gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={beneficiary?.imageUrl}
              alt="logo"
              width={100}
              height={100}
            />
            <div>
              <div className="text-2xl">{beneficiary?.name}</div>
              <div className="text-gray-400 text-sm">
                {beneficiary?.description}
              </div>
            </div>
          </div>
          <UserWallet />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-6 justify-between mt-2">
          <div>
            <div className="text-gray-400 text-lg">Total Donations</div>
            <div className="text-5xl mt-1">
              ${beneficiaryMetrics?.totalDonationsUSD}
            </div>
            <div className="h-[20px]"></div>
          </div>
          <div>
            <div className="text-gray-400 text-lg whitespace-nowrap">
              Estimated Pending Allocated Fund
            </div>
            <div className="text-5xl mt-1">
              ${beneficiaryMetrics?.genericPool?.allocatedAmountUSD}
            </div>
            <div className="text-gray-400 text-sm whitespace-nowrap">
              Next epoch in{" "}
              <Timer seconds={beneficiaryMetrics?.nextEpoch || 0} />
            </div>
          </div>
          <AllocatedFundChart />
        </div>

        <div className="w-[fit-content]">
          <PrimaryButton>Claim total funds</PrimaryButton>
        </div>
      </ShadowedContainer>

      <ShadowedContainer className="w-full max-w-[760px] min-h-[340px] mt-6">
        <div className="text-2xl">Donator</div>

        <div className="overflow-x-auto w-full">
          <Table.Root
            size="lg"
            variant="outline"
            striped
            backgroundColor="transparent"
            className="text-black border-none shadow-none"
          >
            <Table.Header
              backgroundColor="transparent"
              color="black"
              className="text-black"
            >
              <Table.Row>
                <Table.ColumnHeader className="text-gray-500 bg-transparent">
                  Address
                </Table.ColumnHeader>
                <Table.ColumnHeader className="text-gray-500 bg-transparent">
                  Amount
                </Table.ColumnHeader>
                <Table.ColumnHeader className="text-gray-500 bg-transparent">
                  Social Score
                </Table.ColumnHeader>
                <Table.ColumnHeader className="text-gray-500 bg-transparent">
                  Date
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  className="text-gray-500 bg-transparent"
                  textAlign="end"
                >
                  Tx hash
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {txs?.map((tx) => (
                <Table.Row
                  key={tx.address + tx.donateTxHash + tx.pledgeTxHash}
                  backgroundColor="transparent"
                  color="black"
                  className="border-t border-gray-200"
                >
                  <Table.Cell className="text-black bg-transparent">
                    {truncateAddress(tx.address)}
                  </Table.Cell>
                  <Table.Cell className="text-black bg-transparent">
                    <div className="flex items-center gap-1">
                      {tx.amount}
                      <Image
                        src="https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389"
                        alt="token"
                        width={16}
                        height={16}
                        className=""
                      />
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-black bg-transparent">
                    {tx.socialScore}
                  </Table.Cell>
                  <Table.Cell className="text-black bg-transparent">
                    {formatDate(tx.date)}
                  </Table.Cell>
                  <Table.Cell
                    textAlign="end"
                    className="text-black bg-transparent"
                  >
                    <div className="flex flex-col gap-1">
                      {tx.donateTxHash != null && (
                        <div className="text-gray-500 text-sm">
                          Donation tx:{" "}
                          <Link
                            href={`${getExplorerUrl(connectedChain, tx.donateTxHash)}`}
                            target="_blank"
                            className="underline"
                          >
                            {truncateAddress(tx.donateTxHash)}
                          </Link>
                        </div>
                      )}

                      {tx.pledgeTxHash != null && (
                        <div className="text-gray-500 text-sm">
                          Pledge tx:{" "}
                          <Link
                            href={`${getSignProtocolAttestationUrl(connectedChain, Number(tx.pledgeAttestationId))}`}
                            target="_blank"
                            className="underline"
                          >
                            {truncateAddress(tx.pledgeTxHash)}
                          </Link>
                        </div>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </ShadowedContainer>
    </div>
  );
}

const Timer = ({ seconds }: { seconds: number }) => {
  const [time, setTime] = useState(seconds);
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const secondsDisplay = time % 60;

  useEffect(() => {
    setTime(seconds);
  }, [seconds]);

  if (time <= 0) {
    return <span>-</span>;
  }

  return <span>{`${hours}:${minutes}:${secondsDisplay}`}</span>;
};
