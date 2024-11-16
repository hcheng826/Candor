// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { CandorFunding } from "./CandorFunding.sol";
import { TokenHelper } from "../helpers/TokenHelper.sol";
import { ClrFundHelper } from "../clr-fund/ClrFundHelper.sol";

// Models
import { Contribution } from "./models/Contribution.sol";

// Interfaces
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";

// Libraries
import { StringHelperLib } from "../libraries/StringHelperLib.sol";
import { TimeLib } from "../libraries/TimeLib.sol";

error ZeroBalance();
error InvalidSPHookInstance();
error InvalidBeneficiary(uint256 beneficiaryId);
error InvalidEpoch(uint256);
error UnpledgedState(address contributor);
error PledgedBeneficiary(address contributor);

contract CandorController is CandorFunding, TokenHelper, ClrFundHelper {
    using StringHelperLib for string;
    using TimeLib for uint256;

    address public BASE_CURRENCY; // USDC

    uint256 public beneficiaryCount;

    uint256 public immutable START_TIME;
    uint256 public constant EPOCH_INTERVAL = TimeLib.SEVEN_DAYS * 4 * 3; // Every quarter (3 months)
    uint256 public constant MAX_BPS = 10_000;

    mapping(uint256 => address) public beneficiaryRegistry; // beneficiaryId -> address
    mapping(uint256 => uint256) public beneficiaryBalance;

    // Mappings for Donations/Contributions
    mapping(uint256 => uint256) internal _epochTotalDonation;
    mapping(uint256 => uint256) internal _genericDonation; // epoch -> amount
    mapping(uint256 => mapping(uint256 => uint256)) internal _beneficiaryDonation; // epoch -> beneficiaryId -> amount

    // Track Epoch Pledges
    mapping(address contributor => mapping(uint256 epochIndex => uint256 beneficiaryId))
        internal _contributorPledgeToBeneficiary; // address -> epoch -> beneficiaryId NOTE: 0 if not pledged
    mapping(uint256 => mapping(uint256 => uint256)) internal _beneficiarySocialPledges; // epoch -> beneficiaryId -> amount
    // Mapping for donors/contributors
    mapping(address donor => mapping(uint256 epochIndex => uint256 amount)) public _donorGenericDonationRegistry;
    mapping(address donor => mapping(uint256 epochIndex => mapping(uint256 beneficiaryId => Contribution)))
        internal _donorContributionRegistry;

    event BeneficiaryRegistered(uint256 indexed beneficiaryId, address indexed beneficiaryAddress);
    event BeneficiaryUpdate(uint256 indexed beneficiaryId, address indexed beneficiaryAddress);

    event DonationReceived(
        uint256 indexed beneficiaryId,
        address indexed donor,
        uint256 indexed epochIndex,
        uint256 amount
    );
    event DonationWithdrawn(uint256 indexed beneficiaryId, uint256 amount);
    event PledgeAttested(
        uint256 indexed beneficiaryId,
        address indexed contributor,
        uint256 indexed epochIndex,
        uint64 attestationId
    );
    event PledgeRevoked(
        uint256 indexed beneficiaryId,
        address indexed contributor,
        uint256 indexed epochIndex,
        uint64 attestationId
    );

    modifier onlyValidBeneficiary(uint256 beneficiaryId) {
        if (beneficiaryRegistry[beneficiaryId] == address(0)) revert InvalidBeneficiary(beneficiaryId);
        _;
    }

    modifier onlyUnpledgedState(address contributor) {
        bool pledged = _getCurrentEpochPledgeState(contributor);

        if (pledged) revert PledgedBeneficiary(contributor);
        _;
    }

    modifier onlyPledgedState(address contributor) {
        bool pledged = _getCurrentEpochPledgeState(contributor);

        if (!pledged) revert UnpledgedState(contributor);
        _;
    }

    constructor(address _baseCurrency) {
        START_TIME = block.timestamp; // upon creation
        BASE_CURRENCY = _baseCurrency;
    }

    /// @notice Registers a new beneficiary with an address.
    /// @param beneficiary The address of the new beneficiary.
    function registerBeneficiary(address beneficiary) external {
        beneficiaryCount++;
        uint256 beneficiaryId = beneficiaryCount;
        beneficiaryRegistry[beneficiaryId] = beneficiary;

        emit BeneficiaryRegistered(beneficiaryId, beneficiary);
    }

    /// @notice Collects donations for a specific beneficiary.
    /// @param beneficiaryId The ID of the beneficiary collecting donations.
    function collectDonations(uint256 beneficiaryId) external {
        address beneficiary = beneficiaryRegistry[beneficiaryId];

        if (msg.sender != beneficiary) revert InvalidBeneficiary(beneficiaryId);

        uint256 balance = beneficiaryBalance[beneficiaryId];

        // Revert if the beneficiary has no balance to withdraw
        if (balance == 0) revert ZeroBalance();

        // Reset the merchant's balance to zero before transferring funds
        beneficiaryBalance[beneficiaryId] = 0;
        _transferOut(BASE_CURRENCY, msg.sender, balance);

        emit DonationWithdrawn(beneficiaryId, balance);
    }

    // @TO_DO HANDLE CLR FUNDING LOGIC
    function _clrMatch(
        uint256 epochIndex
    ) external returns (address[] memory beneficiaries, uint256[] memory basisPoints) {}
    // @TO_DO USER POINT LOGIC

    // 30% -----> use CLR_WEIGHTAGE
    /// @notice Distributes main deposits for a given epoch among beneficiaries based on basis points.
    /// @param epochIndex The epoch to distribute deposits.
    /// @param beneficiaries Array of beneficiary addresses.
    /// @param basisPoints Array of basis points for each beneficiary.
    function _distributeMainDepositsByEpoch(
        uint256 epochIndex,
        address[] memory beneficiaries,
        uint256[] memory basisPoints
    ) internal virtual {
        uint256 epoch = _calcEpochIndex(block.timestamp);
        if (epochIndex <= epoch) revert InvalidEpoch(epoch);

        uint256 totalDeposited = _selfBalance(BASE_CURRENCY);

        for (uint256 i = 0; i < beneficiaries.length; i++) {
            uint256 amount = (totalDeposited * basisPoints[i]) / MAX_BPS;
            _transferOut(BASE_CURRENCY, beneficiaries[i], amount);
        }
    }

    /// @notice Updates the donation amount for a specific beneficiary or the generic pool.
    /// @param beneficiaryId The ID of the beneficiary (0 for generic pool).
    /// @param amount The donation amount.
    /// @param donor The address of the donor.
    function _updateDonation(uint256 beneficiaryId, uint256 amount, address donor) internal {
        uint256 curEpoch = _getEpochIndex(block.timestamp);

        if (beneficiaryId != 0) {
            beneficiaryBalance[beneficiaryId] += amount;
            _donorContributionRegistry[donor][curEpoch][beneficiaryId].amount += amount;
        } else {
            // Update generic pool balance - `beneficiaryId` == 0
            beneficiaryBalance[0] += amount;
            _donorGenericDonationRegistry[donor][curEpoch] += amount;
        }
        // Track for epoch
        _epochTotalDonation[curEpoch] += amount;

        emit DonationReceived(beneficiaryId, donor, curEpoch, amount);
    }

    /// @notice Records a social pledge for a beneficiary by a contributor.
    /// @param beneficiaryId The ID of the beneficiary.
    /// @param pledgeId The ID of the attestation pledge.
    /// @param contributor The address of the contributor.
    /// @param amount The pledge amount. (contributor's social score - SPHook token balance)
    function _contributeSocialPledge(
        uint256 beneficiaryId,
        uint64 pledgeId,
        address contributor,
        uint256 amount
    ) internal onlyValidBeneficiary(beneficiaryId) onlyUnpledgedState(contributor) {
        uint256 curEpoch = _getEpochIndex(block.timestamp);

        _contributorPledgeToBeneficiary[contributor][curEpoch] = beneficiaryId;
        _donorContributionRegistry[contributor][curEpoch][beneficiaryId].pledgeAttestationId = pledgeId;
        _beneficiarySocialPledges[curEpoch][beneficiaryId] += amount;

        emit PledgeAttested(beneficiaryId, contributor, curEpoch, pledgeId);
    }

    /**
     * @notice Revokes an existing social pledge made by the contributor to the specified beneficiary in the current epoch.
     * @param beneficiaryId The ID of the beneficiary to which the pledge was made.
     * @param pledgeId The ID of the pledge attestation that is being revoked.
     * @param contributor The address of the contributor who made the pledge.
     *
     * @dev This function requires that:
     *      - The beneficiary ID provided is valid.
     *      - The contributor has an active pledge in the current epoch.
     *      It sets the contributor's pledge in `_contributorPledgeToBeneficiary` to zero and removes the pledge attestation ID
     *      from the `_donorContributionRegistry` for the current epoch. The `PledgeAttested` event is emitted with a zeroed pledge.
     */
    function _revokeSocialPledge(
        uint256 beneficiaryId,
        uint64 pledgeId,
        address contributor,
        uint256 amount
    ) internal onlyValidBeneficiary(beneficiaryId) onlyPledgedState(contributor) {
        uint256 curEpoch = _getEpochIndex(block.timestamp);

        _contributorPledgeToBeneficiary[contributor][curEpoch] = 0;
        _donorContributionRegistry[contributor][curEpoch][beneficiaryId].pledgeAttestationId = 0;
        _beneficiarySocialPledges[curEpoch][beneficiaryId] -= amount;

        emit PledgeRevoked(beneficiaryId, contributor, curEpoch, pledgeId);
    }
    /// @notice Distributes donations for a specified epoch to beneficiaries based on matching criteria.
    /// @param epochIndex The epoch to distribute donations for.
    function _distributeDonation(uint256 epochIndex) internal {
        (, uint256 clrMatch, uint256 socialMatch) = _calcEpochDistributionProportion(epochIndex);
        (address[] memory beneficiaries, uint256[] memory beneficiaiesBps) = _getEpochClrMatchDistribution(epochIndex);

        // 1. Distribute to beneficiaries for clrMatch
        for (uint256 i = 0; i < beneficiaries.length; ) {
            address beneficiary = beneficiaries[i];
            uint256 bps = beneficiaiesBps[i];
            uint256 amount = _calcAmountFromBps(clrMatch, bps);
            // Transfer currency out to beneficiary assigned address
            _transferOut(BASE_CURRENCY, beneficiary, amount);
            unchecked {
                i++;
            }
        }

        // 2. Distribute for socialMatch (need interact with SPHook contract)
        (
            address[] memory socialBeneficiaries,
            uint256[] memory socialBeneficiariesBps
        ) = _calcBeneficiarySocialScorings(epochIndex);
        for (uint256 i = 0; i < socialBeneficiaries.length; ) {
            address beneficiary = socialBeneficiaries[i];
            uint256 bps = socialBeneficiariesBps[i];
            uint256 amount = _calcAmountFromBps(socialMatch, bps);
            // Transfer currency out to beneficiary assigned address
            _transferOut(BASE_CURRENCY, beneficiary, amount);
            unchecked {
                i++;
            }
        }
    }

    function _calcBeneficiarySocialScorings(
        uint256 epochIndex
    ) internal view returns (address[] memory socialBeneficiaries, uint256[] memory socialBeneficiariesBps) {
        // @TO_DO: Call SP HOOK Contract
    }
    /// @notice Calculates the epoch distribution proportions based on CLR and social matches.
    /// @param epochIndex The epoch to calculate distribution for.
    /// @return totalMatch The total match amount.
    /// @return clrMatch The amount allocated for CLR matching.
    /// @return socialMatch The amount allocated for social matching.
    function _calcEpochDistributionProportion(
        uint256 epochIndex
    ) internal view returns (uint256 totalMatch, uint256 clrMatch, uint256 socialMatch) {
        totalMatch = _getEpochTotalDonation(epochIndex);
        (clrMatch, socialMatch) = _calculateWeightedAmounts(totalMatch);
    }

    /// @notice Calculates the current epoch index based on a timestamp.
    /// @param timestamp The timestamp to calculate the epoch for.
    /// @return The calculated epoch index.
    function _calcEpochIndex(uint256 timestamp) internal view returns (uint256) {
        if (TimeLib.isExpired(START_TIME, timestamp)) return 0; // 0 means invalid
        return (timestamp - START_TIME) / EPOCH_INTERVAL; // Round down
    }

    /// @notice Retrieves the distribution for CLR matching in a specified epoch.
    /// @param epochIndex The epoch to retrieve distribution for.
    /// @return beneficiaries Array of beneficiary addresses.
    /// @return basisPoints Array of basis points for each beneficiary.
    function _getEpochClrMatchDistribution(
        uint256 epochIndex
    ) internal view returns (address[] memory beneficiaries, uint256[] memory basisPoints) {
        uint256 totalBeneficiaries = beneficiaryCount;
        uint256 totalQuadSum;

        for (uint256 i = 0; i < totalBeneficiaries; i++) {
            uint256 quadSum = sqrt(_beneficiaryDonation[epochIndex][i]);
            totalQuadSum += quadSum;
        }

        address[] memory _beneficiaries = new address[](totalBeneficiaries);
        uint256[] memory _basisPoints = new uint256[](totalBeneficiaries);

        for (uint256 i = 0; i < totalBeneficiaries; i++) {
            address beneficiary = beneficiaryRegistry[i];
            uint256 quadSum = sqrt(_beneficiaryDonation[epochIndex][i]);
            _beneficiaries[i] = beneficiary;
            _basisPoints[i] = (_calcBpsFromAmount(quadSum, totalQuadSum));
        }

        beneficiaries = _beneficiaries;
        basisPoints = _basisPoints;
    }

    /**
     * @notice Checks if the contributor has an active social pledge for the current epoch.
     * @param contributor The address of the contributor to check for a pledge.
     * @return pledged Returns true if the contributor has pledged to a beneficiary for the current epoch, otherwise false.
     *
     * @dev This function uses the current block timestamp to determine the epoch index,
     *      then checks if the contributor has a non-zero pledge for the current epoch in `_contributorPledgeToBeneficiary`.
     */
    function _getCurrentEpochPledgeState(address contributor) internal view returns (bool pledged) {
        uint256 curEpoch = _getEpochIndex(block.timestamp);
        pledged = _contributorPledgeToBeneficiary[contributor][curEpoch] != 0 ? true : false;
    }

    /// @notice Calculates the basis points (BPS) from a given amount and the total amount.
    /// @param amount The specific amount to convert to BPS.
    /// @param total The total amount, serving as the basis for BPS calculation.
    /// @return bps The calculated basis points (in BPS) for the provided amount relative to the total.
    function _calcBpsFromAmount(uint256 amount, uint256 total) internal pure returns (uint256 bps) {
        bps = (amount * MAX_BPS) / total;
    }

    /// @notice Calculates the specific amount from a given total and basis points (BPS).
    /// @param total The total amount to calculate from.
    /// @param bps The basis points (BPS) used to determine the amount.
    /// @return amount The calculated amount based on the provided total and BPS.
    function _calcAmountFromBps(uint256 total, uint256 bps) internal pure returns (uint256 amount) {
        amount = (bps * total) / MAX_BPS;
    }

    /// @notice Retrieves the total donation amount for a specified epoch.
    /// @param epochIndex The index of the epoch to retrieve the donation total for.
    /// @return amount The total donation amount for the specified epoch.
    function _getEpochTotalDonation(uint256 epochIndex) internal view returns (uint256 amount) {
        amount = _epochTotalDonation[epochIndex];
    }

    /// @notice Calculates and retrieves the epoch index based on a provided block number (timestamp).
    /// @param blockNumber The block number (timestamp) used to determine the epoch index.
    /// @return index The calculated epoch index for the given block number.
    function _getEpochIndex(uint256 blockNumber) internal view returns (uint256 index) {
        index = _calcEpochIndex(blockNumber);
    }
}
