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
- CandorSPHook:  [0x2987a9b18b1d8FA449DF81406922008bebE31020](https://base-sepolia.blockscout.com/address/0x2987a9b18b1d8FA449DF81406922008bebE31020)
- Candor: [0x9341BEC4A59ae34f628D978f194b451Bc639bF7D](https://base-sepolia.blockscout.com/address/0x9341BEC4A59ae34f628D978f194b451Bc639bF7D)
- SchemaId: 1041 (0x411)
- FULL Schema ID: onchain_evm_84532_0x411
- Sign Protocol Explorer Link: https://testnet-scan.sign.global/schema/onchain_evm_84532_0x411
- SUBGRAPH: https://api.studio.thegraph.com/query/46716/candor-base-sepolia/version/latest
- CcipDonateHandler: [0x6BB6B319Ad77a78f932a1911b7F87Be26C345f0a](https://base-sepolia.blockscout.com/address/0x6BB6B319Ad77a78f932a1911b7F87Be26C345f0a#code)

### POLYGON AMOY
- CandoSPHook:  [0x91Fdc87cBED8Be6FBfDe8fF0cFE6d9B945b008E4](https://amoy.polygonscan.com/address/0x91Fdc87cBED8Be6FBfDe8fF0cFE6d9B945b008E4#code)
- Candor: [0xc570829fa7e4b2088cf2A3544Fba9267B3a6160E](https://amoy.polygonscan.com/address/0xc570829fa7e4b2088cf2A3544Fba9267B3a6160E#code)
- SchemaId: 155 (0x9B)
- FULL Schema ID: onchain_evm_80002_0x9B
- Sign Protocol Explorer Link: https://testnet-scan.sign.global/schema/onchain_evm_80002_0x9b
- CcipDonateHandler: [0x6BB6B319Ad77a78f932a1911b7F87Be26C345f0a](https://amoy.polygonscan.com/address/0x6BB6B319Ad77a78f932a1911b7F87Be26C345f0a#code)

### ARB SEPOLIA (only for CCIP sender)
- CcipDonateHandler: [0x356a2439f30DD23aE37E34D509c9f5f5edc39a23](https://sepolia.arbiscan.io/address/0x356a2439f30DD23aE37E34D509c9f5f5edc39a23#code)

CCIP tx
https://ccip.chain.link/#/side-drawer/msg/0xa5620290fa9208c0ce21828a8d6e650ec3e463ba6011b75a414a04f2bb0ea125


### Mantle Sepolia
- CandoSPHook:  [0xBc32D940b02F4376D73CA908907C953711B05e39](https://sepolia.mantlescan.xyz/address/0xBc32D940b02F4376D73CA908907C953711B05e39#code)
- Candor: [0xab1F16edCde814F60f3F9eb227a6cF37EfA988f1](https://sepolia.mantlescan.xyz/address/0xab1F16edCde814F60f3F9eb227a6cF37EfA988f1#code)
  - deployed with schemaId 100, spInstanceAddr 0xA337666761405B2092E7B6Fa7e2599947a943751

### Celo Alf
- CandoSPHook: 0x0Ce9551aC3DF1666d4F569FB88A80003DC43E7c7
- Candor: 0x2FC978bDba0ae5f40E1adF6A924060dEed726E7c

### Subgraph data
```
{
  "network": "base-sepolia",
  "Candor_Address": "0x9341BEC4A59ae34f628D978f194b451Bc639bF7D",
  "Candor_StartBlock": 17955748,
  "CandorSPHook_Address": "0x2987a9b18b1d8FA449DF81406922008bebE31020",
  "CandorSPHook_StartBlock": 17955740
}

{
  "network": "polygon-amoy",
  "Candor_Address": "0xc570829fa7e4b2088cf2A3544Fba9267B3a6160E",
  "Candor_StartBlock": 14482192,
  "CandorSPHook_Address": "0x91Fdc87cBED8Be6FBfDe8fF0cFE6d9B945b008E4",
  "CandorSPHook_StartBlock": 14482155
}

{
  "network": "mantle-sepolia",
  "Candor_Address": "0xab1F16edCde814F60f3F9eb227a6cF37EfA988f1",
  "Candor_StartBlock": 15093998,
  "CandorSPHook_Address": "0xBc32D940b02F4376D73CA908907C953711B05e39",
  "CandorSPHook_StartBlock": 15093729
}

{
  "network": "celo-alf",
  "Candor_Address": "0x2FC978bDba0ae5f40E1adF6A924060dEed726E7c",
  "Candor_StartBlock": 30789896,
  "CandorSPHook_Address": "0x0Ce9551aC3DF1666d4F569FB88A80003DC43E7c7",
  "CandorSPHook_StartBlock": 30789753
}
```