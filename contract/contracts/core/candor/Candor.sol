// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { CandorController } from "./CandorController.sol";
import { OneInchSwapHelper } from "../1Inch/OneInchSwapHelper.sol";
import { ClrFundHelper } from "../clr-fund/ClrFundHelper.sol";
import { BoringOwnable } from "../helpers/BoringOwnable.sol";

// Interfaces
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";
import { ISP } from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import { ISPHook } from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";
import { ISPHookCandor } from "../../interfaces/ISPHookCandor.sol";

// Models
import { Contribution } from "./models/Contribution.sol";
import { Attestation } from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import { DataLocation } from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import { Schema } from "@ethsign/sign-protocol-evm/src/models/Schema.sol";

// Libraries
import { TimeLib } from "../libraries/TimeLib.sol";
import { BytesHelperLib } from "../libraries/BytesHelperLib.sol";
import { StringHelperLib } from "../libraries/StringHelperLib.sol";

error ConfirmationAddressMismatch();
error BeneficiaryNotPledged(address contributor, uint256 beneficiaryId);
error BeneficiaryPledged(uint256 epochIndex, address contributor);

/// @title Candor Contract
/// @notice Contract for managing payments and reviews with attestation and verification logic.
contract Candor is CandorController, BoringOwnable, OneInchSwapHelper {
    using BytesHelperLib for bytes;
    using StringHelperLib for string;

    // Sign Protocol Instances
    ISP public spInstance; // Reference address book
    ISPHookCandor public spHookInstance;
    uint64 public pledgeSchemaId;

    // Events
    event Initialised(address owner, address spInstance, address spHook, address baseCurrency);

    /// @notice Modifier to ensure a contribution exists for the specified contributor and beneficiary in the current epoch.
    modifier onlyPledgedContribution(address contributor, uint256 beneficiaryId) {
        uint256 curEpoch = _getEpochIndex(block.timestamp);
        uint64 pledgeId = _donorContributionRegistry[contributor][curEpoch][beneficiaryId].pledgeAttestationId;

        if (pledgeId == 0) revert BeneficiaryNotPledged(contributor, beneficiaryId);
        _;
    }
    /// @notice Initializes the contract with necessary parameters.
    /// @param _schemaId The schema Id of the Sign Protocol review shema registered.
    /// @param _spInstance The address of the Sign Protocol instance.
    /// @param _spHook The address of the Sign Protocol Hook instance.
    /// @param _baseCurrency The base currency for transactions.
    /// @param _aggregatorRouterV6 The address of the Aggregator Router for token swaps.
    constructor(
        uint64 _schemaId,
        address _spInstance,
        address _spHook,
        address _baseCurrency,
        address _aggregatorRouterV6
    ) BoringOwnable(_msgSender()) CandorController(_baseCurrency) OneInchSwapHelper(_aggregatorRouterV6) {
        spInstance = ISP(_spInstance);
        pledgeSchemaId = _schemaId;
        spHookInstance = ISPHookCandor(_spHook); // point system

        emit Initialised(_msgSender(), _spInstance, _spHook, _baseCurrency);
    }

    /// @notice Sets the Sign Protocol instance.
    /// @param instance The address of the new Sign Protocol instance.
    function setSPInstance(address instance) external onlyOwner {
        spInstance = ISP(instance);
    }

    /// @notice Sets the Sign Protocol Hook instance.
    /// @param hookInstance The address of the new Sign Protocol Hook instance.
    function setSPHookInstance(address hookInstance) external onlyOwner {
        spHookInstance = ISPHookCandor(hookInstance);
    }

    /// @notice Sets the schema ID for pledge attestations.
    /// @param schemaId_ The new schema ID for pledges.
    function setPledgeSchemaId(uint64 schemaId_) external onlyOwner {
        pledgeSchemaId = schemaId_;
    }

    /// @notice Allows users to donate using the base currency.
    /// @param beneficiaryId The beneficiary's ID.
    /// @param amount The donation amount in base currency.
    /// @param data Additional data for the donation.
    function donateByBaseCurrency(uint256 beneficiaryId, uint256 amount, bytes calldata data) external {
        // Call the internal function to settle the payment using base currency
        _settleDonationTransfer(beneficiaryId, amount, BASE_CURRENCY, data);
    }

    /// @notice Allows users to donate using an alternative currency.
    /// @param beneficiaryId The beneficiary's ID.
    /// @param inputAmount The donation amount in alternative currency.
    /// @param currency The alternative currency address.
    /// @param swapData Swap data for the donation.
    function donateByAltCurrency(
        uint256 beneficiaryId,
        uint256 inputAmount,
        address currency,
        bytes calldata swapData
    ) external {
        // Call the internal function to settle the donation using the alternative currency
        _settleDonationTransfer(beneficiaryId, inputAmount, currency, swapData);
    }

    function donateAndAttest(
        uint256 beneficiaryId,
        uint256 amount,
        bytes calldata data,
        bytes calldata encodedProof
    ) external returns (uint64 attestationId) {
        _settleDonationTransfer(beneficiaryId, amount, BASE_CURRENCY, data);
        attestationId = _attestSocialPledge(beneficiaryId, data, encodedProof);
    }

    /// @notice Attests a pledge to a beneficiary for the current epoch.
    /// @param beneficiaryId The beneficiary's ID.
    /// @param data Attestation data for the pledge.
    /// @param encodedProof Encoded proof for attestation.
    /// @return attestationId The ID of the created attestation.
    function attestPledge(
        uint256 beneficiaryId,
        bytes calldata data,
        bytes calldata encodedProof
    ) external returns (uint64 attestationId) {
        // Only attestable for current epoch - valid check for beneficiaryId inside
        attestationId = _attestSocialPledge(beneficiaryId, data, encodedProof);
    }

    /// @notice Revokes a pledge attestation for the current epoch.
    /// @param beneficiaryId The beneficiary's ID whose attestation is to be revoked.
    /// @dev Only for current epoch, cannot revoke expired epochIndex
    function revokePledgeAttestation(uint256 beneficiaryId) external {
        _revokePledgeAttestation(beneficiaryId, msg.sender);
    }

    /// @notice Internal function to settle a donation transfer.
    /// @param beneficiaryId The beneficiary's ID.
    /// @param inputAmount The donation amount.
    /// @param currency The currency address.
    /// @param data Additional data for the donation transfer.
    function _settleDonationTransfer(
        uint256 beneficiaryId,
        uint256 inputAmount,
        address currency,
        bytes calldata data
    ) internal {
        if (currency == BASE_CURRENCY) {
            _settleDonationTransferByBaseCurrency(beneficiaryId, inputAmount);
        } else {
            uint256 swappedAmount;

            if (currency == address(0)) {
                swappedAmount = _swapNativeToToken(data);
            } else {
                swappedAmount = _swapTokenToToken(currency, inputAmount, data);
            }

            _settleDonationTransferByBaseCurrency(beneficiaryId, swappedAmount);
        }
    }

    /// @notice Internal function to settle a donation using the base currency.
    /// @param beneficiaryId The beneficiary's ID.
    /// @param amount The donation amount.
    function _settleDonationTransferByBaseCurrency(uint256 beneficiaryId, uint256 amount) internal {
        _transferIn(BASE_CURRENCY, msg.sender, amount);
        // Update Beneficiary collected donation
        _updateDonation(beneficiaryId, amount, msg.sender);

        // @TO_DO: Call SPHOOK Contract to update points tracking
    }

    /// @notice Internal function to create a social pledge attestation.
    /// @param beneficiaryId The beneficiary's ID.
    /// @param pledge Pledge data.
    /// @param encodedProof Encoded proof for the pledge.
    /// @return attestationId The ID of the created attestation.
    function _attestSocialPledge(
        uint256 beneficiaryId,
        bytes calldata pledge,
        bytes calldata encodedProof
    ) internal onlyValidBeneficiary(beneficiaryId) returns (uint64 attestationId) {
        address contributor = msg.sender;
        address beneficiary = beneficiaryRegistry[beneficiaryId];

        bytes[] memory recipients = new bytes[](2);
        recipients[0] = abi.encode(beneficiary);
        recipients[1] = abi.encode(contributor);

        // Create a review attestation
        Attestation memory pledgeAttestation = Attestation({
            schemaId: pledgeSchemaId, // Schema for pledge
            linkedAttestationId: 0,
            attestTimestamp: uint64(block.timestamp),
            revokeTimestamp: 0,
            attester: address(this), // Transactee is the reviewer in this case
            validUntil: 0, // No expiration for the review attestation
            dataLocation: DataLocation.ONCHAIN,
            revoked: false,
            recipients: recipients,
            data: pledge // Pledge metadata
        });

        bytes memory emptyData = new bytes(0);
        // bytes memory curEpoch = abi.encode(_getEpochIndex(block.timestamp));
        // bytes memory contributorAddr = abi.encode(contributor);
        // bytes memory packedEncodedProof = bytes.concat(encodedProof, curEpoch);
        // packedEncodedProof = bytes.concat(encodedProof, contributorAddr);
        bytes memory packedEncodedProof = abi.encodePacked(
            encodedProof,
            abi.encode(_getEpochIndex(block.timestamp)),
            abi.encode(contributor)
        );

        // // Attest to sign protocol
        attestationId = spInstance.attest(pledgeAttestation, "", emptyData, packedEncodedProof); // extraData for hook callback
        // // Save the pledge attestation Id & emit event
        uint256 contributionAmount = spHookInstance.balanceOf(contributor);
        _contributeSocialPledge(beneficiaryId, attestationId, contributor, contributionAmount);
    }

    /// @notice Internal function to revoke a pledge attestation.
    /// @param beneficiaryId The beneficiary's ID.
    /// @param contributor The contributor's address.
    function _revokePledgeAttestation(
        uint256 beneficiaryId,
        address contributor
    ) internal onlyPledgedContribution(contributor, beneficiaryId) {
        uint256 curEpoch = _getEpochIndex(block.timestamp);
        uint64 attestationIdToRevoke = _donorContributionRegistry[contributor][curEpoch][beneficiaryId]
            .pledgeAttestationId;

        uint256 revokeAmount = spHookInstance.getScoreWeightFromPledgeId(attestationIdToRevoke);
        _revokeSocialPledge(beneficiaryId, attestationIdToRevoke, contributor, revokeAmount);

        bytes memory emptyData = new bytes(0);
        bytes memory encodedContributor = abi.encode(contributor);

        spInstance.revoke(attestationIdToRevoke, "", emptyData, encodedContributor);
    }

    /// @notice Returns the current epoch index based on the current timestamp.
    /// @return epochIndex The current epoch index.
    function currentEpochIndex() external view returns (uint256 epochIndex) {
        epochIndex = _getEpochIndex(block.timestamp);
    }

    /// @notice Retrieves the total donations made to a specific beneficiary during a specific epoch.
    /// @param beneficiaryId The ID of the beneficiary.
    /// @param epochIndex The index of the epoch.
    /// @return amount The total donation amount for the beneficiary in the specified epoch.
    function getBeneficiaryDonationsByEpoch(
        uint256 beneficiaryId,
        uint256 epochIndex
    ) external view returns (uint256 amount) {
        amount = _beneficiaryDonation[beneficiaryId][epochIndex];
    }

    /// @notice Retrieves the total donations made to a specific beneficiary during the current epoch.
    /// @param beneficiaryId The ID of the beneficiary.
    /// @return amount The total donation amount for the beneficiary in the current epoch.
    function getBeneficiaryDonationsCurrentEpoch(uint256 beneficiaryId) external view returns (uint256 amount) {
        uint256 curEpoch = _getEpochIndex(block.timestamp);
        amount = _beneficiaryDonation[beneficiaryId][curEpoch];
    }

    /// @notice Retrieves the total generic donations made during a specific epoch.
    /// @param epochIndex The index of the epoch.
    /// @return amount The total generic donation amount for the specified epoch.
    function getGenericDonationsByEpoch(uint256 epochIndex) external view returns (uint256 amount) {
        amount = _genericDonation[epochIndex];
    }

    /// @notice Retrieves the total generic donations made during the current epoch.
    /// @return amount The total generic donation amount for the current epoch.
    function getGenericDonationCurrentEpoch() external view returns (uint256 amount) {
        uint256 curEpoch = _getEpochIndex(block.timestamp);
        amount = _genericDonation[curEpoch];
    }

    /// @notice Retrieves the donation amount made by a specific donor during a specific epoch.
    /// @param epochIndex The index of the epoch.
    /// @param donor The address of the donor.
    /// @return amount The total donation amount by the donor for the specified epoch.
    function getDonorGenericDonationByEpoch(uint256 epochIndex, address donor) external view returns (uint256 amount) {
        amount = _donorGenericDonationRegistry[donor][epochIndex];
    }

    /// @notice Retrieves the donation amount made by a specific donor during the current epoch.
    /// @param donor The address of the donor.
    /// @return amount The total donation amount by the donor for the current epoch.
    function getDonorGenericDonationCurrentEpoch(address donor) external view returns (uint256 amount) {
        uint256 curEpoch = _getEpochIndex(block.timestamp);
        amount = _donorGenericDonationRegistry[donor][curEpoch];
    }

    /// @notice Retrieves the contribution details of a donor to a specific beneficiary during a specific epoch.
    /// @param epochIndex The index of the epoch.
    /// @param beneficiaryId The ID of the beneficiary.
    /// @param donor The address of the donor.
    /// @return amount The donation amount by the donor.
    /// @return pledgeId The pledge attestation ID.
    function getDonorBeneficiaryContributionByEpoch(
        uint256 epochIndex,
        uint256 beneficiaryId,
        address donor
    ) external view returns (uint256 amount, uint64 pledgeId) {
        Contribution memory contribution = _donorContributionRegistry[donor][epochIndex][beneficiaryId];
        amount = contribution.amount;
        pledgeId = contribution.pledgeAttestationId;
    }

    /// @notice Retrieves the contribution details of a donor to a specific beneficiary during the current epoch.
    /// @param beneficiaryId The ID of the beneficiary.
    /// @param donor The address of the donor.
    /// @return amount The donation amount by the donor.
    /// @return pledgeId The pledge attestation ID.
    function getDonorBeneficiaryContributionCurrentEpoch(
        uint256 beneficiaryId,
        address donor
    ) external view returns (uint256 amount, uint64 pledgeId) {
        uint256 curEpoch = _getEpochIndex(block.timestamp);

        Contribution memory contribution = _donorContributionRegistry[donor][curEpoch][beneficiaryId];
        amount = contribution.amount;
        pledgeId = contribution.pledgeAttestationId;
    }

    /// @notice Retrieves the pledge schema information.
    /// @return pledgeSchema The schema details for pledge attestations.
    function getPledgeSchema() external view returns (Schema memory pledgeSchema) {
        pledgeSchema = spInstance.getSchema(pledgeSchemaId);
    }

    /// @notice Retrieves the pledge attestation details for a specific contributor, epoch, and beneficiary.
    /// @param contributor The address of the contributor.
    /// @param epochIndex The index of the epoch.
    /// @param beneficiaryId The ID of the beneficiary.
    /// @return pledgeAttestation The attestation details for the pledge.
    function getPledgeAttestation(
        address contributor,
        uint256 epochIndex,
        uint256 beneficiaryId
    ) external view returns (Attestation memory pledgeAttestation) {
        Contribution memory contribution = _donorContributionRegistry[contributor][epochIndex][beneficiaryId];
        pledgeAttestation = spInstance.getAttestation(contribution.pledgeAttestationId);
    }

    /// @notice Checks if a beneficiary has been pledged to by a specific contributor in the current epoch.
    /// @param beneficiaryId The ID of the beneficiary.
    /// @param contributor The address of the contributor.
    /// @return pledged True if the beneficiary has a pledge attestation, otherwise false.
    function isBeneficiaryPledged(uint256 beneficiaryId, address contributor) external view returns (bool pledged) {
        uint256 curEpoch = _getEpochIndex(block.timestamp);
        uint64 pledgeId = _donorContributionRegistry[contributor][curEpoch][beneficiaryId].pledgeAttestationId;
        pledged = pledgeId != 0 ? true : false;
    }
}
