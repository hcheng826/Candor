// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
    
    // Mapped to 1 beneficiary -> 1 contributor
    struct Contribution {
        uint64 pledgeAttestationId; // Social pledge attestionId on Sign Protocol
        uint256 amount; // Donated amount
    }
