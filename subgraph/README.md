# Candor subgraph

Candor utilises The Graph Protocol for real-time blockchain data indexing across its core `Candor.sol` and `CandorSPHook.sol` custom hook implementation integrated with Sign Protocol's `SP.sol` main instance.

## Deployed Endpoints
Base Sepolia: https://api.studio.thegraph.com/query/94972/candor-base-sepolia/version/latest
Polygon Amoy: https://api.studio.thegraph.com/query/94972/candor-polygon-amoy/version/latest
Celo Alfajores: https://api.studio.thegraph.com/query/94972/candor-celo-alfajores/version/latest

### Note on Preparation:

To generate built schemas and artifacts:

```bash
yarn codegen
```

## Local Deployment

2. start graph node (remove previous data if there is any)

```bash
docker compose up
```

3. create and deploy graph instance

```bash
npm run create-local
npm run deploy-local
```

Then should be able to see data at [http://localhost:8000/subgraphs/name/candor](http://localhost:8000/subgraphs/name/candor)

## Live Deployment

To prepare the workspace for a given network run:

```bash
yarn prepare:<network>
```

Run this command to deploy live to The Graph:

```bash
export SUBGRAPH_ACCESS_KEY=<your-access-key>
yarn deploy:<network>
```

## Deployed Subgraph URLs

### Base Sepolia

- Name: `candor-base-sepolia`
- Latest Version: `<FILL IN>`

```
https://api.studio.thegraph.com/query/46716/candor-base-sepolia/version/latest
```

#### Example Usage

```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ attestationInfos(first: 5) { id reviewAttestationId nullifierHash revoked } bundles(first: 5) { id syncingIndex } }", "operationName": "Subgraphs", "variables": {}}' \
  https://api.studio.thegraph.com/query/46716/candor-base-sepolia/version/latest
```

### Sepolia

- Name: `candor-sepolia`
- Latest Version: `<FILL IN>`

```
https://api.studio.thegraph.com/query/46716/candor-test/version/latest
```

#### Example Usage

```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ attestationInfos(first: 5) { id reviewAttestationId nullifierHash revoked } bundles(first: 5) { id syncingIndex } }", "operationName": "Subgraphs", "variables": {}}' \
  https://api.studio.thegraph.com/query/46716/candor-test/version/latest
```
