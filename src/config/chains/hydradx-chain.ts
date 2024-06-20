import { AssetID, ChainConfig, ChainID, ParachainID, WalletID } from "@/types";
import { bnToBn } from "@polkadot/util";

export const hydradxChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.HYDRADX,
  network: "hydradx",
  name: "Hydration",
  nativeCurrency: {
    name: "HDX",
    symbol: "HDX",
    decimals: 12,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hydradx.cloud"],
      webSocket: ["wss://rpc.hydradx.cloud"],
    },
    public: {
      http: ["https://rpc.hydradx.cloud"],
      webSocket: ["wss://rpc.hydradx.cloud"],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://hydration.subscan.io/",
    },
  },

  /**
   * Custom
   */
  logo: "hydration.svg",
  assets: [
    {
      icon: "ring.png",
      id: 31,
      name: "Darwinia Network RING",
      symbol: "RING",
      decimals: 18,
      origin: {
        parachainId: ParachainID.DARWINIA,
        palletInstance: 5,
        id: AssetID.SYSTEM,
      },
      cross: [
        {
          target: { network: "darwinia", symbol: "RING" },
          fee: {
            amount: bnToBn("5000000000000000000"), // 5 RING
            asset: {
              local: { id: 31 },
              origin: {
                parachainId: ParachainID.DARWINIA,
                palletInstance: 5,
                id: AssetID.SYSTEM,
              },
            },
          },
          section: "xTokens",
          method: "transferMultiasset",
        },
      ],
    },
  ],
  wallets: [WalletID.TALISMAN],
  addressType: "substrate",

  /**
   * Substrate
   */
  endpoint: "wss://rpc.hydradx.cloud",
  parachainId: ParachainID.HYDRADX,
};
