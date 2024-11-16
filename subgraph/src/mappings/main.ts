import { dataSource, log } from '@graphprotocol/graph-ts';
// Events from ABI
import {
  Initialised,
  BeneficiaryRegistered,
  BeneficiaryUpdate,
  DonationReceived,
  DonationWithdrawn,
  PledgeAttested,
} from '../../generated/Candor/Candor';
// Schema
import { Manager, Beneficiary, Contribution } from '../../generated/schema';
// Helper
import { getManager } from '../entities/manager';
import { NATIVE, ONE_BI, USDC_BASE_SEPOLIA, ZERO_BI } from '../utils/constants.template';
import { loadTransaction } from '../entities/transaction';

import { getUser } from '../entities/user';
import { getContributor } from '../entities/contributor';
import { getBeneficiary, getBeneficiaryIdFormat } from '../entities/beneficiary';
import { getToken } from '../entities/token';

// Initialization Handler
export function handleInitialise(event: Initialised): void {
  let owner = event.params.owner.toHexString();
  let spAddress = event.params.spInstance.toHexString();
  let spHook = event.params.spHook.toHexString();
  let baseCurrency = event.params.baseCurrency.toHexString();

  let manager = new Manager(dataSource.address().toHexString().toLowerCase());

  manager.spAddress = spAddress;
  manager.spHook = spHook;
  manager.baseCurrency = baseCurrency;
  manager.txCount = ZERO_BI;
  manager.totalDonationReceived = ZERO_BI;
  manager.totalDonationWithdrawn = ZERO_BI;
  manager.genericDonationReceived = ZERO_BI;
  manager.beneficiaryDonationReceived = ZERO_BI;
  manager.pledgeReceived = ZERO_BI;
  manager.beneficiaryCount = ZERO_BI;
  manager.socialContributorCount = ZERO_BI;
  manager.donorCount = ZERO_BI;
  manager.owner = owner;

  manager.save();

  let formattedGenericPoolId = getBeneficiaryIdFormat(ZERO_BI);

  let beneficiary = new Beneficiary(formattedGenericPoolId);
  let entity = getUser(NATIVE, 'GENERIC'); // generic pool

  beneficiary.beneficiaryId = ZERO_BI;
  beneficiary.user = entity.id;
  beneficiary.directDonationReceived = ZERO_BI;
  beneficiary.clrMatchDonationReceived = ZERO_BI;
  beneficiary.socialMatchDonationReceived = ZERO_BI;
  beneficiary.pledgeCount = ZERO_BI;
  beneficiary.donorCount = ZERO_BI;
  beneficiary.contributorCount = ZERO_BI;
  beneficiary.withdrawn = ZERO_BI;

  beneficiary.save();

}

export function handleRegisterBeneficiary(event: BeneficiaryRegistered): void {
  let beneficiaryId = event.params.beneficiaryId;
  let beneficiaryAddress = event.params.beneficiaryAddress.toHexString();

  let formattedBeneficiaryId = getBeneficiaryIdFormat(beneficiaryId);

  let entity = getUser(beneficiaryAddress, 'BENEFICIARY');
  let beneficiary = new Beneficiary(formattedBeneficiaryId);

  beneficiary.beneficiaryId = beneficiaryId;
  beneficiary.user = entity.id;
  beneficiary.directDonationReceived = ZERO_BI;
  beneficiary.clrMatchDonationReceived = ZERO_BI;
  beneficiary.socialMatchDonationReceived = ZERO_BI;
  beneficiary.pledgeCount = ZERO_BI;
  beneficiary.donorCount = ZERO_BI;
  beneficiary.contributorCount = ZERO_BI;
  beneficiary.withdrawn = ZERO_BI;

  beneficiary.save();

  // Update Manager
  let manager = getManager();

  manager.beneficiaryCount = manager.beneficiaryCount.plus(ONE_BI);

  manager.save();
}

export function handleUpdateBeneficiary(event: BeneficiaryUpdate): void {
  let beneficiaryId = event.params.beneficiaryId;
  let updatedBeneficiaryAddress = event.params.beneficiaryAddress.toHexString();

  // Update 'user' entity on Beneficiary entity
  let beneficiary = getBeneficiary(beneficiaryId);
  let newBeneficiaryEntity = getUser(updatedBeneficiaryAddress, 'BENEFICIARY');

  beneficiary.user = newBeneficiaryEntity.id;

  beneficiary.save();
}

export function handleDonationReceived(event: DonationReceived): void {
  let beneficiaryId = event.params.beneficiaryId;
  let amount = event.params.amount;
  let epoch = event.params.epochIndex;
  let donor = event.params.donor.toHexString();

  let contributor = getContributor(donor);

  contributor.donationCount = contributor.donationCount.plus(ONE_BI);
  if (beneficiaryId === ZERO_BI) {
    contributor.genericAmount = contributor.genericAmount.plus(amount);
  } else {
    contributor.directAmount = contributor.directAmount.plus(amount);
  }
  contributor.save();

  let transaction = loadTransaction(event);
  let contribution = new Contribution(`${beneficiaryId}-${donor}-BENEFICIARY`);

  contribution.type = 'BENEFICIARY';
  contribution.beneficiary = getBeneficiary(beneficiaryId).id;
  contribution.contributor = contributor.id;
  contribution.pledgeAttestationId = ZERO_BI;
  contribution.amount = amount;
  contribution.token = getToken(USDC_BASE_SEPOLIA).id;
  contribution.epoch = epoch;
  contribution.tx = transaction.id;
  contribution.timestamp = event.block.timestamp;

  contribution.save();

  // Update beneficiary
  let beneficiary = getBeneficiary(beneficiaryId);

  beneficiary.directDonationReceived = beneficiary.directDonationReceived.plus(amount);

  beneficiary.save();

  // Update manager
  let manager = getManager();

  manager.beneficiaryDonationReceived = manager.beneficiaryDonationReceived.plus(amount);
  manager.totalDonationReceived = manager.totalDonationReceived.plus(amount);

  manager.save();
}

export function handleDonationWithdrawn(event: DonationWithdrawn): void {
  let beneficiaryId = event.params.beneficiaryId;
  let amount = event.params.amount;

  // 1. Update Beneficiary
  let beneficiary = getBeneficiary(beneficiaryId);
  beneficiary.withdrawn = beneficiary.withdrawn.plus(amount);

  beneficiary.save();

  // 2. Update Manager
  let manager = getManager();
  manager.totalDonationWithdrawn = manager.totalDonationWithdrawn.plus(amount);

  manager.save();
}

export function handlePledgeAttest(event: PledgeAttested): void {
  let beneficiaryId = event.params.beneficiaryId;
  let epoch = event.params.epochIndex;
  let pledgeAttestationId = event.params.attestationId;
  let attestor = event.params.contributor.toHexString();

  // 1. Update contributor
  let contributor = getContributor(attestor);
  contributor.pledgeCount = contributor.pledgeCount.plus(ONE_BI);

  contributor.save();

  let transaction = loadTransaction(event);
  // 2. Update contributions
  let contribution = new Contribution(
    `${beneficiaryId}-${attestor}-${epoch}-BENEFICIARY_PLEDGE`
  );

  contribution.type = 'BENEFICIARY_PLEDGE';
  contribution.beneficiary = getBeneficiary(beneficiaryId).id;
  contribution.contributor = contributor.id;
  contribution.pledgeAttestationId = pledgeAttestationId;
  contribution.amount = ZERO_BI;
  contribution.token = getToken(USDC_BASE_SEPOLIA).id;
  contribution.epoch = epoch;
  contribution.tx = transaction.id;
  contribution.timestamp = event.block.timestamp;

  contribution.save();

  // 3. Update manager
  let manager = getManager();
  manager.pledgeReceived = manager.pledgeReceived.plus(ONE_BI);

  manager.save();
}
