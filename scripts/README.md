# GalleryNFT Utility Scripts

Reference scripts for teams integrating their own app with `GalleryNFT`.

These scripts are intentionally simple and wallet-backend oriented (server key / dev key). Frontend apps should call the same contract methods via injected wallet providers.

## Prerequisites

1. Install deps: `npm install`
2. Configure `.env`:
   - `SEPOLIA_RPC_URL` or `MAINNET_RPC_URL`
   - `DEPLOYER_PRIVATE_KEY`
3. Use Node version from `.nvmrc`

## Deploy

```bash
npx hardhat run scripts/deploy.js --network sepolia -- --name "On-Chain Curated Galleries" --symbol GALLERY
```

## Write Operations

Create gallery:

```bash
npx hardhat run scripts/createGallery.js --network sepolia -- \
  --contract 0xYourGalleryNFT \
  --title "My Gallery" \
  --description "Curated cross-chain works"
```

Update gallery fields:

```bash
npx hardhat run scripts/setGalleryFields.js --network sepolia -- \
  --contract 0xYourGalleryNFT \
  --galleryId 1 \
  --title "Updated Title" \
  --description "Updated description"
```

Add EVM item:

```bash
npx hardhat run scripts/addItem.js --network sepolia -- \
  --contract 0xYourGalleryNFT \
  --galleryId 1 \
  --kind evm \
  --chainId 1 \
  --nftContract 0xB47e3Cd837dDF8e4c57F05d70Ab865de6e193BBB \
  --tokenId 9390 \
  --displayOrder 10 \
  --label "CryptoPunk #9390" \
  --note "Genesis provenance"
```

Add item with pre-built packed ref:

```bash
npx hardhat run scripts/addItem.js --network sepolia -- \
  --contract 0xYourGalleryNFT \
  --galleryId 1 \
  --packedRef 0x... \
  --displayOrder 10 \
  --label "Label" \
  --note "Note"
```

Update item fields:

```bash
npx hardhat run scripts/updateItemFields.js --network sepolia -- \
  --contract 0xYourGalleryNFT \
  --galleryId 1 \
  --itemKey 0xItemKey \
  --displayOrder 20 \
  --label "Updated label" \
  --note "Updated note"
```

Remove item:

```bash
npx hardhat run scripts/removeItem.js --network sepolia -- \
  --contract 0xYourGalleryNFT \
  --galleryId 1 \
  --itemKey 0xItemKey
```

## Read Operations

Read full gallery + active items:

```bash
npx hardhat run scripts/readGallery.js --network sepolia -- \
  --contract 0xYourGalleryNFT \
  --galleryId 1
```

## PackedRef Helpers

These utilities help when you need deterministic item keys off-chain:

```bash
node scripts/packedRefTool.js encode-evm --chainId 1 --nftContract 0x... --tokenId 1
node scripts/packedRefTool.js decode --packedRef 0x...
node scripts/packedRefTool.js item-key --packedRef 0x...
```

`itemKey` is always `keccak256(packedRef)` and matches contract behavior.
