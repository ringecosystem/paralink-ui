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
      cross: [
        {
          isReserve: false,
          target: { network: "assethub-rococo", symbol: "USDT" },
          fee: { amount: bnToBn(3600000), asset: { id: 7777, decimals: 6, symbol: "USDT", srcSymbol: "ahUSDT" } }, // 3.6 USDT
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
  endpoint: "wss://pangolin-rpc.darwinia.network",
  parachainId: ParachainID.PANGOLIN,
};
