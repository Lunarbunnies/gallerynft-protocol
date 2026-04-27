# GalleryNFT Integration Guide (For Existing Apps)

This guide is for teams who already have their own app and only need the protocol basics.

## Where This Belongs

Put protocol-level integration docs in `gallerynft-protocol`.

Reason:
1. It is the canonical source for contract interface and events.
2. App repos can change UX stack, but contract integration rules should stay stable.
3. Third-party integrators can onboard without reading app internals.

## Minimal Integration Flow

1. Connect user wallet (EOA or smart account).
2. Instantiate `GalleryNFT` at known address using ABI from this repo.
3. For writes, call contract methods with user signature.
4. For reads, call `getGallery*` and `getItem*` view methods.
5. Optionally index events (`GalleryCreated`, `ItemAdded`, etc.) into your cache.

## Canonical Writes

1. `createGallery(title, description)`
2. `setGalleryFields(galleryId, title, description)`
3. `addItem(galleryId, packedRef, displayOrder, label, note)`
4. `updateItemFields(galleryId, itemKey, displayOrder, label, note)`
5. `removeItem(galleryId, itemKey)`

All writes are owner/approved-gated by ERC-721 auth.

## Canonical Reads

Gallery:
1. `ownerOf(galleryId)`
2. `getGallery(galleryId)`
3. `getGalleryFields(galleryId)`
4. `getGalleryItems(galleryId)`

Item:
5. `getItem(galleryId, itemKey)`
6. `getItemFields(galleryId, itemKey)`
7. `getItemPackedRef(galleryId, itemKey)`
8. `getItemStatus(galleryId, itemKey)`

Batch:
9. `getItems(galleryId, itemKeys[])`
10. `getItemFieldsBatch(galleryId, itemKeys[])`

## PackedRef + itemKey

`itemKey = keccak256(packedRef)`.

Current packed kinds:
1. EVM (`kind=0`): chainId + 20-byte contract + tokenId
2. Tezos (`kind=1`): tezosNet + 20-byte contract hash + tokenId

Use `scripts/packedRefTool.js` for deterministic encoding/decoding examples.

## Reference Utility Scripts

See `scripts/README.md` and scripts:
1. `scripts/deploy.js`
2. `scripts/createGallery.js`
3. `scripts/setGalleryFields.js`
4. `scripts/addItem.js`
5. `scripts/updateItemFields.js`
6. `scripts/removeItem.js`
7. `scripts/readGallery.js`
8. `scripts/packedRefTool.js`

These scripts are for reference and backend/dev automation. A production frontend should call the same methods directly from the user wallet.

## Frontend Snippets (ethers v6)

Install:

```bash
npm install ethers
```

Load ABI from this repo's compiled artifact (`artifacts/contracts/GalleryNFT.sol/GalleryNFT.json`), then:

```ts
import { BrowserProvider, Contract } from "ethers";
import galleryArtifact from "./GalleryNFT.json";

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const gallery = new Contract(
  "0xYourGalleryNFTAddress",
  galleryArtifact.abi,
  signer
);
```

Write example:

```ts
const tx = await gallery.createGallery("My Gallery", "Curated works");
await tx.wait();
```

Read example:

```ts
const [title, description, createdAt, updatedAt, owner] = await gallery.getGallery(1n);
const itemKeys: string[] = await gallery.getGalleryItems(1n);
```

Add EVM item example (packed ref built off-chain):

```ts
const packedRef = "0x..."; // kind=0 encoding
const tx = await gallery.addItem(1n, packedRef, 10, "Label", "Curator note");
await tx.wait();
```

Security notes:
1. Never use a backend private key for user-owned galleries.
2. Always send writes from the connected wallet.
3. Treat indexer/database as cache; on-chain contract state is canonical.
