import axios from "axios";
import { ethers } from "ethers";

const CANDOR_ATTESTATION_PARAMS = ["uint256", "string"];

/**
 * Decodes the encoded candor review string back to its original ratings and comment.
 * @param {string} encodedProof - The encoded string to decode.
 * @returns {{ ratings: number, comment: string }} - An object containing the ratings and comment.
 */
export const decodeSPCandorPledge = (
  encodedProof: string
): {
  ratings: number;
  comment: string;
} => {
  // Decode the encoded review
  const encoder = new ethers.AbiCoder();
  const [ratings, comment] = encoder.decode(
    CANDOR_ATTESTATION_PARAMS,
    encodedProof
  );

  return {
    ratings: ratings.toNumber(), // Convert BigNumber to number
    comment: comment,
  };
};

export const encodeSPCandorPledge = (
  ratings: number,
  comment: string
): string => {
  const encoder = new ethers.AbiCoder();
  return encoder.encode(CANDOR_ATTESTATION_PARAMS, [ratings, comment]);
};

const SIGN_PROTOCOL_TESTNET_URL_PREFIX = "https://testnet-rpc.sign.global/api";

export const getPledges = async () => {
  const API_URL = `${SIGN_PROTOCOL_TESTNET_URL_PREFIX}/index/attestations?schemaId=onchain_evm_84532_0x2ed`;

  const res = await axios.get(API_URL);

  const reviews: any[] = [];
  res.data.data.rows.forEach((row: any) => {
    try {
      const { ratings, comment } = decodeSPCandorPledge(row.data);

      //   Attestation memory pledgeAttestation = Attestation({
      //     schemaId: pledgeSchemaId, // Schema for pledge
      //     linkedAttestationId: 0,
      //     attestTimestamp: uint64(block.timestamp),
      //     revokeTimestamp: 0,
      //     attester: address(this), // Transactee is the reviewer in this case
      //     validUntil: 0, // No expiration for the review attestation
      //     dataLocation: DataLocation.ONCHAIN,
      //     revoked: false,
      //     recipients: recipients,
      //     data: pledge // Pledge metadata
      // });

      reviews.push({
        ratings,
        comment,
        id: row.id,
        beneficiary: row.recipients[0],
        contributor: row.recipients[1],
      });
    } catch (_) {
      console.error("Failed to decode pledge", row.data);
    }
  });

  return reviews;
};
