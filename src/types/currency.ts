import { AssetSymbol } from "./asset";

export interface Currency {
  symbol: AssetSymbol;
  name: string;
  decimals: number;
}
