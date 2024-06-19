import { Cross } from "./cross";

export type AssetSymbol = "DOT" | "ROC" | "USDT" | "PRING" | "ahUSDT" | "PINK" | "ahPINK" | "RING" | "HDX";

export enum AssetID {
  SYSTEM = -1,
}

export interface Asset {
  icon: string; // File name
  id: number | AssetID.SYSTEM; // The GeneralIndex of assets issued on the Assethub uses this id value
  name: string;
  symbol: AssetSymbol;
  decimals: number;
  cross: Cross[];

  // Defines where the asset is issued
  origin: {
    id: number | AssetID.SYSTEM;
    parachainId: number; // Indicates on which chain the token is issued
    palletInstance: number; // Use the pallet instance of the chain where the asset is issued
  };
}
