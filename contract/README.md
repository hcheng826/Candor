# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

## deployment

### BASE SEPOLIA
- CandoSPHook:  0x2987a9b18b1d8FA449DF81406922008bebE31020
- Candor: 0x9341BEC4A59ae34f628D978f194b451Bc639bF7D
- SchemaId: 1041 (0x411)
- FULL Schema ID: onchain_evm_84532_0x411
- Sign Protocol Explorer Link: https://testnet-scan.sign.global/schema/onchain_evm_84532_0x411
- SUBGRAPH: https://api.studio.thegraph.com/query/46716/candor-base-sepolia/version/latest
- CcipDonateHandler: [0xcb1Eb668Ca9536E38ae02a0f0A8b72e1F683c4a8](https://base-sepolia.blockscout.com/address/0xcb1Eb668Ca9536E38ae02a0f0A8b72e1F683c4a8#code)

### POLYGON AMOY
- CandoSPHook:  [0x91Fdc87cBED8Be6FBfDe8fF0cFE6d9B945b008E4](https://amoy.polygonscan.com/address/0x91Fdc87cBED8Be6FBfDe8fF0cFE6d9B945b008E4#code)
- Candor: [0xc570829fa7e4b2088cf2A3544Fba9267B3a6160E](https://amoy.polygonscan.com/address/0xc570829fa7e4b2088cf2A3544Fba9267B3a6160E#code)
- SchemaId: 155 (0x9B)
- FULL Schema ID: onchain_evm_80002_0x9B
- Sign Protocol Explorer Link: https://testnet-scan.sign.global/schema/onchain_evm_80002_0x9b
- CcipDonateHandler: [0x6BB6B319Ad77a78f932a1911b7F87Be26C345f0a](https://amoy.polygonscan.com/address/0x6BB6B319Ad77a78f932a1911b7F87Be26C345f0a#code)

### ARB SEPOLIA
- CcipDonateHandler: [0x29AFCE8107a10441c2Ee87Daf155D97a5026730e](https://sepolia.arbiscan.io/address/0x29AFCE8107a10441c2Ee87Daf155D97a5026730e#code)