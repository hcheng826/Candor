import { ShadowedContainer } from "@/components/Container";
import { BeneficiaryCard } from "./ChoosePool";
import { Beneficiary } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StyledHeart } from "./SuccessDonation";

export const SuccessPledge = ({
  onGoBack,
  beneficiary,
}: {
  onGoBack: () => void;
  beneficiary: Beneficiary | null;
}) => {
  return (
    <ShadowedContainer className="w-full max-w-[560px] min-h-[280px]">
      <div className="flex justify-center items-center mb-6 px-4">
        <div className="flex items-center gap-2">
          {/* <button onClick={onGoBack}>
            <ChevronLeftIcon />
          </button> */}
          <div className="text-2xl font-bold text-center">
            Thank you for your pledge!
          </div>
        </div>
        {/* <UserWallet /> */}
      </div>

      <div className="px-4">
        <div className="relative w-[160px] h-[160px] mx-auto">
          <Image
            src="/character.svg"
            alt="character"
            width={160}
            height={160}
            className="mx-auto block"
          />
          <StyledHeart />
        </div>
        {beneficiary && (
          <div className="[&>div]:h-[120px]">
            <BeneficiaryCard beneficiary={beneficiary} />
          </div>
        )}
        <Button
          className="w-full border border-gray-400"
          variant={"outline"}
          background="transparent"
          onClick={onGoBack}
        >
          Go back to beneficiary
        </Button>
      </div>
    </ShadowedContainer>
  );
};
