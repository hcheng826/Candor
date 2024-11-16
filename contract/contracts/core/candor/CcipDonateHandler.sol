// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { CCIPReceiver } from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICandor {
    function donateByBaseCurrency(uint256 beneficiaryId, uint256 amount, bytes calldata data) external;
}

contract CcipDonateHandler is CCIPReceiver {
    address public immutable candor;

    event MessageSent(bytes32 messageId);
    event MessageReceived(bytes32 messageId);

    constructor(address _ccipRouter, address _candor) CCIPReceiver(_ccipRouter) {
        candor = _candor;
    }

    function doanteToOtherChain(
        uint256 beneficiaryId,
        address token, // only support BASE_CURRENCT USDC
        uint256 amount,
        uint64 dstChainSelector,
        address dstChainReceiver
    ) public {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        // bridge to dst chain via ccip router
        IERC20(token).approve(i_ccipRouter, amount);
        Client.EVMTokenAmount[] memory tokenAmount = new Client.EVMTokenAmount[](1);
        tokenAmount[0] = Client.EVMTokenAmount({ token: token, amount: amount });

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(dstChainReceiver),
            data: abi.encode(beneficiaryId, amount),
            tokenAmounts: tokenAmount,
            extraArgs: "",
            feeToken: address(0)
        });

        uint256 fee = IRouterClient(i_ccipRouter).getFee(dstChainSelector, message);

        bytes32 messageId = IRouterClient(i_ccipRouter).ccipSend{ value: fee }(dstChainSelector, message);

        emit MessageSent(messageId);
    }

    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        (uint256 beneficiaryId, uint256 amount) = abi.decode(message.data, (uint256, uint256));
        ICandor(candor).donateByBaseCurrency(beneficiaryId, amount, "");
        emit MessageReceived(message.messageId);
    }

    receive() external payable {}
}
