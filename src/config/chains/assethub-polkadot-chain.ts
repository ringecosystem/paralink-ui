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
      origin: {
        parachainId: ParachainID.ASSETHUB_POLKADOT,
        palletInstance: 50,
        id: 1984,
      },
      cross: [
        {
          target: { network: "darwinia", symbol: "ahUSDT" },
          fee: {
            amount: bnToBn(20000),
            asset: {
              local: { id: 1984 },
              origin: {
                parachainId: ParachainID.ASSETHUB_POLKADOT,
                palletInstance: 50,
                id: 1984,
              },
            },
          },
          section: "polkadotXcm",
          method: "limitedReserveTransferAssets",
        },
      ],
    },
    {
      icon: "pink.jpg",
      id: 23,
      name: "PINK",
      symbol: "PINK",
      decimals: 10,
      origin: {
        parachainId: ParachainID.ASSETHUB_POLKADOT,
        palletInstance: 50,
        id: 23,
      },
      cross: [
        {
          target: { network: "darwinia", symbol: "ahPINK" },
          fee: {
            amount: bnToBn(20000),
            asset: {
              local: { id: 1984 },
              origin: {
                parachainId: ParachainID.ASSETHUB_POLKADOT,
                palletInstance: 50,
                id: 1984,
              },
            },
          },
          section: "polkadotXcm",
          method: "limitedReserveTransferAssets",
        },
      ],
    },
    {
      icon: "dot.svg",
      id: 23,
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
          target: { network: "darwinia", symbol: "DOT" },
          fee: {
            amount: bnToBn(20000),
            asset: {
              local: { id: 1984 },
              origin: {
                parachainId: ParachainID.ASSETHUB_POLKADOT,
                palletInstance: 50,
                id: 1984,
              },
            },
          },
          section: "polkadotXcm",
          method: "limitedReserveTransferAssets",
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
  existential: { minBalance: bnToBn("500000000") }, // 0.05 DOT
};
