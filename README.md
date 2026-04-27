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

## Sepolia Testnet Proof

Deployed contract (Sepolia):

- `0x30D70706BF257ae5cB96E9dB14Be3eA4bd16431D`

Smoke-tested lifecycle on Sepolia using protocol scripts:

1. Deploy contract
2. `createGallery`
3. `addItem`
4. `updateItemFields`
5. `removeItem`
6. `readGallery` verification before/after remove

Recommended for reviewers:

- Verify the contract address and lifecycle transactions on Sepolia Etherscan.
- Confirm post-remove state:
  - `getItemStatus(galleryId, itemKey)` returns `isActive = false`
  - `getGalleryItems(galleryId)` excludes removed item keys
