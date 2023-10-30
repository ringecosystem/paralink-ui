import { AssetSymbol, Network, WalletID } from ".";

export interface Cross {
  target: {
    network: Network;
    symbol: AssetSymbol;
  };
  wallets: WalletID[];
}
