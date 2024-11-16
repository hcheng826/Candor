// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CandorFunding {
    uint256 public constant CLR_WEIGHTAGE = 3_000; // 30%
    uint256 public constant SOCIAL_WEIGHTAGE = 7_000; // 70%
    uint256 public constant TOTAL_WEIGHTAGE = 10_000;


    function _calculateWeightedAmounts(uint256 totalAmount)
        public
        pure
        returns (uint256 clrWeighted, uint256 socialWeighted)
    {
        clrWeighted = (totalAmount * CLR_WEIGHTAGE) / TOTAL_WEIGHTAGE;
        socialWeighted = (totalAmount * SOCIAL_WEIGHTAGE) / TOTAL_WEIGHTAGE;
    }
}
