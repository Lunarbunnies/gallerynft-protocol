import { parseArgs, requireArg, toBigInt, toNumber } from "./_lib/args.js";
import { loadGalleryContract, printTx, waitAndLogReceipt } from "./_lib/gallerynft.js";
import { buildPackedRefFromArgs, computeItemKey } from "./_lib/packedRef.js";

function packedRefFromArgs(args) {
  if (args.packedRef) return String(args.packedRef);

  const kind = String(args.kind || "evm").toLowerCase();
  if (kind === "evm") {
    return buildPackedRefFromArgs({
      kind,
      chainId: requireArg(args, "chainId", "Missing --chainId for evm item"),
      nftContract: requireArg(args, "nftContract", "Missing --nftContract for evm item"),
      tokenId: requireArg(args, "tokenId", "Missing --tokenId")
    });
  }

  if (kind === "tezos") {
    return buildPackedRefFromArgs({
      kind,
      tezosNet: requireArg(args, "tezosNet", "Missing --tezosNet for tezos item"),
      contractHashHex: requireArg(args, "contractHashHex", "Missing --contractHashHex for tezos item"),
      tokenId: requireArg(args, "tokenId", "Missing --tokenId")
    });
  }

  throw new Error("Unsupported --kind. Use evm or tezos");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { gallery } = await loadGalleryContract(args);

  const galleryId = toBigInt(requireArg(args, "galleryId", "Missing --galleryId"), "galleryId");
  const displayOrder = toNumber(String(args.displayOrder ?? "0"), "displayOrder");
  const label = String(args.label || "");
  const note = String(args.note || "");

  const packedRefHex = packedRefFromArgs(args);

  const tx = await gallery.addItem(galleryId, packedRefHex, displayOrder, label, note);
  printTx("addItem tx", tx.hash);
  await waitAndLogReceipt(tx);

  const itemKey = computeItemKey(packedRefHex);
  console.log(`packedRef: ${packedRefHex}`);
  console.log(`itemKey:   ${itemKey}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
