import { ChainConfig, ChainID } from "@/types";

export const pangolinChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.PANGOLIN,
  network: "pangolin",
  name: "Pangolin2",
  nativeCurrency: {
    name: "PRING",
    symbol: "PRING",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://pangolin-rpc.darwinia.network"],
      webSocket: ["wss://pangolin-rpc.darwinia.network"],
    },
    public: {
      http: ["https://pangolin-rpc.darwinia.network"],
      webSocket: ["wss://pangolin-rpc.darwinia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://pangolin.subscan.io/",
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
  endpoint: "wss://pangolin-rpc.darwinia.network",
};
