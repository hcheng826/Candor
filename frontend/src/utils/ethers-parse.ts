import { ethers } from "ethers";

export const isNativeToken = (tokenAddress: string) => {
  return tokenAddress === ethers.ZeroAddress;
};

export const toEther = (amount: string, decimals: number) => {
  return Number(ethers.formatUnits(amount.toString(), decimals)) || 0;
};

export const toWei = (amount: number, decimals: number) => {
  return ethers.parseUnits(amount.toString(), decimals);
};

export const toHexString = (v: number) => {
  return "0x" + v.toString(16);
};

export const truncateAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};
