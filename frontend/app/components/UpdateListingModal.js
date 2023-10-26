"use client";

import { useState } from "react";
import { Modal, Input, useNotification } from "web3uikit";
import { useWeb3Contract } from "react-moralis";
import nftMarketPlaceAbi from "../constants/NFTMarketplace.json";
import { ethers } from "ethers";

const UpdateListingModal = ({
    nftAddress,
    tokenId,
    isVisible,
    marketPlaceAddress,
    onClose,
}) => {
    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);
    const dispatch = useNotification();

    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "listing updated!",
            title: "Listing updated - please refresh",
            position: "topR"
        })
        onClose && onClose()
        setPriceToUpdateListingWith("0");
    };

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketPlaceAbi,
        contractAddress: marketPlaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
        },
    });

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                updateListing({
                    onError: (error) => console.log(error),
                    onSuccess: handleUpdateListingSuccess,
                });
            }}
        >
            <Input
                label="Update listing price in L1 Currency (ETH)"
                name="New listing price"
                type="number"
                onChange={(e) => setPriceToUpdateListingWith(e.target.value)}
            />
        </Modal>
    );
};

export default UpdateListingModal;
