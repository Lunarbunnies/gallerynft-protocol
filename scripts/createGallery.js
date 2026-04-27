import { parseArgs, requireArg } from "./_lib/args.js";
import { loadGalleryContract, printTx, waitAndLogReceipt } from "./_lib/gallerynft.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { gallery } = await loadGalleryContract(args);

  const title = String(requireArg(args, "title", "Missing --title"));
  const description = String(args.description || "");

  const tx = await gallery.createGallery(title, description);
  printTx("createGallery tx", tx.hash);
  const receipt = await waitAndLogReceipt(tx);

  const createdLog = receipt.logs
    .map((l) => {
      try {
        return gallery.interface.parseLog(l);
      } catch {
        return null;
      }
    })
    .find((l) => l && l.name === "GalleryCreated");

  if (createdLog) {
    console.log(`galleryId: ${createdLog.args.galleryId.toString()}`);
    console.log(`owner: ${createdLog.args.owner}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
