import { parseArgs, requireArg, toBigInt } from "./_lib/args.js";
import { loadGalleryContract } from "./_lib/gallerynft.js";
import { decodePackedRef } from "./_lib/packedRef.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { gallery } = await loadGalleryContract(args);

  const galleryId = toBigInt(requireArg(args, "galleryId", "Missing --galleryId"), "galleryId");

  const [title, description, createdAt, updatedAt, owner] = await gallery.getGallery(galleryId);
  const itemKeys = await gallery.getGalleryItems(galleryId);

  const output = {
    galleryId: galleryId.toString(),
    owner,
    title,
    description,
    createdAt: Number(createdAt),
    updatedAt: Number(updatedAt),
    items: []
  };

  for (const itemKey of itemKeys) {
    const item = await gallery.getItem(galleryId, itemKey);
    const packedRefHex = item.packedRef;
    output.items.push({
      itemKey,
      packedRef: packedRefHex,
      decodedRef: decodePackedRef(packedRefHex),
      addedAt: Number(item.addedAt),
      removedAt: Number(item.removedAt),
      displayOrder: Number(item.displayOrder),
      label: item.label,
      note: item.note
    });
  }

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
