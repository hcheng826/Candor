import { Manager } from '../../generated/schema';
import { CANDOR_MANAGER, NATIVE, ZERO_BI } from '../utils/constants.template';

export function getManager(): Manager {
  let manager = Manager.load(CANDOR_MANAGER);

  // Should not enter here
  if (!manager) {
    manager = new Manager(CANDOR_MANAGER);
    manager.txCount = ZERO_BI;
    manager.totalDonationReceived = ZERO_BI;
    manager.totalDonationWithdrawn = ZERO_BI;
    manager.genericDonationReceived = ZERO_BI;
    manager.beneficiaryDonationReceived = ZERO_BI;
    manager.pledgeReceived = ZERO_BI;
    manager.beneficiaryCount = ZERO_BI;
    manager.socialContributorCount = ZERO_BI;
    manager.donorCount = ZERO_BI;
    manager.owner = NATIVE;
    manager.spAddress = NATIVE;
    manager.spHook = NATIVE;
    manager.baseCurrency = NATIVE;

    manager.save();
  }

  return manager;
}
