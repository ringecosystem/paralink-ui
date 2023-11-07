import { Asset, AssetSymbol, ChainConfig, Network } from ".";

export interface Cross {
  target: {
    network: Network;
    symbol: AssetSymbol;
  };
  isReserve: boolean;
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
