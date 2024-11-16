import { HookManager } from '../../generated/schema';

import { CANDOR_HOOK, NATIVE, ZERO_BI } from '../utils/constants.template';

export function getHookManager(): HookManager {
  let stat = HookManager.load(CANDOR_HOOK);

  if (!stat) {
    stat = new HookManager(CANDOR_HOOK);
    stat.worldId = NATIVE;
    stat.externalNullifier = ZERO_BI;
    stat.totalScore = ZERO_BI;
    stat.totalPledges = ZERO_BI;

    stat.save();
  }

  return stat;
}
