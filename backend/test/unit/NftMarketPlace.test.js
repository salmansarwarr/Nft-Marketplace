const { assert, expect } = require("chai");
const { network, ethers, deployments, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft MarketPlace Tests", () => {
          let nftMarketPlace, basicNft, deployer, player;
          const PRICE = ethers.parseEther("0.1");
          const TOKEN_ID = 0;

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              const accounts = await ethers.getSigners();
              player = accounts[1];
              await deployments.fixture(["all"]);
              nftMarketPlace = await ethers.getContract(
                  "NftMarketPlace",
                  deployer
              );
              basicNft = await ethers.getContract("BasicNft", deployer);
              await basicNft.mintNft();
              await basicNft.approve(nftMarketPlace.target, TOKEN_ID);
          });

          describe("listItem", function () {
              it("emits an event after listing an item", async function () {
                  expect(
                      await nftMarketPlace.listItem(
                          basicNft.target,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.emit("ItemListed");
              });
              it("exclusively items that haven't been listed", async function () {
                  await nftMarketPlace.listItem(
                      basicNft.target,
                      TOKEN_ID,
                      PRICE
                  );
                  await expect(
                      nftMarketPlace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__AlreadyListed"
                  );
              });
              it("exclusively allows owners to list", async function () {
                  playerConnectedNftMarketPlace =
                      nftMarketPlace.connect(player);
                  await basicNft.approve(player.address, TOKEN_ID);
                  await expect(
                      playerConnectedNftMarketPlace.listItem(
                          basicNft.target,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__NotOwner"
                  );
              });
              it("needs approvals to list item", async function () {
                  await basicNft.approve(ethers.ZeroAddress, TOKEN_ID);
                  await expect(
                      nftMarketPlace.listItem(basicNft.target, TOKEN_ID, PRICE)
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__NotApprovedForMarketPlace"
                  );
              });
              it("Updates listing with seller and price", async function () {
                  await nftMarketPlace.listItem(
                      basicNft.target,
                      TOKEN_ID,
                      PRICE
                  );
                  const listing = await nftMarketPlace.getListing(
                      basicNft.target,
                      TOKEN_ID
                  );
                  assert.equal(listing.price.toString(), PRICE.toString());
                  assert.equal(listing.seller.toString(), deployer);
              });
              it("reverts if the price be 0", async () => {
                  const ZERO_PRICE = ethers.parseEther("0");
                  await expect(
                      nftMarketPlace.listItem(
                          basicNft.target,
                          TOKEN_ID,
                          ZERO_PRICE
                      )
                  ).revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__PriceMustBeAboveZero"
                  );
              });
          });

          describe("cancelListing", function () {
              it("reverts if there is no listing", async function () {
                  await expect(
                      nftMarketPlace.cancelListing(basicNft.target, TOKEN_ID)
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__NotListed"
                  );
              });
              it("reverts if anyone but the owner tries to call", async function () {
                  await nftMarketPlace.listItem(
                      basicNft.target,
                      TOKEN_ID,
                      PRICE
                  );
                  userConnectedNftMarketPlace = nftMarketPlace.connect(player);
                  await basicNft.approve(player.address, TOKEN_ID);
                  await expect(
                      userConnectedNftMarketPlace.cancelListing(
                          basicNft.target,
                          TOKEN_ID
                      )
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__NotOwner"
                  );
              });
              it("emits event and removes listing", async function () {
                  await nftMarketPlace.listItem(
                      basicNft.target,
                      TOKEN_ID,
                      PRICE
                  );
                  expect(
                      await nftMarketPlace.cancelListing(
                          basicNft.target,
                          TOKEN_ID
                      )
                  ).to.emit("ItemCanceled");
                  const listing = await nftMarketPlace.getListing(
                      basicNft.target,
                      TOKEN_ID
                  );
                  assert(listing.price.toString() == "0");
              });
          });

          describe("buyItem", function () {
              it("reverts if the item isnt listed", async function () {
                  await expect(
                      nftMarketPlace.buyItem(basicNft.target, TOKEN_ID)
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__NotListed"
                  );
              });
              it("reverts if the price isnt met", async function () {
                  await nftMarketPlace.listItem(
                      basicNft.target,
                      TOKEN_ID,
                      PRICE
                  );
                  await expect(
                      nftMarketPlace.buyItem(basicNft.target, TOKEN_ID)
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__PriceNotMet"
                  );
              });
              it("transfers the nft to the buyer and updates internal proceeds record", async function () {
                  await nftMarketPlace.listItem(
                      basicNft.target,
                      TOKEN_ID,
                      PRICE
                  );
                  userConnectedNftMarketplace = nftMarketPlace.connect(player);
                  expect(
                      await userConnectedNftMarketplace.buyItem(
                          basicNft.target,
                          TOKEN_ID,
                          {
                              value: PRICE,
                          }
                      )
                  ).to.emit("ItemBought");
                  const newOwner = await basicNft.ownerOf(TOKEN_ID);
                  const deployerProceeds =
                      await nftMarketPlace.getProceeds(deployer);
                  assert(newOwner.toString() == player.address);
                  assert(deployerProceeds.toString() == PRICE.toString());
              });
          });

          describe("updateListing", function () {
              it("must be owner and listed", async function () {
                  await expect(
                      nftMarketPlace.updateListing(
                          basicNft.target,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__NotListed"
                  );
                  await nftMarketPlace.listItem(
                      basicNft.target,
                      TOKEN_ID,
                      PRICE
                  );
                  userConnectedNftMarketPlace = nftMarketPlace.connect(player);
                  await expect(
                      userConnectedNftMarketPlace.updateListing(
                          basicNft.target,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__NotOwner"
                  );
              });
              it("reverts if new price is 0", async function () {
                  const updatedPrice = ethers.parseEther("0");
                  await nftMarketPlace.listItem(
                      basicNft.target,
                      TOKEN_ID,
                      PRICE
                  );
                  await expect(
                      nftMarketPlace.updateListing(
                          basicNft.target,
                          TOKEN_ID,
                          updatedPrice
                      )
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__PriceMustBeAboveZero"
                  );
              });
              it("updates the price of the item", async function () {
                  const updatedPrice = ethers.parseEther("0.2");
                  await nftMarketPlace.listItem(
                      basicNft.target,
                      TOKEN_ID,
                      PRICE
                  );
                  expect(
                      await nftMarketPlace.updateListing(
                          basicNft.target,
                          TOKEN_ID,
                          updatedPrice
                      )
                  ).to.emit("ItemListed");
                  const listing = await nftMarketPlace.getListing(
                      basicNft.target,
                      TOKEN_ID
                  );
                  assert(listing.price.toString() == updatedPrice.toString());
              });
          });

          describe("withdrawProceeds", function () {
              it("doesn't allow 0 proceed withdrawls", async function () {
                  await expect(
                      nftMarketPlace.withdrawProceeds()
                  ).to.be.revertedWithCustomError(
                      nftMarketPlace,
                      "NftMarketPlace__NoProceeds"
                  );
              });
              it("withdraws proceeds", async function () {
                  await nftMarketPlace.listItem(
                      basicNft.target,
                      TOKEN_ID,
                      PRICE
                  );
                  userConnectedNftMarketPlace = nftMarketPlace.connect(player);
                  await userConnectedNftMarketPlace.buyItem(
                      basicNft.target,
                      TOKEN_ID,
                      { value: PRICE }
                  );

                  const deployerProceedsBefore =
                      await nftMarketPlace.getProceeds(deployer);
                  const deployerBalanceBefore =
                      await ethers.provider.getBalance(deployer);
                  const txResponse = await nftMarketPlace.withdrawProceeds();
                  const transactionReceipt = await txResponse.wait(1);
                  const { gasUsed, gasPrice } = transactionReceipt;
                  const gasCost = gasUsed * gasPrice;
                  const deployerBalanceAfter =
                      await ethers.provider.getBalance(deployer);

                  assert(
                      (deployerBalanceAfter + gasCost).toString() ==
                          (
                              deployerProceedsBefore + deployerBalanceBefore
                          ).toString()
                  );
              });
          });
      });
