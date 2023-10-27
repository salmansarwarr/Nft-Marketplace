"use client";

import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import nftMarketPlaceAbi from "../constants/NFTMarketplace.json";
import nftAbi from "../constants/BasicNft.json";
import Image from "next/image";
import { Card, useNotification, Modal } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

const truncateStr = (fullStr, strLen) => {
    if (fullStr <= strLen) return fullStr;

    const separator = "...";
    const separetorLength = separator.length;
    const charsToShow = strLen - separetorLength;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.ceil(charsToShow / 2);
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    );
};

const NFTBox = ({ price, nftAddress, tokenId, seller, marketPlace }) => {
    const { account, isWeb3Enabled } = useMoralis();
    const dispatch = useNotification();
    const [imageURI, setImageURI] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenDesc, setTokenDesc] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [buyModal, setBuyModal] = useState(false);

    const hideModal = () => setShowModal(false);

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
        gasLimit: 2000
    });

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketPlaceAbi,
        contractAddress: marketPlace,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
        
    });

    const { runContractFunction: cancelListing } = useWeb3Contract({
        abi: nftMarketPlaceAbi,
        contractAddress: marketPlace,
        functionName: "cancelListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
        gasLimit: 3e7
    });

    const updateUI = async () => {
        try {
            const tokenURI = await getTokenURI();
            console.log(`The TokenURI is ${tokenURI}`);

            if (tokenURI) {
                const reqURL = tokenURI.replace(
                    "ipfs://",
                    "https://ipfs.io/ipfs/"
                );
                const tokenURIResponse = await (await fetch(reqURL)).json();
                const imageURI = tokenURIResponse.image;
                const imageURIURL = imageURI.replace(
                    "ipfs://",
                    "https://ipfs.io/ipfs/"
                );
                setImageURI(imageURIURL);
                setTokenName(tokenURIResponse.name);
                setTokenDesc(tokenURIResponse.description);
            }
        } catch (error) {
            console.error("Error fetching tokenURI:", error);
        }
    };

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const isOwnedByUser = seller === account || seller === undefined;
    const formatedSellerAddress = isOwnedByUser
        ? "you"
        : truncateStr(seller || "", 15);

    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item bought",
            position: "topR",
        });
    };

    const handleCancelItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Item cancelled!",
            title: "Item cancelled",
            position: "topR",
        });
    };

    const handleCardClick = () => {
        isOwnedByUser ? setShowModal(true) : setBuyModal(true);
    };

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            nftAddress={nftAddress}
                            tokenId={tokenId}
                            marketPlaceAddress={marketPlace}
                            onClose={hideModal}
                        />
                        <Modal
                            isVisible={buyModal}
                            onOk={() => {
                                buyItem({
                                    onError: (error) => console.log(error),
                                    onSuccess: () => handleBuyItemSuccess(),
                                });
                            }}
                            onCancel={() => setBuyModal(false)}
                            onCloseButtonPressed={() => setBuyModal(false)}
                        >
                            <h1>
                                You are buying this NFT worth{" "}
                                {ethers.utils.formatUnits(price, "ether")} ETH
                            </h1>
                        </Modal>
                        <Card
                            title={tokenName}
                            description={tokenDesc}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owned by {formatedSellerAddress}
                                    </div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        alt="nft"
                                        height="200"
                                        width="200"
                                    />
                                    <div className="font-bold">
                                        {ethers.utils.formatUnits(
                                            price,
                                            "ether"
                                        )}
                                        ETH
                                    </div>
                                    {seller === account && (
                                        <button
                                            onClick={async () => {
                                                await cancelListing({
                                                    onSuccess: handleCancelItemSuccess,
                                                    onError: (error) => console.log(error),
                                                });
                                            }}
                                            className="text-sm bg-red-500 text-white px-2 py-1 rounded self-center hover:bg-red-600"
                                        >
                                            Cancel NFT listing
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCardClick}
                                        className="text-sm bg-blue-500 text-white px-2 py-1 rounded self-center hover:bg-blue-600"
                                    >
                                        {seller === account ||
                                        seller === undefined
                                            ? "Update NFT"
                                            : "Buy NFT"}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    );
};

export default NFTBox;
