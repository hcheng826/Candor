import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/Button/PrimaryButton";
import { ShadowedContainer } from "@/components/Container";
import { UserWallet } from "@/components/LoginWallet/UserWallet";
import { Loader } from "@/components/ui/Loader";
import { useGetAllBeneficiaries } from "@/hooks/data";
import { Beneficiary } from "@/types";

export const ChoosePool = ({
  onChooseDonate,
  onChoosePledge,
}: {
  onChooseDonate: (beneficiary: Beneficiary) => void;
  onChoosePledge: (beneficiary: Beneficiary) => void;
}) => {
  const { data: beneficiaries } = useGetAllBeneficiaries();
  return (
    <ShadowedContainer className="w-[90%] max-w-[560px] min-h-[540px]">
      <div className="flex justify-between items-center  mb-6 px-4">
        <div className="text-2xl font-bold ">Choose your beneficiary</div>
        <UserWallet />
      </div>

      <div className="px-4">
        {!beneficiaries?.length && (
          <div className="flex justify-center items-center h-[200px]">
            <Loader style={{ width: "28px", height: "28px" }} />
          </div>
        )}
        {beneficiaries?.map((beneficiary) => (
          <BeneficiaryCard
            beneficiary={beneficiary}
            key={beneficiary.id}
            onChoose={onChooseDonate}
            onPledge={onChoosePledge}
          />
        ))}
      </div>
    </ShadowedContainer>
  );
};

export const BeneficiaryCard = ({
  beneficiary,
  onChoose,
  onPledge,
}: {
  beneficiary: Beneficiary;
  onChoose?: (beneficiary: Beneficiary) => void;
  onPledge?: (beneficiary: Beneficiary) => void;
}) => {
  const FinalSecondaryButton = onChoose ? SecondaryButton : PrimaryButton;
  return (
    <div className="flex flex-wrap items-center sm:gap-4 md:gap-6 sm:justify-center md:justify-between bg-[#F5F5F5] p-4 py-4 rounded-lg mb-2 hover:brightness-[96%] transition-all cursor-pointer">
      <img
        src={beneficiary.imageUrl}
        alt={beneficiary.name}
        className=" sm:w-[50px] sm:h-[50px] md:w-[130px] md:h-[130px]"
      />

      <div className="flex-1 min-w-[250px]">
        <div className="text-xl">{beneficiary.name}</div>
        <div className="opacity-50">{beneficiary.description}</div>
        <div className="flex gap-4 mt-2">
          {onChoose && (
            <PrimaryButton
              className="text-sm min-w-[initial] rounded-lg"
              disableShadow
              onClick={() => onChoose(beneficiary)}
            >
              Donate
            </PrimaryButton>
          )}
          {beneficiary.id !== "0" && onPledge && (
            <FinalSecondaryButton
              className="text-sm min-w-[initial] rounded-lg"
              disableShadow
              onClick={() => onPledge(beneficiary)}
            >
              Pledge
            </FinalSecondaryButton>
          )}
        </div>
      </div>
    </div>
  );
};
