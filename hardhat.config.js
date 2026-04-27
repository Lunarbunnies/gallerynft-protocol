import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import dotenv from "dotenv";

dotenv.config();
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const networks = {};

if (process.env.SEPOLIA_RPC_URL) {
  networks.sepolia = {
    type: "http",
    url: process.env.SEPOLIA_RPC_URL,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
  };
}

if (process.env.MAINNET_RPC_URL) {
  networks.mainnet = {
    type: "http",
    url: process.env.MAINNET_RPC_URL,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
  };
}

/** @type {import("hardhat/config").HardhatUserConfig} */
const config = {
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks
};

export default config;
