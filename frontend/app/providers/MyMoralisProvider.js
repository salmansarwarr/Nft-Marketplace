"use client";

import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: "https://api.studio.thegraph.com/query/56304/nft-marketplace/version/latest",
});

const MyMoralisProvider = ({ children }) => {
    return (
        <MoralisProvider initializeOnMount={false}>
            <ApolloProvider client={client}>
                <NotificationProvider>{children}</NotificationProvider>
            </ApolloProvider>
        </MoralisProvider>
    );
};

export default MyMoralisProvider;
