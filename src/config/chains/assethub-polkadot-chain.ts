import { ChainConfig, ChainID, ParachainID, WalletID } from "@/types";
import { bnToBn } from "@polkadot/util";

export const assethubPolkadotChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.INVALID,
  network: "assethub-polkadot",
  name: "Polkadot AssetHub",
  nativeCurrency: {
    name: "DOT",
    symbol: "DOT",
    decimals: 10,
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
      url: "https://assethub-polkadot.subscan.io",
    },
  },

  /**
   * Custom
   */
  logo: "asset-hub.svg",
  assets: [
    {
      icon: "usdt.svg",
      id: 1984,
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      cross: [
        {
          isReserve: true,
          target: { network: "darwinia", symbol: "ahUSDT" },
          fee: { amount: bnToBn(20000), asset: { id: 1027, decimals: 6, symbol: "ahUSDT", srcSymbol: "USDT" } }, // 0.02 USDT
        },
      ],
    },
    {
      icon: "pink.jpg",
      id: 23,
      name: "PINK",
      symbol: "PINK",
      decimals: 10,
      cross: [
        {
          isReserve: true,
          target: { network: "darwinia", symbol: "ahPINK" },
          fee: { amount: bnToBn(20000), asset: { id: 1027, decimals: 6, symbol: "ahUSDT", srcSymbol: "USDT" } }, // 0.02 USDT
        },
      ],
    },
  ],
  wallets: [WalletID.TALISMAN],
  addressType: "substrate",

  /**
   * Substrate
   */
  endpoint: "wss://polkadot-asset-hub-rpc.polkadot.io",
  parachainId: ParachainID.ASSETHUB_POLKADOT,
};
