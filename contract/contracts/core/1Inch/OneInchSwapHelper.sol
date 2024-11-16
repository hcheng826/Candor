// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import { TokenHelper } from "../helpers/TokenHelper.sol";

/**
 * @title OneInchSwapHelper
 * @dev A helper contract for performing swaps via the 1inch aggregation router. 
 *      Supports swapping between native (ETH) and ERC20 tokens, as well as ERC20 to ERC20 token swaps.
 */
contract OneInchSwapHelper is TokenHelper {
    
    error InvalidAddress(address);
    error SwapNativeToTokenError();
    error SwapTokenToTokenError();

    struct SwapDescription {
        IERC20 srcToken;
        IERC20 dstToken;
        address payable srcReceiver;
        address payable dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 flags;
    }

    // 1inch Aggregator Router V6
    address public aggregationRouter; 

    /**
     * @notice Constructor to initialize the contract with the 1inch aggregation router address.
     * @param router The address of the 1inch aggregation router.
     * @dev Reverts if the provided router address is the zero address.
     */
    constructor(address router) {
        if (router == address(0)) {
            revert InvalidAddress(address(0));
        }
        aggregationRouter = router;
    }

    /**
     * @notice Internal function to swap native ETH to a destination token using the 1inch router.
     * @param _data The encoded data needed by the 1inch router for the swap.
     * @return returnAmount The amount of destination tokens received after the swap.
     * @dev The function sends ETH (msg.value) to the aggregation router for the swap.
     *      Reverts with `SwapNativeToTokenError` if the swap fails.
     */
    function _swapNativeToToken(bytes calldata _data) internal returns (uint256 returnAmount) {
        // Perform the swap by calling the router with ETH (msg.value is the amount of ETH sent)
        (bool succ, bytes memory _resData) = address(aggregationRouter).call{value: msg.value}(_data);

        if (succ) {
            returnAmount = _decodeSwapReturnData(_resData);
        } else {
            revert SwapNativeToTokenError();
        }
    }

    /**
     * @notice Internal function to swap one ERC20 token to another using the 1inch router.
     * @param tokenIn The address of the ERC20 token to swap from.
     * @param tokenAmount The amount of `tokenIn` to be swapped.
     * @param _data The encoded data needed by the 1inch router for the swap.
     * @return returnAmount The amount of destination tokens received after the swap.
     * @dev Transfers `tokenAmount` of `tokenIn` from the sender to this contract, approves
     *      the router to spend the tokens, and executes the swap.
     *      Reverts with `SwapTokenToTokenError` if the swap fails.
     */
    function _swapTokenToToken(address tokenIn, uint256 tokenAmount, bytes calldata _data) internal returns (uint256 returnAmount) {
        IERC20 token = IERC20(tokenIn);
        token.transferFrom(msg.sender, address(this), tokenAmount);
        token.approve(aggregationRouter, tokenAmount);

        (bool succ, bytes memory _resData) = address(aggregationRouter).call(_data);
        if (succ) {
            returnAmount = _decodeSwapReturnData(_resData);
        } else {
            revert SwapTokenToTokenError();
        }
    }

    /**
     * @notice Decodes the return data from the 1inch router to extract the swap return amount.
     * @param returnData The return data from the router call.
     * @return returnAmount The amount of destination tokens received after the swap.
     * @dev Handles different return data formats based on the length of `returnData`.
     *      If the length is 32 bytes, it decodes a single `uint256`. 
     *      If the length is 64 bytes, it decodes two values but returns only the first.
     *      Reverts with "Unexpected return data length" for other lengths.
     */
    function _decodeSwapReturnData(bytes memory returnData) internal pure returns (uint256 returnAmount) {
        // Check the length of the return data to determine how to decode
        if (returnData.length == 32) {
            // If the length is 32 bytes, decode a single uint256 (returnAmount)
            return returnAmount = abi.decode(returnData, (uint256));
        } else if (returnData.length == 64) {
            // If the length is 64 bytes, decode both returnAmount and spentAmount
            (returnAmount, ) = abi.decode(returnData, (uint256, uint256));
        } else {
            revert("Unexpected return data length");
        }
    }
}