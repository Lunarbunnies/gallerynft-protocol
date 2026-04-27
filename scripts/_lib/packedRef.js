import { keccak256 } from "ethers";

function writeUint64BE(buf, offset, value) {
  let v = BigInt(value);
  for (let i = 7; i >= 0; i -= 1) {
    buf[offset + i] = Number(v & 0xffn);
    v >>= 8n;
  }
}

function writeUint96BE(buf, offset, value) {
  let v = BigInt(value);
  for (let i = 11; i >= 0; i -= 1) {
    buf[offset + i] = Number(v & 0xffn);
    v >>= 8n;
  }
}

function writeUint32BE(buf, offset, value) {
  let v = Number(value) >>> 0;
  buf[offset] = (v >>> 24) & 0xff;
  buf[offset + 1] = (v >>> 16) & 0xff;
  buf[offset + 2] = (v >>> 8) & 0xff;
  buf[offset + 3] = v & 0xff;
}

function normalizeAddressHex(address) {
  const hex = address.toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{40}$/.test(hex)) {
    throw new Error("contract address must be a 20-byte hex string");
  }
  return hex;
}

export function encodeEvmPackedRef({ chainId, contract, tokenId }) {
  const out = Buffer.alloc(41);
  out[0] = 0;
  writeUint64BE(out, 1, BigInt(chainId));
  const addressHex = normalizeAddressHex(contract);
  Buffer.from(addressHex, "hex").copy(out, 9);
  writeUint96BE(out, 29, BigInt(tokenId));
  return `0x${out.toString("hex")}`;
}

export function encodeTezosPackedRef({ tezosNet, contractHashHex, tokenId }) {
  const out = Buffer.alloc(30);
  out[0] = 1;
  out[1] = Number(tezosNet) & 0xff;

  const hashHex = contractHashHex.toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{40}$/.test(hashHex)) {
    throw new Error("contractHashHex must be a 20-byte hex string");
  }
  Buffer.from(hashHex, "hex").copy(out, 2);

  writeUint64BE(out, 22, BigInt(tokenId));
  return `0x${out.toString("hex")}`;
}

export function decodePackedRef(packedRefHex) {
  const hex = packedRefHex.toLowerCase().replace(/^0x/, "");
  const bytes = Buffer.from(hex, "hex");

  if (bytes.length === 41 && bytes[0] === 0) {
    const chainId = bytes.readBigUInt64BE(1);
    const contract = `0x${bytes.subarray(9, 29).toString("hex")}`;
    const tokenId = readUint96BE(bytes, 29);
    return { kind: "evm", chainId, contract, tokenId };
  }

  if (bytes.length === 30 && bytes[0] === 1) {
    const tezosNet = bytes[1];
    const contractHashHex = `0x${bytes.subarray(2, 22).toString("hex")}`;
    const tokenId = bytes.readBigUInt64BE(22);
    return { kind: "tezos", tezosNet, contractHashHex, tokenId };
  }

  return { kind: "unknown", bytesLength: bytes.length };
}

function readUint96BE(buf, offset) {
  let v = 0n;
  for (let i = 0; i < 12; i += 1) {
    v = (v << 8n) | BigInt(buf[offset + i]);
  }
  return v;
}

export function computeItemKey(packedRefHex) {
  return keccak256(packedRefHex);
}

export function decodeEvmPackedRefToDisplay(packedRefHex) {
  const decoded = decodePackedRef(packedRefHex);
  if (decoded.kind !== "evm") return null;
  return {
    chainId: decoded.chainId.toString(),
    contract: decoded.contract,
    tokenId: decoded.tokenId.toString()
  };
}

export function buildPackedRefFromArgs(args) {
  const kind = String(args.kind || "evm").toLowerCase();

  if (kind === "evm") {
    return encodeEvmPackedRef({
      chainId: args.chainId,
      contract: args.nftContract,
      tokenId: args.tokenId
    });
  }

  if (kind === "tezos") {
    return encodeTezosPackedRef({
      tezosNet: args.tezosNet,
      contractHashHex: args.contractHashHex,
      tokenId: args.tokenId
    });
  }

  throw new Error("Unsupported --kind. Use evm or tezos");
}

export function encodeDisplayOrderBytes32(value) {
  const out = Buffer.alloc(32);
  writeUint32BE(out, 28, value);
  return `0x${out.toString("hex")}`;
}
