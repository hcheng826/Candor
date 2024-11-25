import { Abi } from "viem";

export const CANDOR_ADDRESS = "0x171e18bC5dcF2bca6AAc9D1bA594c2788e0A1b5e";

export const CANDOR_JSON_ABI: Abi = [
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_schemaId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "_spInstance",
        type: "address",
      },
      {
        internalType: "address",
        name: "_spHook",
        type: "address",
      },
      {
        internalType: "address",
        name: "_baseCurrency",
        type: "address",
      },
      {
        internalType: "address",
        name: "_aggregatorRouterV6",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contributor",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
    ],
    name: "BeneficiaryNotPledged",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "BoringOwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedInnerCall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
    ],
    name: "InvalidBeneficiary",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contributor",
        type: "address",
      },
    ],
    name: "PledgedBeneficiary",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    inputs: [],
    name: "SwapNativeToTokenError",
    type: "error",
  },
  {
    inputs: [],
    name: "SwapTokenToTokenError",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contributor",
        type: "address",
      },
    ],
    name: "UnpledgedState",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroBalance",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "beneficiaryAddress",
        type: "address",
      },
    ],
    name: "BeneficiaryRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "beneficiaryAddress",
        type: "address",
      },
    ],
    name: "BeneficiaryUpdate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "donor",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "DonationReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "DonationWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "spInstance",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "spHook",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "baseCurrency",
        type: "address",
      },
    ],
    name: "Initialised",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "contributor",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "attestationId",
        type: "uint64",
      },
    ],
    name: "PledgeAttested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "contributor",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "attestationId",
        type: "uint64",
      },
    ],
    name: "PledgeRevoked",
    type: "event",
  },
  {
    inputs: [],
    name: "BASE_CURRENCY",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CLR_WEIGHTAGE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "EPOCH_INTERVAL",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_BPS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SOCIAL_WEIGHTAGE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "START_TIME",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TOTAL_WEIGHTAGE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "totalAmount",
        type: "uint256",
      },
    ],
    name: "_calculateWeightedAmounts",
    outputs: [
      {
        internalType: "uint256",
        name: "clrWeighted",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "socialWeighted",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
    ],
    name: "_clrMatch",
    outputs: [
      {
        internalType: "address[]",
        name: "beneficiaries",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "basisPoints",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "donor",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
    ],
    name: "_donorGenericDonationRegistry",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "aggregationRouter",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "encodedProof",
        type: "bytes",
      },
    ],
    name: "attestPledge",
    outputs: [
      {
        internalType: "uint64",
        name: "attestationId",
        type: "uint64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "beneficiaryBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "beneficiaryCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "beneficiaryRegistry",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
    ],
    name: "collectDonations",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "currentEpochIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "currency",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "swapData",
        type: "bytes",
      },
    ],
    name: "donateByAltCurrency",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "donateByBaseCurrency",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
    ],
    name: "getBeneficiaryDonationsByEpoch",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
    ],
    name: "getBeneficiaryDonationsCurrentEpoch",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "donor",
        type: "address",
      },
    ],
    name: "getDonorBeneficiaryContributionByEpoch",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "pledgeId",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "donor",
        type: "address",
      },
    ],
    name: "getDonorBeneficiaryContributionCurrentEpoch",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "pledgeId",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "donor",
        type: "address",
      },
    ],
    name: "getDonorGenericDonationByEpoch",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "donor",
        type: "address",
      },
    ],
    name: "getDonorGenericDonationCurrentEpoch",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGenericDonationCurrentEpoch",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
    ],
    name: "getGenericDonationsByEpoch",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contributor",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "epochIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
    ],
    name: "getPledgeAttestation",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "schemaId",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "linkedAttestationId",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "attestTimestamp",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "revokeTimestamp",
            type: "uint64",
          },
          {
            internalType: "address",
            name: "attester",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "validUntil",
            type: "uint64",
          },
          {
            internalType: "enum DataLocation",
            name: "dataLocation",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "revoked",
            type: "bool",
          },
          {
            internalType: "bytes[]",
            name: "recipients",
            type: "bytes[]",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct Attestation",
        name: "pledgeAttestation",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPledgeSchema",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "registrant",
            type: "address",
          },
          {
            internalType: "bool",
            name: "revocable",
            type: "bool",
          },
          {
            internalType: "enum DataLocation",
            name: "dataLocation",
            type: "uint8",
          },
          {
            internalType: "uint64",
            name: "maxValidFor",
            type: "uint64",
          },
          {
            internalType: "contract ISPHook",
            name: "hook",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "timestamp",
            type: "uint64",
          },
          {
            internalType: "string",
            name: "data",
            type: "string",
          },
        ],
        internalType: "struct Schema",
        name: "pledgeSchema",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "contributor",
        type: "address",
      },
    ],
    name: "isBeneficiaryPledged",
    outputs: [
      {
        internalType: "bool",
        name: "pledged",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pledgeSchemaId",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
    ],
    name: "registerBeneficiary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "beneficiaryId",
        type: "uint256",
      },
    ],
    name: "revokePledgeAttestation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "schemaId_",
        type: "uint64",
      },
    ],
    name: "setPledgeSchemaId",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "hookInstance",
        type: "address",
      },
    ],
    name: "setSPHookInstance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "instance",
        type: "address",
      },
    ],
    name: "setSPInstance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "spHookInstance",
    outputs: [
      {
        internalType: "contract ISPHookCandor",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "spInstance",
    outputs: [
      {
        internalType: "contract ISP",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
      {
        internalType: "bool",
        name: "direct",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "renounce",
        type: "bool",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
