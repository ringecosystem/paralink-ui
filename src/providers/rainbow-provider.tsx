"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { PropsWithChildren } from "react";
import { pangolinChain } from "@/config/chains";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || "";
const appName = "Darwinia CrossChain";

const { chains, publicClient } = configureChains([pangolinChain], [publicProvider()]);

const { connectors } = getDefaultWallets({ appName, projectId, chains });

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function RainbowProvider({ children }: PropsWithChildren<unknown>) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
}
