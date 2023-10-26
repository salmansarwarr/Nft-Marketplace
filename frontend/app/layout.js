import { Inter } from "next/font/google";
import "./styles/globals.css";
import MyMoralisProvider from "./providers/MyMoralisProvider";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "NFT Marketplace",
    description: "NFT Marketplace, buy and sell nft!",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <MyMoralisProvider>
                    <Header />
                    {children}
                </MyMoralisProvider>
            </body>
        </html>
    );
}
