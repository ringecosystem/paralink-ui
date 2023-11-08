import { BN } from "@polkadot/util";
import { Chain } from "wagmi";
import { Asset } from "./asset";
import { AddressType } from "./misc";
import { WalletID } from ".";

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
  wallets: WalletID[]; // Supported wallets
  addressType: AddressType;
  minCross: BN; // Minimum transfer amount
  hasAssetLimit?: boolean;

  /**
   * Substrate
   */
  endpoint: string;
  parachainId: number;
}
