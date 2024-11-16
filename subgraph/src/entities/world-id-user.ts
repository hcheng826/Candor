import { BigInt } from '@graphprotocol/graph-ts';
import { WorldIdUser } from '../../generated/schema';
import { NATIVE, ZERO_BI } from '../utils/constants.template';

export function getWorldIdUser(nullifierHash: BigInt): WorldIdUser {
  let id = nullifierHash.toString();
  let worldIdUser = WorldIdUser.load(id);

  if (!worldIdUser) {
    worldIdUser = new WorldIdUser(id);

    worldIdUser.nullifierHash = nullifierHash;
    worldIdUser.contributions = [];
    worldIdUser.collector = NATIVE;
    worldIdUser.score = ZERO_BI;

    worldIdUser.save();
  }

  return worldIdUser;
}
