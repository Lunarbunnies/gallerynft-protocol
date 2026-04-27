import { parseArgs, requireArg } from "./_lib/args.js";
import {
  buildPackedRefFromArgs,
  computeItemKey,
  decodePackedRef,
  encodeEvmPackedRef,
  encodeTezosPackedRef
} from "./_lib/packedRef.js";

function usage() {
  console.log("Usage:");
  console.log("  node scripts/packedRefTool.js encode-evm --chainId 1 --nftContract 0x... --tokenId 123");
  console.log("  node scripts/packedRefTool.js encode-tezos --tezosNet 0 --contractHashHex 0x... --tokenId 123");
  console.log("  node scripts/packedRefTool.js decode --packedRef 0x...");
  console.log("  node scripts/packedRefTool.js item-key --packedRef 0x...");
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  if (!command || command === "help") {
    usage();
    return;
  }

  if (command === "encode-evm") {
    const packedRef = encodeEvmPackedRef({
      chainId: requireArg(args, "chainId"),
      contract: requireArg(args, "nftContract"),
      tokenId: requireArg(args, "tokenId")
    });
    console.log(packedRef);
    return;
  }

  if (command === "encode-tezos") {
    const packedRef = encodeTezosPackedRef({
      tezosNet: requireArg(args, "tezosNet"),
      contractHashHex: requireArg(args, "contractHashHex"),
      tokenId: requireArg(args, "tokenId")
    });
    console.log(packedRef);
    return;
  }

  if (command === "encode") {
    const packedRef = buildPackedRefFromArgs(args);
    console.log(packedRef);
    return;
  }

  if (command === "decode") {
    const packedRef = requireArg(args, "packedRef");
    console.log(JSON.stringify(decodePackedRef(packedRef), null, 2));
    return;
  }

  if (command === "item-key") {
    const packedRef = requireArg(args, "packedRef");
    console.log(computeItemKey(packedRef));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  usage();
  process.exit(1);
}
