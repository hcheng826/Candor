const express = require("express");
const cors = require("cors");
const {
  createNexusSessionClient,
  smartSessionUseActions,
  toSmartSessionsValidator,
  createBicoPaymasterClient,
} = require("@biconomy/sdk");
const { http, encodeFunctionData } = require("viem");
const { privateKeyToAccount, generatePrivateKey } = require("viem/accounts");
const {
  baseSepolia,
  polygonAmoy,
  mantleSepoliaTestnet,
  worldchain,
} = require("viem/chains");
const { SmartSessionMode } = require("@rhinestone/module-sdk");
const { config } = require("dotenv");
const fetch = require("node-fetch"); // Make sure to install: npm install node-fetch

config();

const app = express();

let nillionLock = false;

// TODO: put as env variables or in a hashicorp vault
const NILLION_BASE = "https://nillion-storage-apis-v0.onrender.com";
const USER_SEED = "candor_ses_keys";
const NILLION_APP_ID = "07223c9a-e97a-4bdf-b1c6-8390022c54e9";
const SIGNER_PK = process.env.SIGNER_PK;
const BACKEND_SIGNER = privateKeyToAccount(SIGNER_PK);
const BACKEND_PUBLIC_KEY = BACKEND_SIGNER.address;
console.log(`Signer started on ${BACKEND_PUBLIC_KEY}`);

// const corsOptions = {
//   origin: [
//     "http://localhost:3010",
//     "https://eth-bkk-private.vercel.app",
//     "https://candor-three.vercel.app/",
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/test", (req, res) => res.send("test"));

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

app.get("/cron", (req, res) => {
  console.log("cron job triggered");
  processSessions()
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
  console.log("start process sessions...");
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
        const [address, chainId] = secret_name.split("-");

        console.log("querying secret: ", secret_name, "| store id: ", store_id);
        const { secret } = await fetch(
          `${NILLION_BASE}/api/secret/retrieve/${store_id}?retrieve_as_nillion_user_seed=${USER_SEED}&secret_name=${secret_name}`
        ).then((res) => res.json());
        console.log("value: ", secret);

        const secretValue = JSON.parse(secret);
        const {
          sessionData,
          recurAmount,
          beneficiaryId,
          data,
          times,
          interval,
          lastProcessed,
        } = secretValue;

        if (Date.now() < lastProcessed + interval) {
          console.log(
            `skipping secret ${secret_name} as last processed is recent...`
          );
          continue;
        }

        if (Number(times) !== -1 && Number(times) <= 0) {
          console.log(`skipping secret ${secret_name} as times is 0...`);
          continue;
        }

        const { candor, usdc, bundler, paymaster, chain } = CONFIGS[chainId];

        const backendSessionData = {
          granter: address,
          sessionPublicKey: BACKEND_PUBLIC_KEY,
          moduleData: {
            permissionIds: sessionData.moduleData.permissionIds,
            mode: SmartSessionMode.USE,
          },
        };

        const smartSession = await createNexusSessionClient({
          chain: chain,
          accountAddress: backendSessionData.granter,
          signer: BACKEND_SIGNER,
          transport: http(),
          bundlerTransport: http(bundler),
          paymaster: createBicoPaymasterClient({
            paymasterUrl: paymaster,
          }),
        });

        const usePermissionsModule = toSmartSessionsValidator({
          account: smartSession.account,
          signer: BACKEND_SIGNER,
          moduleData: backendSessionData.moduleData,
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

        const storeResponse = await fetch(
          `${NILLION_BASE}/api/apps/${NILLION_APP_ID}/secrets/${store_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nillion_seed: USER_SEED,
              secret_value: JSON.stringify({
                ...secretValue,
                times: secretValue.times - 1,
                lastProcessed: Date.now(),
              }),
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
    console.log("end process sessions...");
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

// setInterval(processSessions, 10_000);
// const PORT = 3002;
// app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

module.exports = app;
