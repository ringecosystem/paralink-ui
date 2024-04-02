import { Cross } from "./cross";

export type AssetSymbol = "DOT" | "ROC" | "USDT" | "PRING" | "ahUSDT" | "PINK" | "ahPINK" | "RING";

export interface Asset {
  icon: string; // File name
  id: number;
  name: string;
  symbol: AssetSymbol;
  decimals: number;
  cross: Cross[];
}
