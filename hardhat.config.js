const { task } = require('hardhat/config');
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  path: {
    artifacts: './artifacts'
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(",") : [],
    }
  }
};

// https://cloud.google.com/application/web3/faucet/ethereum/sepolia
