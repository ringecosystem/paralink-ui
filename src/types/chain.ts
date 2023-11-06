import { Chain } from "wagmi";
import { Asset } from "./asset";

export enum ChainID {
  INVALID = -1,
  PANGOLIN = 43,
}

export type Network = "pangolin" | "assethub-rococo";

export interface ChainConfig extends Chain {
  /**
   * Chain
   */
  id: ChainID;
  network: Network;
  nativeCurrency: Pick<Asset, "name" | "symbol" | "decimals">;

  /**
   * Custom
   */
  logo: string; // File name
  assets: Asset[];

  /**
   * Substrate
   */
  endpoint: string;
  parachainId: number;
}
