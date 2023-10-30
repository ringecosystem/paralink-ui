import { AssetSymbol, Network } from ".";

export interface Cross {
  target: {
    network: Network;
    symbol: AssetSymbol;
  };
}
