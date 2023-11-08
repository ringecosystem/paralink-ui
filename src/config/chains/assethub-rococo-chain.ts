import { ChainConfig, ChainID, WalletID } from "@/types";
import { bnToBn } from "@polkadot/util";

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
  logo: "asset-hub.svg",
  assets: [
    {
      icon: "usdt.svg",
      id: 7777,
      name: "Tether USD Test",
      symbol: "USDT",
      decimals: 6,
      cross: [{ target: { network: "pangolin", symbol: "ahUSDT" }, isReserve: true }],
    },
  ],
  wallets: [WalletID.TALISMAN],
  addressType: "substrate",
  minCross: bnToBn(125000), // 0.125 USDT

  /**
   * Substrate
   */
  endpoint: "wss://rococo-asset-hub-rpc.polkadot.io",
  parachainId: 1000,
};
