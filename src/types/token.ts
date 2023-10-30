export type TokenSymbol = "ROC" | "USDT" | "PRING" | "AHUSDT";

export interface Token {
  icon: string; // File name
  name: string;
  symbol: TokenSymbol;
  decimals: number;
}

export interface EVMToken extends Token {}

export interface SubstrateToken extends Token {}

export interface Asset extends Token {
  id: number;
}
