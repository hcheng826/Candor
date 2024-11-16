import { log } from '@graphprotocol/graph-ts';
import {
  Initialised,
  UserPledgeRewardMint,
  UserPledgeRevokeBurn,
  UserCollectorRegister,
  UserPledge,
} from '../../generated/CandorSPHook/CandorSPHook';
import { AttestationInfo, Contribution } from '../../generated/schema';
import { getHookManager } from '../entities/hook-manager';
import { getWorldIdUser } from '../entities/world-id-user';
import { ONE_BI } from '../utils/constants.template';
import { getContributor } from '../entities/contributor';

export function handleHookInitialise(event: Initialised): void {
  let worldId = event.params.worldId.toHexString();
  let externalNullifier = event.params.externalNulliflier;

  let hookManager = getHookManager();
  hookManager.worldId = worldId;
  hookManager.externalNullifier = externalNullifier;

  hookManager.save();
}

export function handleUserPledgeRewardMint(event: UserPledgeRewardMint): void {
  let nullifierHash = event.params.nullifierHash;
  let addedScore = event.params.amount;
  let attestationId = event.params.attestationId;
  let contributor = event.params.contributor.toHexString();

  let attestation = new AttestationInfo(
    `${nullifierHash.toString()}-${attestationId.toString()}`
  );
  attestation.pledgeAttestationId = attestationId;
  attestation.contributor = contributor;
  attestation.nullifierHash = nullifierHash;
  attestation.revoked = false;

  attestation.save();

  let hookManager = getHookManager();

  hookManager.totalPledges = hookManager.totalPledges.plus(ONE_BI);
  hookManager.totalScore = hookManager.totalScore.plus(addedScore);

  hookManager.save();

  let worldIdUser = getWorldIdUser(nullifierHash);
  worldIdUser.score = worldIdUser.score.plus(addedScore);

  worldIdUser.save();
}

export function handleUserPledgeRevokeBurn(event: UserPledgeRevokeBurn): void {
  let nullifierHash = event.params.nullifierHash;
  let deductedScore = event.params.amount;
  let attestationId = event.params.attestationId;
  let id = `${nullifierHash.toString()}-${attestationId.toString()}`;

  let attestation = AttestationInfo.load(id);
  if (attestation === null) {
    log.error('[ATTESTATION NOT FOUND]: {}', [id]);
    return;
  }
  attestation.pledgeAttestationId = attestationId;
  attestation.nullifierHash = nullifierHash;
  attestation.revoked = true;

  attestation.save();

  let hookManager = getHookManager();

  hookManager.totalPledges = hookManager.totalPledges.plus(ONE_BI);
  hookManager.totalScore = hookManager.totalScore.minus(deductedScore);

  hookManager.save();

  let worldIdUser = getWorldIdUser(nullifierHash);
  worldIdUser.score = worldIdUser.score.minus(deductedScore);

  worldIdUser.save();
}

export function handleUserCollectorRegister(event: UserCollectorRegister): void {
  let nullifierHash = event.params.nullifierHash;
  let collectorAddress = event.params.collector.toHexString();

  let worldIdUser = getWorldIdUser(nullifierHash);
  worldIdUser.collector = collectorAddress;

  worldIdUser.save();
}

export function handleUserPledge(event: UserPledge): void {
  let nullifierHash = event.params.nullifierHash;
  // let socialWeight = event.params.amount;
  // let epoch = event.params.epochIndex;
  let attestor = event.params.contributor.toHexString();

  let contributor = getContributor(attestor);
  let worldIdUser = getWorldIdUser(nullifierHash);

  // Tag worldIdUser to `contributor`
  if (contributor.worldIdUser === null) {
    contributor.worldIdUser = worldIdUser.id;
  }

  contributor.save();
}
