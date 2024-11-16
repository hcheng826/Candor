import { gql, GraphQLClient } from "graphql-request";
import { Beneficiary } from "@/types";
import { SUBGRAPH_URL } from "@/utils";

//beneficiaryId -> beneficiary
const MOCK_BENEFICIARIES: Record<string, any> = {
  0: {
    name: "Generic Pool",
    image: "/pool.svg",
    description:
      "Pooled funds that will be distributed to beneficiaries fairly",
  },
  1: {
    name: "Cancer Care Fund",
    image: "/star.svg",
    description:
      "The Cancer Care Fund is a one-time financial assistance scheme to alleviate the financial burden of newly-diagnosed cancer patients from low or middle income family",
  },
  2: {
    name: "Children's Home",
    image: "/cake.svg",
    description:
      "CSLMCH provides shelter, care and protection to residents between 5 and 21 years old, many of whom come from needy and disadvantaged families.",
  },
};

export const getAllBeneficiaries = async () => {
  const client = new GraphQLClient(SUBGRAPH_URL);
  const res = await client.request<GqlBeneficiariesResponse>(
    allBeneficiariesQuery
  );

  if (res.beneficiaries == null) return [];

  return res.beneficiaries.map((b: any) => ({
    ...b,
    gqlId: b.id,
    id: b.beneficiaryId,
    address: b.user.id,
    name: MOCK_BENEFICIARIES[b.beneficiaryId].name,
    description: MOCK_BENEFICIARIES[b.beneficiaryId].description,
    imageUrl: MOCK_BENEFICIARIES[b.beneficiaryId].image,
  })) as Beneficiary[];
};

export const getBeneficiaryByAddress = async (address: string) => {
  const client = new GraphQLClient(SUBGRAPH_URL);
  const res = await client.request<GqlBeneficiariesResponse>(
    beneficiaryByAddressQuery,
    { userId: parseBeneficiaryId(address) }
  );

  if (res == null || res?.beneficiaries.length === 0) return null;

  const [b] = res.beneficiaries;
  return {
    ...b,
    gqlId: b.id,
    id: b.beneficiaryId,
    address: b.user.id,
    name: MOCK_BENEFICIARIES[b.beneficiaryId].name,
    description: MOCK_BENEFICIARIES[b.beneficiaryId].description,
    imageUrl: MOCK_BENEFICIARIES[b.beneficiaryId].image,
  };
};

export const getBeneficiary = async (id: string) => {
  const client = new GraphQLClient(SUBGRAPH_URL);
  const res = await client.request<GqlBeneficiaryResponse>(beneficiaryQuery, {
    id,
  });
  if (res == null) return null;

  const { beneficiary: b } = res;
  return {
    ...b,
    gqlId: b.id,
    id: b.beneficiaryId,
    address: b.user.id,
    name: MOCK_BENEFICIARIES[b.beneficiaryId].name,
    description: MOCK_BENEFICIARIES[b.beneficiaryId].description,
    imageUrl: MOCK_BENEFICIARIES[b.beneficiaryId].image,
  };
};

export type GqlBeneficiariesResponse = {
  beneficiaries: GqlBeneficiary[];
};

export type GqlBeneficiaryResponse = { beneficiary: GqlBeneficiary };

export type GqlBeneficiary = {
  beneficiaryId: string;
  clrMatchDonationReceived: string;
  contributorCount: string;
  directDonationReceived: string;
  donorCount: string;
  id: string;
  pledgeCount: string;
  socialMatchDonationReceived: string;
  user: {
    id: string;
    type: string;
  };
  withdrawn: string;
};

const beneficiaryQuery = gql`
  query DonationForBeneficiary($id: ID) {
    beneficiary(id: $id) {
      user {
        id
        type
      }
      withdrawn
      beneficiaryId
      clrMatchDonationReceived
      contributorCount
      directDonationReceived
      donorCount
      id
      socialMatchDonationReceived
      pledgeCount
    }
  }
`;

const beneficiaryByAddressQuery = gql`
  query BeneficiaryByAddress($userId: ID) {
    beneficiaries(where: { user_: { id: $userId } }) {
      id
      beneficiaryId
      clrMatchDonationReceived
      contributorCount
      directDonationReceived
      donorCount
      pledgeCount
      socialMatchDonationReceived
      user {
        id
        type
      }
      withdrawn
    }
  }
`;

const allBeneficiariesQuery = gql`
  query DonationPerBeneficiary {
    beneficiaries {
      id
      beneficiaryId
      clrMatchDonationReceived
      contributorCount
      directDonationReceived
      donorCount
      pledgeCount
      socialMatchDonationReceived
      user {
        id
        type
      }
      withdrawn
    }
  }
`;

const parseBeneficiaryId = (address: string) => {
  return address.toLowerCase();
};
