import { Asset, AssetSymbol, ChainConfig, Network } from ".";
import { BN } from "@polkadot/util";

export interface Cross {
  target: {
    network: Network;
    symbol: AssetSymbol;
  };
  isReserve: boolean;
  fee: { amount: BN; asset: { id: number; decimals: number; symbol: AssetSymbol; srcSymbol: AssetSymbol } };
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
