import RainbowProvider from "@/providers/rainbow-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import TalismanProvider from "@/providers/talisman-provider";
import TransferProvider from "@/providers/transfer-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import EVMWalletProviders from "@/providers/evm-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Darwinia Paralink",
  description: "A user-friendly UI for XCM token transfers across various parachains.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-[100vh] w-[100vw]">
      <body
        className={`${inter.className} h-[100vh] w-[100vw] overflow-hidden bg-[#F2F3F5] text-base font-normal text-[#121619]`}
      >
        <RainbowProvider>
          <EVMWalletProviders>
            <TalismanProvider>
              <TransferProvider>
                <Header />
                {children}
                <Footer />
              </TransferProvider>
            </TalismanProvider>
          </EVMWalletProviders>
        </RainbowProvider>
      </body>
    </html>
  );
}
