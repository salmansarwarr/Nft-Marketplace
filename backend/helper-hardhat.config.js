const { ethers } = require("hardhat");

const networkConfig = {
    11155111: {
        name: "Sepolia",
    },
    31337: {
        name: "Hardhat",
    },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = { networkConfig, developmentChains };
