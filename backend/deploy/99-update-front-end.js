const { ethers, network } = require("hardhat");
require("dotenv").config();
const fs = require("fs");

const frontendContractsFile =
    "/home/salman/hardhat/nft-marketPlace/frontend/app/constants/networkMapping.json";
const frontendAbiLocation =
    "/home/salman/hardhat/nft-marketPlace/frontend/app/constants/";
module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating frontend...");
        await updateContractAddresses();
        await updateAbi();
    }
};

const updateContractAddresses = async () => {
    const nftMarketplace = await ethers.getContract("NftMarketPlace");
    const chainId = network.config.chainId.toString();
    const contractAddress = JSON.parse(
        fs.readFileSync(frontendContractsFile, "utf8")
    );
    if (chainId in contractAddress) {
        if (!contractAddress[chainId]["NftMarketplace"]) {
            contractAddress[chainId]["NftMarketplace"] = [
                nftMarketplace.target,
            ];
        } else if (
            !contractAddress[chainId]["NftMarketplace"].includes(
                nftMarketplace.target
            )
        ) {
            contractAddress[chainId]["NftMarketplace"].push(
                nftMarketplace.target
            );
        }
    } else {
        contractAddress[chainId] = { NftMarketplace: [nftMarketplace.target] };
    }
    fs.writeFileSync(frontendContractsFile, JSON.stringify(contractAddress));
    console.log("Updated addresses");
};

const updateAbi = async () => {
    const nftMarketPlace = await ethers.getContract("NftMarketPlace");
    fs.writeFileSync(`${frontendAbiLocation}NFTMarketplace.json`, JSON.stringify(nftMarketPlace.interface.fragments))
   
    const basicNft = await ethers.getContract("BasicNft");
    fs.writeFileSync(`${frontendAbiLocation}BasicNft.json`, JSON.stringify(basicNft.interface.fragments))
};

module.exports.tags = ["all", "frontend"];
