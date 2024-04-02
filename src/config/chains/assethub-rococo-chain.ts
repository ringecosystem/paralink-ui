import { ChainConfig, ChainID, ParachainID, WalletID } from "@/types";
import { bnToBn } from "@polkadot/util";

export const assethubRococoChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.INVALID,
  network: "assethub-rococo",
  name: "Rococo AssetHub",
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
  logo: "asset-hub.svg",
  assets: [
    {
      icon: "usdt.svg",
      id: 7777,
      name: "Tether USD Test",
      symbol: "USDT",
      decimals: 6,
      cross: [
        {
          isReserve: true,
          target: { network: "pangolin", symbol: "ahUSDT" },
          fee: { amount: bnToBn(125000), asset: { id: 1027, decimals: 6, symbol: "ahUSDT", srcSymbol: "USDT" } }, // 0.125 USDT
        },
      ],
    },
  ],
  wallets: [WalletID.TALISMAN],
  addressType: "substrate",

  /**
   * Substrate
   */
  endpoint: "wss://rococo-asset-hub-rpc.polkadot.io",
  parachainId: ParachainID.ASSETHUB_ROCOCO,
};
