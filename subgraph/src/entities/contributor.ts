import { Contributor } from '../../generated/schema';
import { ZERO_BI } from '../utils/constants.template';
import { getUser } from './user';

export function getContributor(address: string): Contributor {
  let contributor = Contributor.load(address);

  if (!contributor) {
    contributor = new Contributor(address);

    let user = getUser(address, 'CONTRIBUTOR');
    contributor.user = user.id;
    contributor.directAmount = ZERO_BI;
    contributor.genericAmount = ZERO_BI;
    contributor.pledgeCount = ZERO_BI;
    contributor.donationCount = ZERO_BI;

    contributor.save();
  }

  return contributor;
}
