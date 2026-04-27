# GalleryNFT Protocol

Canonical protocol repository for **On-Chain Curated Galleries**.

This repo defines and tests the ERC-721 contract extension where one token is one gallery, and gallery/item curation fields are stored directly on-chain.

## What Is In This Repo

- Solidity contract: `contracts/GalleryNFT.sol`
- Canonical interface: `contracts/interfaces/IGalleryNFT.sol`
- Packed reference helper: `contracts/libraries/PackedRef.sol`
- Contract tests: `test/`
- Integrator docs: `docs/`
- Utility scripts: `scripts/`

## Node + Tooling

- Node: `v24.12.0` (see `.nvmrc`)
- Hardhat 3 is used for compile/test

## Quick Start

```bash
npm install
npm run compile
npm test
```

## Environment

Copy `.env.example` to `.env` for network/deploy settings:

- `SEPOLIA_RPC_URL`
- `MAINNET_RPC_URL`
- `DEPLOYER_PRIVATE_KEY`

Never commit real keys.

## Key Docs

- Overview: `docs/contract-overview.md`
- Methods: `docs/contract-methods.md`
- Integration guide: `docs/integration-guide.md`
- Script usage: `scripts/README.md`

HTML versions are included in `docs/` for teams that prefer browser-readable docs.

## Utility Scripts

- `npm run script:deploy`
- `npm run script:create-gallery`
- `npm run script:set-gallery-fields`
- `npm run script:add-item`
- `npm run script:update-item-fields`
- `npm run script:remove-item`
- `npm run script:read-gallery`
- `npm run script:packed-ref`

## Security / Review Notes

- Contract writes are owner/approved-gated (ERC-721 auth model).
- `itemKey` is deterministic: `keccak256(packedRef)`.
- `npm audit --omit=dev` is expected to be clean.
- Full `npm audit` may include dev-tool advisories from upstream Hardhat dependencies.
