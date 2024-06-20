import { Asset, AssetSymbol, ChainConfig, Network } from ".";
import { BN } from "@polkadot/util";

export interface Cross {
  target: {
    network: Network;
    symbol: AssetSymbol;
  };

  // If the fee is paid in RING and the fee is 0.5RING, then if the cross-chain transaction
  // is 10RING, the target chain will receive 9.5RING.
  fee: {
    amount: BN;
    asset: { local: { id: number }; origin: { id: number; parachainId: number; palletInstance: number } };
  };

  section: string;
  method: string;
}

export type AvailableSourceAssetOptions = {
  [sourceChain in Network]?: Asset[];
};

export type AvailableTargetChainOptions = {
  [sourceChain in Network]?: {
    [sourceAsset in AssetSymbol]?: ChainConfig[];
  };
};

export type AvailableTargetAssetOptions = {
  [sourceChain in Network]?: {
    [sourceAsset in AssetSymbol]?: {
      [targetChain in Network]?: Asset[];
    };
  };
};
