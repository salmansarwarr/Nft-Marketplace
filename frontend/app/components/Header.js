"use client";

import Link from "next/link";
import { ConnectButton } from "web3uikit";

const Header = () => {
    return (
        <nav className="p-3 md:p-5 border-b-2 flex flex-col md:flex-row items-center">
            <h1 className="p-4 font-bold text-2xl md:text-3xl">
                NFT Marketplace
            </h1>
            <div className="flex flex-col md:flex-row items-center md:items-center">
                <Link className="p-2 md:mr-4 hover:underline" href="/">
                    Home
                </Link>
                <Link className="p-2 md:mr-4 hover:underline" href="/sell-nft">
                    Sell NFT
                </Link>
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    );
};

export default Header;
