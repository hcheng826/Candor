import { ShadowedContainer } from "@/components/Container";
import { BeneficiaryCard } from "./ChoosePool";
import { Beneficiary } from "@/types";
import Image from "next/image";
import styled from "@emotion/styled";

export const StyledHeart = styled.div`
  width: 40px;
  height: 40px;
  background-image: url('/heart.svg');
  background-size: contain;
  background-repeat: no-repeat;
  position: absolute;
  top: 0;
  left: -20px;

  animation: heartbeat 1.5s infinite;

  @keyframes heartbeat {
    0% { transform: scale(1) translate(0, 0); opacity: 1 }
    // 50% { transform: scale(1.2) translate(-10px, -10px); opacity: 0.5 }
    100% { transform: scale(1.4) translate(-20px, -20px); opacity: 0 }
  }
`;

export const SuccessDonation = ({
  onGoBack,
  beneficiary,
  onPledge,
}: {
  onGoBack: () => void;
  beneficiary: Beneficiary | null;
  onPledge: () => void;
}) => {
  return (
    <ShadowedContainer className="w-full max-w-[560px] min-h-[280px]">
      <div className="flex justify-center items-center mb-6 px-4">
        <div className="flex items-center gap-2">
          {/* <button onClick={onGoBack}>
            <ChevronLeftIcon />
          </button> */}
          <div className="text-2xl font-bold text-center">
            Thank you for your donation!
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
          <BeneficiaryCard beneficiary={beneficiary} onPledge={onPledge} />
        )}
      </div>
    </ShadowedContainer>
  );
};
