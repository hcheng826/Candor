import { BigInt } from '@graphprotocol/graph-ts';
import { Beneficiary } from '../../generated/schema';
import { NATIVE, ZERO_BI } from '../utils/constants.template';

export function getBeneficiaryIdFormat(id: BigInt): string {
  return `BENEFICIARY-${id.toString()}`;
}

export function getBeneficiary(id: BigInt): Beneficiary {
  let stringId = getBeneficiaryIdFormat(id);
  let beneficiary = Beneficiary.load(stringId);

  // Should not enter here
  if (!beneficiary) {
    beneficiary = new Beneficiary(stringId);

    beneficiary.beneficiaryId = id;
    beneficiary.user = NATIVE;
    beneficiary.directDonationReceived = ZERO_BI;
    beneficiary.clrMatchDonationReceived = ZERO_BI;
    beneficiary.socialMatchDonationReceived = ZERO_BI;
    beneficiary.pledgeCount = ZERO_BI;
    beneficiary.donorCount = ZERO_BI;
    beneficiary.contributorCount = ZERO_BI;
    beneficiary.withdrawn = ZERO_BI;

    beneficiary.save();
  }

  return beneficiary;
}
