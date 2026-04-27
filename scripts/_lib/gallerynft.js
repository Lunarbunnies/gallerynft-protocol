import hre from "hardhat";
import { requireArg } from "./args.js";

export async function loadGalleryContract(args) {
  const { ethers } = hre;
  const contractAddress = requireArg(args, "contract", "Missing --contract <GalleryNFT address>");
  const gallery = await ethers.getContractAt("GalleryNFT", contractAddress);
  return { ethers, gallery, contractAddress };
}

export function printTx(label, txHash) {
  console.log(`${label}: ${txHash}`);
}

export async function waitAndLogReceipt(tx) {
  const receipt = await tx.wait();
  console.log(`status: ${receipt.status} | block: ${receipt.blockNumber}`);
  return receipt;
}
