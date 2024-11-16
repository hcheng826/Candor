import { randomBytes } from "crypto";
import { ethers } from "ethers";

const WORLDCOIN_PROOF_PARAMS = [
  "address", // signal
  "uint256", // root
  "uint256", // nullifierHash
  "uint256[8]", // proof
];

const DUMMY_SIGNAL = "0x1234567890123456789012345678901234567890";
const DUMMY_ROOT =
  "1234567890123456789012345678901234567890123456789012345678901234";
const DUMMY_NULLIFIER_HASH =
  "1234567890123456789012345678901234567890123456789012345678901234";
const DUMMY_PROOF = ["1", "1", "1", "1", "1", "1", "1", "1"];

export function encodeWorldcoinProof(
  signal: string = DUMMY_SIGNAL,
  root: string = DUMMY_ROOT,
  nullifierHash: string = DUMMY_NULLIFIER_HASH,
  proof: string[] = DUMMY_PROOF
): string {
  const dummyNullifier = randomBytes(32).toString("hex");
  const encoder = new ethers.AbiCoder();
  return encoder.encode(WORLDCOIN_PROOF_PARAMS, [
    signal,
    root,
    dummyNullifier,
    proof,
  ]);
}
