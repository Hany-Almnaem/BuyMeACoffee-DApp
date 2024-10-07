require("@nomicfoundation/hardhat-ethers");
require("dotenv").config(); // Load .env file
require("@nomiclabs/hardhat-etherscan");

// Read environment variables
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,  // Alchemy/Infura RPC URL from .env
      accounts: [PRIVATE_KEY], // Wallet private key from .env
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY
    }
  },
};