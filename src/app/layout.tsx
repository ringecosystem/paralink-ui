import RainbowProvider from "@/providers/rainbow-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Darwinia Cross-Chain",
  description: "Darwinia USDT Cross-Chain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-app-black text-base font-normal text-white`}>
        <RainbowProvider>
          <Header />
          {children}
          <Footer />
        </RainbowProvider>
      </body>
    </html>
  );
}
