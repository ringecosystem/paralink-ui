import { Chain } from "wagmi";
import { EVMToken } from ".";

export enum EVMChainID {
  PANGOLIN = 43,
}

export type EVMNetwork = "pangolin";

export interface ChainConfig {
  logo: string; // File name
}

export interface EVMChainConfig extends ChainConfig, Chain {
  id: EVMChainID;
  network: EVMNetwork;
  nativeCurrency: Pick<EVMToken, "name" | "symbol" | "decimals">;
}

export interface SubstrateChainConfig extends ChainConfig {
  endpoint: string;
  explorer: {
    name: string;
    url: string;
  };
}
