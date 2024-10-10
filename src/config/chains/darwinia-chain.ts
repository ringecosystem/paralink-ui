import { AssetID, ChainConfig, ChainID, ParachainID, WalletID } from "@/types";
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
      icon: "ring.png",
      id: AssetID.SYSTEM,
      name: "RING",
      symbol: "RING",
      decimals: 18,
      origin: {
        parachainId: ParachainID.DARWINIA,
        palletInstance: 5,
        id: AssetID.SYSTEM,
      },
      cross: [
        {
          target: { network: "hydradx", symbol: "RING" },
          fee: {
            amount: bnToBn("1000000000000000000"), // 1 RING
            asset: {
              local: { id: AssetID.SYSTEM },
              origin: {
                parachainId: ParachainID.DARWINIA,
                palletInstance: 5,
                id: AssetID.SYSTEM,
              },
            },
          },
          section: "polkadotXcm",
          method: "reserveTransferAssets",
        },
      ],
      category: "ring",
    },
    {
      icon: "usdt.svg",
      id: 1027,
      name: "Tether USD",
      symbol: "ahUSDT",
      decimals: 6,
      origin: {
        parachainId: ParachainID.ASSETHUB_POLKADOT,
        palletInstance: 50,
        id: 1984,
      },
      cross: [
        {
          target: { network: "assethub-polkadot", symbol: "USDT" },
          fee: {
            amount: bnToBn(700000),
            asset: {
              local: { id: 1027 },
              origin: {
                parachainId: ParachainID.ASSETHUB_POLKADOT,
                palletInstance: 50,
                id: 1984,
              },
            },
          },
          section: "xTokens",
          method: "transferMultiassets",
        },
      ],
      category: "usdt",
    },
    {
      icon: "pink.jpg",
      id: 1028,
      name: "PINK",
      symbol: "ahPINK",
      decimals: 10,
      origin: {
        parachainId: ParachainID.ASSETHUB_POLKADOT,
        palletInstance: 50,
        id: 23,
      },
      cross: [
        {
          target: { network: "assethub-polkadot", symbol: "PINK" },
          fee: {
            amount: bnToBn(700000),
            asset: {
              local: { id: 1027 },
              origin: {
                parachainId: ParachainID.ASSETHUB_POLKADOT,
                palletInstance: 50,
                id: 1984,
              },
            },
          },
          section: "xTokens",
          method: "transferMultiassets",
        },
      ],
      category: "pink",
    },
    {
      icon: "dot.svg",
      id: 1028,
      name: "DOT",
      symbol: "DOT",
      decimals: 10,
      origin: {
        parachainId: ParachainID.ASSETHUB_POLKADOT,
        palletInstance: 50,
        id: 23,
      },
      cross: [
        {
          target: { network: "assethub-polkadot", symbol: "PINK" },
          fee: {
            amount: bnToBn(700000),
            asset: {
              local: { id: 1027 },
              origin: {
                parachainId: ParachainID.ASSETHUB_POLKADOT,
                palletInstance: 50,
                id: 1984,
              },
            },
          },
          section: "xTokens",
          method: "transferMultiassets",
        },
      ],
      category: "dot",
    },
  ],
  wallets: [WalletID.EVM, WalletID.TALISMAN],
  addressType: "evm",

  /**
   * Substrate
   */
  endpoint: "wss://rpc.darwinia.network",
  parachainId: ParachainID.DARWINIA,
};
