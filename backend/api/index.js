const express = require("express");
const cors = require("cors");
const {
  createNexusSessionClient,
  getChain,
  smartSessionUseActions,
  toSmartSessionsValidator,
  createBicoPaymasterClient,
} = require("@biconomy/sdk");
const { http, encodeFunctionData } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const {
  baseSepolia,
  polygonAmoy,
  mantleSepoliaTestnet,
  worldchain,
} = require("viem/chains");

const app = express();

let nillionLock = false;

// TODO: put as env variables or in a hashicorp vault
const NILLION_BASE = "https://nillion-storage-apis-v0.onrender.com";
const USER_SEED = "candor_ses_keys";
const NILLION_APP_ID = "9f2efd72-7c24-4a1c-9ce8-47aaa57d35e4";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/verify-proof", async (req, res) => {
  // const proof = req.query.proof;
  // const app_id = "app_staging_bb43e863a4ff2d2cf514a2a906710ee7";
  // const action = req.query.action;
  // const verifyRes = await verifyCloudProof(proof, app_id, action);
  // if (verifyRes.success) {
  //   // This is where you should perform backend actions if the verification succeeds
  //   // Such as, setting a user as "verified" in a database
  //   res.status(200).send(verifyRes);
  // } else {
  //   // This is where you should handle errors from the World ID /verify endpoint.
  //   // Usually these errors are due to a user having already verified.
  //   res.status(400).send(verifyRes);
  // }
});

app.post("/store-session", async (req, res) => {
  try {
    const body = { ...req.body, lastProcessed: 0 }; // sessionData, recurAmount, beneficiaryId, data, times, interval
    console.log("received: ", body);
    const { sessionData } = body;
    const { chainId } = req.query;
    const timestamp = Date.now();

    const secretName = `${sessionData.granter}-${chainId}-${timestamp}`;

    const storeResponse = await fetch(
      `${NILLION_BASE}/api/apps/${NILLION_APP_ID}/secrets`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: {
            nillion_seed: USER_SEED,
            secret_name: secretName,
            secret_value: JSON.stringify(body),
          },
          permissions: {
            retrieve: [],
            update: [],
            delete: [],
            compute: {},
          },
        }),
      }
    );

    const result = await storeResponse.json();
    console.log("secret stored at:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error storing session:", error);
    res.status(500).json({ error: "Failed to store session" });
  }
});

//dump
const ERC20_JSON_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const approve = (tokenAddress, amount, spender) => {
  const fnData = {
    abi: ERC20_JSON_ABI,
    functionName: "approve",
    args: [spender, amount],
  };
  return {
    to: tokenAddress,
    data: encodeFunctionData(fnData),
  };
};

const CANDOR_JSON_ABI = [
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
];

const donateByBaseCurrency = (candor, beneficiaryId, amount, data) => {
  const fnData = {
    abi: CANDOR_JSON_ABI,
    functionName: "donateByBaseCurrency",
    args: [beneficiaryId, amount, data],
  };
  return {
    to: candor,
    data: encodeFunctionData(fnData),
  };
};

async function processSessions() {
  if (nillionLock) return;
  nillionLock = true;

  try {
    const storeIds = await fetch(
      `${NILLION_BASE}/api/apps/${NILLION_APP_ID}/store_ids`
    )
      .then((res) => res.json())
      .then((data) => data.store_ids);
    console.log("ids to process:", storeIds);

    for (const { store_id, secret_name } of storeIds) {
      try {
        const [address, chainId, timestamp] = secret_name.split("-");

        console.log("querying secret: ", secret_name);
        const { secret } = await fetch(
          `${NILLION_BASE}/api/secret/retrieve/${store_id}?retrieve_as_nillion_user_seed=${USER_SEED}&secret_name=${secret_name}`
        ).then((res) => res.json());
        console.log("processing secret: ", secret);

        const {
          sessionData,
          recurAmount,
          beneficiaryId,
          data,
          times,
          interval,
          lastProcessed,
        } = JSON.parse(secret);

        if (
          Date.now() < lastProcessed + interval || // already processed
          (Number(times) !== -1 && Number(times) <= 0) // no more remaining times
        ) {
          console.log(`skipping secret ${secret_name}...`);
          continue;
        }

        const { candor, usdc, bundler, paymaster, chain } = CONFIGS[chainId];
        const sessionOwner = privateKeyToAccount(
          sessionData.moduleData.permissionIds[0].startsWith("0x")
            ? sessionData.moduleData.permissionIds[0]
            : `0x${sessionData.moduleData.permissionIds[0]}`
        );
        const smartSession = await createNexusSessionClient({
          chain: chain,
          accountAddress: sessionData.granter,
          signer: sessionOwner,
          transport: http(),
          bundlerTransport: http(bundler),
          paymaster: createBicoPaymasterClient({
            paymasterUrl: paymaster,
          }),
        });

        const usePermissionsModule = toSmartSessionsValidator({
          account: smartSession.account,
          signer: sessionOwner,
          moduleData: sessionData.moduleData,
        });

        const useSmartSession = smartSession.extend(
          smartSessionUseActions(usePermissionsModule)
        );

        const userOpHash = await useSmartSession.usePermission({
          calls: [
            approve(usdc, BigInt(recurAmount), candor),
            donateByBaseCurrency(
              candor,
              beneficiaryId,
              BigInt(recurAmount),
              data
            ),
          ],
        });
        console.log(`Transaction hash: ${userOpHash}`);

        body.times = Number(body.times) - 1;
        body.lastProcessed = Date.now();

        const storeResponse = await fetch(
          `${NILLION_BASE}/api/apps/${NILLION_APP_ID}/secrets`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nillion_seed: USER_SEED,
              secret_value: JSON.stringify(body),
              secret_name: secret_name,
            }),
          }
        );

        const result = await storeResponse.json();
        console.log("secret updated at:", result);
      } catch (err) {
        console.error("unable to process sessions", err);
      }
    }
  } catch (err) {
    console.error("unable to process", err);
  } finally {
    nillionLock = false;
  }
}

const CONFIGS = {
  84532: {
    chain: baseSepolia,
    bundler:
      "https://bundler.biconomy.io/api/v3/84532/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    paymaster:
      "https://paymaster.biconomy.io/api/v2/84532/Kl5UsFJy-.b9637f30-cfd3-4b7a-81f2-8af00d7a4a34",
    candor: "0x9341BEC4A59ae34f628D978f194b451Bc639bF7D",
    candorSpHook: "0x2987a9b18b1d8FA449DF81406922008bebE31020",
    worldId: "0x0000000000000000000000000000000000000000",
    usdc: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
  },
  80002: {
    chain: polygonAmoy,
    bundler:
      "https://bundler.biconomy.io/api/v2/80002/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    paymaster:
      "https://paymaster.biconomy.io/api/v1/80002/_A-QOYhVo.b5f821a8-713d-4d71-88f0-9e2c46df91d4",
    candor: "0xc570829fa7e4b2088cf2A3544Fba9267B3a6160E",
    candorSpHook: "0x91Fdc87cBED8Be6FBfDe8fF0cFE6d9B945b008E4",
    worldId: "0x0000000000000000000000000000000000000000",
    usdc: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
  },
  5003: {
    chain: mantleSepoliaTestnet,
    bundler:
      "https://bundler.biconomy.io/api/v2/80002/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    paymaster:
      "https://paymaster.biconomy.io/api/v1/5003/YGCntgMrf.43fbcdf8-964f-434f-873f-d3d6d02f144e",
    candor: "0x0000000000000000000000000000000000000000",
    candorSpHook: "0x0000000000000000000000000000000000000000",
    worldId: "0x0000000000000000000000000000000000000000",
    usdc: "0x0000000000000000000000000000000000000000",
  },
  480: {
    chain: worldchain,
    bundler: "there is no bundler.com",
    candor: "0x0000000000000000000000000000000000000000",
    candorSpHook: "0x0000000000000000000000000000000000000000",
    worldId: "0x0000000000000000000000000000000000000000",
    usdc: "0x0000000000000000000000000000000000000000",
  },
};

setInterval(processSessions, 10_000);
const PORT = 3002;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

module.exports = app;
