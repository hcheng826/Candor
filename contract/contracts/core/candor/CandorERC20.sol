// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { BoringOwnable } from "../helpers/BoringOwnable.sol";


contract CandorERC20 is ERC20, BoringOwnable {
    
    // Errors
    error TransferabilityDisabled(address, address);

    // State variables
    bool public transferRestrictionMode;

    /// @dev Token transferability whitelist
    mapping(address => bool) public transferabilityRegistry;

    // Events
    event TransferabilityUpdate(bool mode);


    constructor() ERC20("CANDOR TOKEN", "CANDOR TOKEN") BoringOwnable(_msgSender()) {
        transferRestrictionMode = false;
    }

    /**
     * @notice Toggles the transferability mode of the token.
     * @param mode The mode to set for transferability (true = enabled, false = disabled).
     * @dev Only the contract owner can call this function.
     */
    function toggleTransferability(bool mode) external onlyOwner {
        transferRestrictionMode = mode;

        emit TransferabilityUpdate(mode);
    }

    /**
     * @notice Overrides the `_update` function to enforce transfer restrictions.
     * @param from The address tokens are being transferred from.
     * @param to The address tokens are being transferred to.
     * @param value The amount of tokens being transferred.
     * @dev This function ensures that only whitelisted addresses can perform transfers
     * if the transfer restrictions are enabled.
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        // Check if transfer restrictions are active
        if (transferRestrictionMode) {
            // Allow transfers only from & to whitelisted addresses or during minting/burning operations via checking if either `from` or `to` is whitelisted
            if (!transferabilityRegistry[from] && !transferabilityRegistry[to]) {
                revert TransferabilityDisabled(from, to);
            }
        }

        super._update(from, to, value);
    }
}
