import { ChainConfig, ChainID, ParachainID, WalletID } from "@/types";
import { bnToBn } from "@polkadot/util";

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
  logo: "pangolin.png",
  assets: [
    {
      icon: "usdt.svg",
      id: 1027,
      name: "Tether USD",
      symbol: "ahUSDT",
      decimals: 6,
      origin: {
        parachainId: ParachainID.ASSETHUB_ROCOCO,
        palletInstance: 50,
        id: 7777,
      },
      cross: [
        {
          target: { network: "assethub-rococo", symbol: "USDT" },
          fee: {
            amount: bnToBn(3600000),
            asset: {
              local: { id: 1027 },
              origin: {
                parachainId: ParachainID.ASSETHUB_ROCOCO,
                palletInstance: 50,
                id: 7777,
              },
            },
          },
          section: "xTokens",
          method: "transferMultiassets",
        },
      ],
      category: "usdt",
    },
  ],
  wallets: [WalletID.EVM, WalletID.TALISMAN],
  addressType: "evm",

  /**
   * Substrate
   */
  endpoint: "wss://pangolin-rpc.darwinia.network",
  parachainId: ParachainID.PANGOLIN,
};
