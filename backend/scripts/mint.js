const { ethers } = require("hardhat");

const mintAndList = async () => {
    const basicNft = await ethers.getContract("BasicNft");

    console.log("Minting...");
    const mintTx = await basicNft.mintNft();
    const mintTxReciept = await mintTx.wait(1);
    const tokenId = mintTxReciept.logs[0].args.tokenId;
    
    console.log(`TokenID: ${tokenId}`)
    console.log(`Address: ${basicNft.address || basicNft.target}`)
};

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
