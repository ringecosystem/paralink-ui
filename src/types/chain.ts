import { Chain } from "wagmi";
import { Asset } from "./asset";
import { AddressType } from "./misc";
import { WalletID } from ".";
import { BN } from "@polkadot/util";

export enum ChainID {
  INVALID = -1,
  PANGOLIN = 43,
  DARWINIA = 46,
  HYDRADX = 222222,
}

export enum ParachainID {
  ASSETHUB_ROCOCO = 1000,
  ASSETHUB_POLKADOT = 1000,
  PANGOLIN = 2105,
  DARWINIA = 2046,
  HYDRADX = 2034,
}

export type Network = "pangolin" | "darwinia" | "assethub-rococo" | "assethub-polkadot" | "hydradx";

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

  /**
   * Substrate
   */
  endpoint: string;
  parachainId: ParachainID;
  existential?: {
    minBalance: BN;
  };
}
