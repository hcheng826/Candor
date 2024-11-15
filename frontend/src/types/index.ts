export * from "./blockchain";

export interface Beneficiary {
  id: string;
  address: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface BeneficiaryMetrics {
  totalPledged: number;
  totalDonated: number;
  totalPledges: number;
  totalDonations: number;
}

export interface BeneficiaryDonationPledgeTransaction {
  address: string;
  amount: number;
  timestamp: number;
  donateTxHash: string;
  pledgeTxHash: string;
  socialScore: number;
  date: Date;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
}
