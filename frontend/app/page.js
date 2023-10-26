"use client";

import { useQuery, gql } from "@apollo/client";
import { useMoralis } from "react-moralis";
import networkMapping from "./constants/networkMapping.json";
import NFTBox from "./components/NFTBox";

const GET_ACTIVE_ITEMS = gql`
    query GetActiveItems {
        activeItems(
            first: 5
            where: { buyer: "0x000000000000000000000000000000000000dead" }
        ) {
            id
            buyer
            seller
            nftAddress
            tokenId
            price
        }
    }
`;
const Home = () => {
    const { chainId, isWeb3Enabled } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : null;
    const marketplaceAddress = chainId
        ? networkMapping[chainString].NftMarketplace[0]
        : null;
    const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS);
    const listedfNfts = data?.activeItems;

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
            {isWeb3Enabled && chainId ? (
                loading || !data ? (
                    <>Loading...</>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {listedfNfts.map((nft) => {
                            const {
                                seller,
                                tokenId,
                                nftAddress,

                                price,
                            } = nft;
                            return (
                                <NFTBox
                                    key={`${nftAddress}${tokenId}`}
                                    seller={seller}
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    marketPlace={marketplaceAddress}
                                />
                            );
                        })}
                    </div>
                )
            ) : (
                <div>Web3 currently not enabled! (Connect wallet to enable)</div>
            )}
        </div>
    );
};

export default Home;
