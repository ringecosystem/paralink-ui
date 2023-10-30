export type AssetSymbol = "ROC" | "USDT" | "PRING" | "AHUSDT";

export interface Asset {
  icon: string; // File name
  id: number;
  name: string;
  symbol: AssetSymbol;
  decimals: number;
}
