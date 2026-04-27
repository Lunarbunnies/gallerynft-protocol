import { parseArgs, requireArg, toBigInt } from "./_lib/args.js";
import { loadGalleryContract, printTx, waitAndLogReceipt } from "./_lib/gallerynft.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { gallery } = await loadGalleryContract(args);

  const galleryId = toBigInt(requireArg(args, "galleryId", "Missing --galleryId"), "galleryId");
  const title = String(requireArg(args, "title", "Missing --title"));
  const description = String(args.description || "");

  const tx = await gallery.setGalleryFields(galleryId, title, description);
  printTx("setGalleryFields tx", tx.hash);
  await waitAndLogReceipt(tx);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
