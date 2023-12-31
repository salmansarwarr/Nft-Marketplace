"use client";

import { Button, Form, useNotification } from "web3uikit";
import { ethers } from "ethers";
import nftAbi from "../constants/BasicNft.json";
import styles from "../styles/Home.module.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import networkMapping from "../constants/networkMapping.json";
import nftMarketPlaceAbi from "../constants/NFTMarketplace.json";
import { useEffect, useState } from "react";

const page = () => {
    const { chainId, isWeb3Enabled, account } = useMoralis();
    const dispatch = useNotification();
    const chainString = chainId ? parseInt(chainId).toString() : "11155111";
    const marketplaceAddress = chainId
        ? networkMapping[chainString].NftMarketplace[0]
        : null;
    const { runContractFunction } = useWeb3Contract();
    const [proceeds, setProceeds] = useState("0");

    const updateUI = async () => {
        const getProceedOptions = {
            abi: nftMarketPlaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "getProceeds",
            params: {
                seller: account,
            },
        };
        const returnedProceeds = await runContractFunction({
            params: getProceedOptions,
            onError: (error) => console.log(error),
        });
        if (returnedProceeds) {
            setProceeds(returnedProceeds.toString());
        }
    };

    useEffect(() => {
        updateUI();
    }, [isWeb3Enabled, account, proceeds, chainId]);

    const approveAndList = async (data) => {
        console.log("Approving...");
        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const price = ethers.utils
            .parseUnits(data.data[2].inputResult, "ether")
            .toString();

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        };

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => console.log(error),
        });
    };

    const handleApproveSuccess = async (nftAddress, tokenId, price) => {
        console.log("Listing...");
        const listOptions = {
            abi: nftMarketPlaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        };

        await runContractFunction({
            params: listOptions,
            onSuccess: () => handleListSuccess(),
            onError: (error) => console.log(error),
        });
    };

    const handleListSuccess = async () => {
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topR",
        });
    };

    const handleWithdrawSuccess = () => {
        dispatch({
            type: "success",
            message: "Withdrawing proceeds",
            position: "topR",
        });
    };

    return (
        <div className={styles.container}>
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        value: "",
                        key: "price",
                    },
                ]}
                title="Sell your NFT!"
                id="Main Form"
            />
            <div>
                Withdraw {ethers.utils.formatEther(proceeds).toString()}{" "}
                proceeds
            </div>
            {proceeds != "0" ? (
                <Button
                    onClick={() => {
                        runContractFunction({
                            params: {
                                abi: nftMarketPlaceAbi,
                                contractAddress: marketplaceAddress,
                                functionName: "withdrawProceeds",
                                params: {},
                            },
                            onError: (error) => console.log(error),
                            onSuccess: () => handleWithdrawSuccess(),
                        });
                    }}
                    text="Withdraw"
                    type="button"
                />
            ) : (
                <div>No proceeds detected</div>
            )}
        </div>
    );
};

export default page;
