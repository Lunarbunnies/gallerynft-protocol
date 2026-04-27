import hre from "hardhat";
import { parseArgs } from "./_lib/args.js";

async function main() {
  const { ethers } = hre;
  const args = parseArgs(process.argv.slice(2));

  const name = String(args.name || "On-Chain Curated Galleries");
  const symbol = String(args.symbol || "GALLERY");

  const factory = await ethers.getContractFactory("GalleryNFT");
  const contract = await factory.deploy(name, symbol);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`deployed: ${address}`);
  console.log(`name: ${name}`);
  console.log(`symbol: ${symbol}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
