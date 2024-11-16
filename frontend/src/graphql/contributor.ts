import { gql, GraphQLClient } from "graphql-request";
import { addressToToken } from "@/config";
import { SUBGRAPH_URL, toEther } from "@/utils";

export const getContributors = async () => {
  const client = new GraphQLClient(SUBGRAPH_URL);
  const res =
    await client.request<GqlContributorsResponse>(allContributorsQuery);

  return res;
};

export const getContributonsByBeneficiaryId = async (
  beneficiaryId: string,
  chainId: number | string
) => {
  const client = new GraphQLClient(SUBGRAPH_URL);
  const res = await client.request<GqlContributionsResponse>(
    contributorsByBenIdQuery,
    { benId: beneficiaryId }
  );

  if (res == null || res?.contributions.length === 0) return [];
  const contributors = await client.request<GqlContributorsResponse>(
    contributorsByIdQuery,
    { users: res.contributions.map((c) => c.contributor.id) }
  );
  const addressToContributor = contributors.contributors.reduce(
    (acc, c) => {
      acc[c.id] = c;
      return acc;
    },
    {} as { [address: string]: GqlContributor }
  );

  return res.contributions.map((c, idx) => {
    const token = addressToToken(c.id, chainId)!;
    return {
      ...c,
      gqlId: c.id,
      address: c.contributor.id,
      amount: toEther(c.amount, token?.decimals || 6),
      timestamp: c.timestamp,
      donateTxHash: c.type === ContributionType.BENEFICIARY ? c.tx.id : null,
      pledgeTxHash:
        c.type === ContributionType.BENEFICIARY_PLEDGE ? c.tx.id : null,
      socialScore: addressToContributor[c.id]?.worldIdUser?.score ?? 0,
      date: new Date(Number(c.timestamp) * 1_000),
    };
  });
};

export enum ContributionType {
  BENEFICIARY = "BENEFICIARY",
  BENEFICIARY_PLEDGE = "BENEFICIARY_PLEDGE",
}

export type GqlToken = {
  id: string;
  type: string;
  name: string;
  symbol: string;
  decimals: string;
};

export type GqlTransaction = {
  id: string;
  blockNumber: string;
  timestamp: string;
  gasLimit: string;
  gasPrice: string;
  from: string;
  to: string;
};

export type GqlContributorsResponse = {
  contributors: GqlContributor[];
};

export type GqlContributionsResponse = {
  contributions: GqlContributon[];
};

export type GqlWorldcoinUser = {
  id: string;
  nullifierHash: string;
  collector: string;
  score: string;
};

export type GqlContributor = {
  id: string; // address
  user: {
    id: string;
    type: ContributionType;
  };
  directAmount: string;
  genericAmount: string;
  pledgeCount: string;
  donationCount: string;
  worldIdUser?: GqlWorldcoinUser;
};

export type GqlContributon = {
  id: string;
  type: string;
  beneficiary: {
    id: string;
  };
  contributor: {
    id: string;
    type: ContributionType;
  };
  token: GqlToken;
  pledgeAttestationId: string;
  amount: string;
  epoch: string;
  tx: GqlTransaction;
  timestamp: string;
};

const contributorsByIdQuery = gql`
  query GetContributorsByIds($users: [String]) {
    contributors(where: { user_in: $users }) {
      id
      user {
        id
        type
      }
      directAmount
      genericAmount
      pledgeCount
      donationCount
      worldIdUser {
        id
        nullifierHash
        collector
        score
      }
    }
  }
`;

const allContributorsQuery = gql`
  query GetAllContributors {
    contributors {
      id
      user {
        id
        type
      }
      directAmount
      genericAmount
      pledgeCount
      donationCount
    }
  }
`;

const contributorsByBenIdQuery = gql`
  query GetContributonsByBenId($benId: ID) {
    contributions(
      where: { beneficiary_: { id: $benId } }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      type
      beneficiary {
        id
        beneficiaryId
      }
      contributor {
        id
        type
      }
      amount
      pledgeAttestationId
      token {
        id
        type
        name
        symbol
        decimals
        volume
      }
      epoch
      tx {
        id
        blockNumber
        timestamp
        gasLimit
        gasPrice
        from
        to
      }
      timestamp
    }
  }
`;
