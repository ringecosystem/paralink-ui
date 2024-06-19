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
      origin: {
        parachainId: ParachainID.ASSETHUB_ROCOCO,
        palletInstance: 50,
        id: 7777,
      },
      cross: [
        {
          target: { network: "pangolin", symbol: "ahUSDT" },
          fee: {
            amount: bnToBn(125000),
            asset: {
              local: { id: 7777 },
              origin: {
                parachainId: ParachainID.ASSETHUB_ROCOCO,
                palletInstance: 50,
                id: 7777,
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
  endpoint: "wss://rococo-asset-hub-rpc.polkadot.io",
  parachainId: ParachainID.ASSETHUB_ROCOCO,
};
