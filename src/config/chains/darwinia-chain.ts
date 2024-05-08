import { ChainConfig, ChainID, ParachainID, WalletID } from "@/types";
import { bnToBn } from "@polkadot/util";

export const darwiniaChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.DARWINIA,
  network: "darwinia",
  name: "Darwinia",
  nativeCurrency: {
    name: "RING",
    symbol: "RING",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.darwinia.network"],
      webSocket: ["wss://rpc.darwinia.network"],
    },
    public: {
      http: ["https://rpc.darwinia.network"],
      webSocket: ["wss://rpc.darwinia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://darwinia.subscan.io",
    },
  },

  /**
   * Custom
   */
  logo: "darwinia.png",
  assets: [
    {
      icon: "usdt.svg",
      id: 1027,
      name: "Tether USD",
      symbol: "ahUSDT",
      decimals: 6,
      cross: [
        {
          isReserve: false,
          target: { network: "assethub-polkadot", symbol: "USDT" },
          fee: { amount: bnToBn(700000), asset: { id: 1984, decimals: 6, symbol: "ahUSDT", native: true } }, // 0.7 USDT
        },
      ],
    },
    {
      icon: "pink.jpg",
      id: 1028,
      name: "PINK",
      symbol: "ahPINK",
      decimals: 10,
      cross: [
        {
          isReserve: false,
          target: { network: "assethub-polkadot", symbol: "PINK" },
          fee: { amount: bnToBn(700000), asset: { id: 1984, decimals: 6, symbol: "ahUSDT", native: false } }, // 0.7 USDT
        },
      ],
    },
  ],
  wallets: [WalletID.RAINBOW, WalletID.TALISMAN],
  addressType: "evm",
  hasAssetLimit: true,

  /**
   * Substrate
   */
  endpoint: "wss://rpc.darwinia.network",
  parachainId: ParachainID.DARWINIA,
};
