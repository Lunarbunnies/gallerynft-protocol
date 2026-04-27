import { parseArgs, requireArg, toBigInt, toNumber } from "./_lib/args.js";
import { loadGalleryContract, printTx, waitAndLogReceipt } from "./_lib/gallerynft.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { gallery } = await loadGalleryContract(args);

  const galleryId = toBigInt(requireArg(args, "galleryId", "Missing --galleryId"), "galleryId");
  const itemKey = String(requireArg(args, "itemKey", "Missing --itemKey"));
  const displayOrder = toNumber(String(args.displayOrder ?? "0"), "displayOrder");
  const label = String(args.label || "");
  const note = String(args.note || "");

  const tx = await gallery.updateItemFields(galleryId, itemKey, displayOrder, label, note);
  printTx("updateItemFields tx", tx.hash);
  await waitAndLogReceipt(tx);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
