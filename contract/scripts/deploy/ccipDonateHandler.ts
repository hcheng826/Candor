import hre from 'hardhat';

// Deployment Helpers:
import { deploy } from '../utils/helpers';
// ABI
import { CcipDonateHandler } from '../../typechain-types';

/**
CCIP router
base sepolia: https://docs.chain.link/ccip/directory/testnet/chain/ethereum-testnet-sepolia-base-1
  router: 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93
  chain selector: 10344971235874465080
polygon amoy: https://docs.chain.link/ccip/directory/testnet/chain/polygon-testnet-amoy
  router: 0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2
  chain selector: 16281711391670634445
arb sepolia: https://docs.chain.link/ccip/directory/testnet/chain/ethereum-testnet-sepolia-arbitrum-1
  router: 0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165
  chain selector: 3478487238524512106
 */

const construstorArgs = {
  baseSepolia: ['0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93', '0x9341BEC4A59ae34f628D978f194b451Bc639bF7D'],
  polygonAmoy: ['0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2', '0x356a2439f30DD23aE37E34D509c9f5f5edc39a23'],
  arbSepolia: ['0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165', '0x0000000000000000000000000000000000000000'],
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const ccipDonateHandler = await deploy<CcipDonateHandler>(deployer, 'CcipDonateHandler', construstorArgs.arbSepolia, true);
  console.log('CcipDonateHandler Contract Deployed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
