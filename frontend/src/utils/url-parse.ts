import { toHexString } from "./ethers-parse";

export const getExplorerUrl = (config: any, hash: string) => {
  // prioritize blockscout, fallback on etherscan
  if (config?.blockscoutUrl) return getBlockscoutUrl(config, hash);

  return getEtherscanUrl(config, hash);
};

export const getEtherscanUrl = (config: any, hash: string) => {
  return `${config?.explorerUrl}/tx/${hash}`;
};

export const getBlockscoutUrl = (config: any, hash: string) => {
  return `${config?.blockscoutUrl}/tx/${hash}`;
};

const SIGN_PROTOCOL_GLOBAL_URL = "https://testnet-scan.sign.global";
export const getSignProtocolAttestationUrl = (
  config: any,
  pledgeId: number
) => {
  return `${SIGN_PROTOCOL_GLOBAL_URL}/attestation/onchain_evm_${config?.chainIdNum}_${toHexString(pledgeId)}`;
};

export const getBundlerUrl = (
  chainId: number,
  version: number,
  apiKey: string = "nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44"
) => {
  return `https://bundler.biconomy.io/api/v${version}/${chainId}/${apiKey}`;
};

export const getPaymasterUrl = (
  chainId: number,
  version: number,
  apiKey: string
) => {
  return `https://paymaster.biconomy.io/api/v${version}/${chainId}/${apiKey}`;
};
