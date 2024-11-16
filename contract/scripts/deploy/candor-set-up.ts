import hre, { ethers } from 'hardhat';
import { deploy, getContractAt } from '../utils/helpers';

import { encodeCandorPledge, encodeWorldcoinProof } from '../utils/sign';
import {
  SIGN_PROTOCOL_SEPOLIA,
  WORLD_ID_SEPOLIA,
  WORLD_ACTION_ID,
  WORLD_APP_ID,
  USDC_SEPOLIA,
  WORLD_ID_ARB_SEPOLIA,
  WORLD_ID_BASE_SEPOLIA,
  USDC_ARB_SEPOLIA,
  USDC_BASE_SEPOLIA,
  SIGN_PROTOCOL_ARB_SEPOLIA,
  SIGN_PROTOCOL_BASE_SEPOLIA,
  WORLD_ID_POLYGON_AMOY,
  USDC_POLYGON_AMOY,
  SIGN_PROTOCOL_POLYGON_AMOY,
} from '../utils/candor';
import { MOCK_NULLIFIER_HASH, MOCK_PROOF, MOCK_ROOT, MOCK_SIGNAL } from '../utils/const';

// ABI
import { Candor, CandorSPHook, SP } from '../../typechain-types';

enum CandorChains {
  SEPOLIA = 'SEPOLIA',
  ARB_SEPOLIA = 'ARB_SEPOLIA',
  BASE_SEPOLIA = 'BASE_SEPOLIA',
  POLYGON_AMOY = 'POLYGON_AMOY',
}
function getAddressLogs(chain: CandorChains = CandorChains.SEPOLIA) {
  let WORLD_ID_ADDRESS = '';
  let USDC = '';
  let SIGN_PROTOCOL_INSTANCE = '';
  const MOCK_1INCH_AGGREGATOR_V6_ADDRESS = '0xba7177535B4d9A74e7928376e8ecd9db8F689d12';

  if (chain === CandorChains.SEPOLIA) {
    WORLD_ID_ADDRESS = WORLD_ID_SEPOLIA;
    USDC = USDC_SEPOLIA;
    SIGN_PROTOCOL_INSTANCE = SIGN_PROTOCOL_SEPOLIA;
  } else if (chain === CandorChains.ARB_SEPOLIA) {
    WORLD_ID_ADDRESS = WORLD_ID_ARB_SEPOLIA;
    USDC = USDC_ARB_SEPOLIA;
    SIGN_PROTOCOL_INSTANCE = SIGN_PROTOCOL_ARB_SEPOLIA;
  } else if (chain === CandorChains.POLYGON_AMOY) {
    WORLD_ID_ADDRESS = WORLD_ID_POLYGON_AMOY;
    USDC = USDC_POLYGON_AMOY;
    SIGN_PROTOCOL_INSTANCE = SIGN_PROTOCOL_POLYGON_AMOY;
  }
  else {
    WORLD_ID_ADDRESS = WORLD_ID_BASE_SEPOLIA;
    USDC = USDC_BASE_SEPOLIA;
    SIGN_PROTOCOL_INSTANCE = SIGN_PROTOCOL_BASE_SEPOLIA;
  }

  return {
    worldIdAddress: WORLD_ID_ADDRESS,
    spHookConstructor: [WORLD_ID_ADDRESS, WORLD_APP_ID, WORLD_ACTION_ID],
    usdcAddress: USDC,
    spInstanceAddress: SIGN_PROTOCOL_INSTANCE,
    oneInchAggregatorV6Address: MOCK_1INCH_AGGREGATOR_V6_ADDRESS,
  };
}

async function main() {
  const [deployer, altAccount] = await hre.ethers.getSigners();
  console.log(
    `[ADDRESSES USED]: Deployer - ${await deployer.getAddress()}; AltAccount - ${await altAccount.getAddress()}`,
  );
  const { worldIdAddress, spHookConstructor, usdcAddress, spInstanceAddress, oneInchAggregatorV6Address } =
    getAddressLogs(CandorChains.POLYGON_AMOY); // Change to chain

  // Step 1: Deploy CandorSPHook to prepare for schema creation on Sign Protocol's SP Instance
  const candorSpHook = await deploy<CandorSPHook>(deployer, 'CandorSPHook', spHookConstructor, true); // switch to true for verification
  // console.log("sp hook contrutor args for verification: ", spHookConstructor);

  //  Step 2: Create Candor Review schema on Sign Protocol's SP Instance & invoke CandorSPHook address
  const schema = {
    registrant: deployer.address,
    revocable: false,
    dataLocation: 0,
    maxValidFor: 0,
    hook: candorSpHook.address,
    timestamp: 0,
    data: JSON.stringify({
      name: 'TEST_C',
      description: 'TESTING_C',
      // 'An immutable schema for orders processed through the Candor open-source system, ensuring that all transactions are verified and executed only by genuine human users via WorldID, preventing bot activity and enhancing trust and security.',
      data: [
        { name: 'ratings', type: 'uint256' },
        { name: 'comment', type: 'string' },
      ],
    }),
  };

  // Delegate signature (empty in this case)
  const delegateSignature = '0x';
  // Get Sign Protocol's Instance
  const spInstance = await getContractAt<SP>('SP', spInstanceAddress); // @ARB

  // Register schema on spInstance
  const tx = await spInstance.register(schema, delegateSignature);
  const receipt = await tx.wait();

  const schemaId = ethers.BigNumber.from(receipt.logs[0].data).toNumber();
  console.log('Successfully registered Schema Id:', schemaId);

  // Step 3: Deploy Candor Main contract
  const CANDOR_CONSTRUCTOR = [
    schemaId,
    spInstanceAddress,
    candorSpHook.address,
    usdcAddress,
    oneInchAggregatorV6Address,
  ];

  // const CANDOR_BASE_SEPOLIA = '0x171e18bC5dcF2bca6AAc9D1bA594c2788e0A1b5e';
  // const candor = await getContractAt<Candor>('Candor', CANDOR_BASE_SEPOLIA);
  const candor = await deploy<Candor>(deployer, 'Candor', CANDOR_CONSTRUCTOR, true); // switch to true for verification
  // console.log('Candor construtor args for verification: ', CANDOR_CONSTRUCTOR);
  const TEST_BENEFICIARY_1 = '0xb78ce55Df582074F4cC7cDB2888A1b7CfB021689';
  const TEST_BENEFICIARY_2 = '0xd8e11DCEf1ff460755E8E494AEb5185a0A3b7954';

  // Register Beneficiaries
  const beneficiaryRegisterTx1 = await candor.registerBeneficiary(TEST_BENEFICIARY_1);
  const beneficiaryRegisterReceipt1 = beneficiaryRegisterTx1.wait();
  console.log(`BENEFICIARY 1 - ${TEST_BENEFICIARY_1} registered!`);

  const beneficiaryRegisterTx2 = await candor.registerBeneficiary(TEST_BENEFICIARY_2);
  const beneficiaryRegisterReceipt2 = beneficiaryRegisterTx2.wait();
  console.log(`BENEFICIARY 2 - ${TEST_BENEFICIARY_2} registered!`);

  return;
  // DONATION
  const usdc = await getContractAt('ERC20', usdcAddress);

  const [usdcBalance, ethBalance] = await Promise.all([
    await usdc.balanceOf(altAccount.address),
    await altAccount.getBalance(),
  ]);
  console.log('[USDC Balance]: ', usdcBalance);
  console.log('[ETH Balance]: ', ethBalance);
  const usdcApprovalTx = await usdc.connect(altAccount).approve(candor.address, 100000000);
  const approvalReceipt = await usdcApprovalTx.wait();
  console.log('USDC Approval successful!');

  const donateBeneficiary1Tx = await candor.connect(altAccount).donateByBaseCurrency(1, 100, '0x');
  const paymentReceipt = await donateBeneficiary1Tx.wait();
  console.log('Donation to Beneficiary 1 Successful!');

  // Attest Review to order
  const pledge = {
    ratings: 3,
    comment: 'Exceeded expectations! Truly impressive.',
  };

  const encodedPledge = encodeCandorPledge(pledge.ratings, pledge.comment);
  //   console.log('[ENCODED REVIEW]:', encodedReview);

  const encodedProof = encodeWorldcoinProof(MOCK_SIGNAL, MOCK_ROOT, MOCK_NULLIFIER_HASH, MOCK_PROOF);
  //   console.log('[ENCODED WORLDID PROOF]', encodedProof);
  // AltAccount was payee
  const pledgeTx = await candor.connect(altAccount).attestPledge(1, encodedPledge, encodedProof);
  const pledgeReceipt = await pledgeTx.wait();
  console.log('Successfully pledged to Beneficiary 1');
  /*
  BASE SEPOLIA

  CandoSPHook:  0x2987a9b18b1d8FA449DF81406922008bebE31020
  Candor: 0x9341BEC4A59ae34f628D978f194b451Bc639bF7D
  SchemaId: 1041 (0x411)
  FULL Schema ID: onchain_evm_84532_0x411
  Sign Protocol Explorer Link: https://testnet-scan.sign.global/schema/onchain_evm_84532_0x411

SUBGRAPH: https://api.studio.thegraph.com/query/46716/candor-base-sepolia/version/latest
 */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
