import { ChainConfig, ChainID } from "@/types";

export const assethubRococoChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.INVALID,
  network: "assethub-rococo",
  name: "Asset Hub",
  nativeCurrency: {
    name: "ROC",
    symbol: "ROC",
    decimals: 12,
  },
  rpcUrls: {
    default: {
      http: [],
      webSocket: [],
    },
    public: {
      http: [],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://assethub-rococo.subscan.io",
    },
  },
  testnet: true,

  /**
   * Custom
   */
  logo: "", // TODO
  assets: [],

  /**
   * Substrate
   */
  endpoint: "wss://rococo-asset-hub-rpc.polkadot.io",
};
