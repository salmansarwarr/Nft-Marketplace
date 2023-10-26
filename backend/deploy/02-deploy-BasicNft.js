const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat.config");
const { verify } = require("../utils/verify");
require('dotenv').config();

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("----------------------------");
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        to: null,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(basicNft.address, []);
    }
    log("----------------------------");
};

module.exports.tags = ["all", "basicNft"];
