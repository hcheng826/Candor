// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Interfaces
import { ISPHook } from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";

interface ISPHookCandor is IERC20, ISPHook {
    // Events
    event Initialised(address worldId, uint256 externalNulliflier);
    event UserPledgeRewardMint(
        uint256 indexed nullifierHash,
        address indexed contributor,
        uint256 amount,
        uint64 attestationId
    );
    event UserPledgeRevokeBurn(
        uint256 indexed nullifierHash,
        address indexed contributor,
        uint256 amount,
        uint64 attestationId
    );
    event UserPledge(uint256 indexed nullifierHash, address indexed contributor, uint256 amount, uint256 epochIndex);
    event UserCollectorRegister(uint256 indexed nullifierHash, address collector);

    /// @notice Verifies the user and assigns the collector address for rewards.
    /// @param collector The address of the rewards collector.
    /// @param verifyingData Encoded data containing signal, root, nullifier hash, and proof.
    function proveUserAndAssignCollector(address collector, bytes calldata verifyingData) external;

    /// @notice Retrieves the score earned from a specific pledge ID.
    /// @param pledgeId The unique identifier for the pledge.
    /// @return score The score associated with the specified pledge ID.
    function getScoreWeightFromPledgeId(uint64 pledgeId) external view returns (uint256 score);

    /// @notice Retrieves the nullifier hash associated with a given attestation ID.
    /// @param attestationId The ID of the attestation to query.
    /// @return nullifierHash The nullifier hash associated with the specified attestation ID.
    function getNullifierHashFromAttestationId(uint256 attestationId) external view returns (uint256 nullifierHash);

    /// @notice Retrieves the points amount associated with a given nullifier hash.
    /// @param nullifierHash The nullifier hash to query.
    /// @return pointsAmount The amount of points associated with the specified nullifier hash.
    function getPointsForNullifierHash(uint256 nullifierHash) external view returns (uint256 pointsAmount);
}
