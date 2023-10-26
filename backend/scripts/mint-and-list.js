const { ethers } = require("hardhat");

const PRICE = ethers.parseEther("0.1");

const mintAndList = async () => {
    const nftMarketPlace = await ethers.getContract("NftMarketPlace");
    const basicNft = await ethers.getContract("BasicNft");

    console.log("Minting...");
    const mintTx = await basicNft.mintNft();
    const mintTxReciept = await mintTx.wait(1);
    const tokenId = mintTxReciept.logs[0].args.tokenId;

    console.log("Approving Nft...");
    const approvalTx = await basicNft.approve(nftMarketPlace.target, tokenId);
    await approvalTx.wait(1);

    console.log("Listing Nft...");
    const tx = await nftMarketPlace.listItem(basicNft.target, tokenId, PRICE);
    await tx.wait(1);
    
    console.log("Listed Nft!");
};

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
