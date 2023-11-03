"use client";

import Link from "next/link";
import { ConnectButton } from "web3uikit";

const Header = () => {
    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
            <h1 className="p-4 font-bold text-3xl">NFT Marketplace</h1>
            <div className="flex flex-row items-center">
                <Link className="mr-4 p-6 hover:underline" href="/">Home</Link>
                <Link className="mr-4 p-6 hover:underline" href="/sell-nft">Sell NFT</Link>
                <ConnectButton moralisAuth={false}/>
            </div>
        </nav>
    );
};

export default Header;

