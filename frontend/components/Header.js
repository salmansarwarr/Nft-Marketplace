"use client";

import Link from "next/link";
import { ConnectButton } from "web3uikit";

const Header = () => {
    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
            <h1 className="p-4 font-bold text-3xl">NFT Marketplace</h1>
            <div className="flex flex-row items-center">
                <div className="mr-4 p-6 hover:underline">
                    <Link href="/">Home</Link>
                </div>
                <div className="mr-4 p-6 hover:underline">
                    <Link href="/sell-nft">Sell NFT</Link>
                </div>
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    );
};

export default Header;
