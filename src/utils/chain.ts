import {
  assethubPolkadotChain,
  assethubRococoChain,
  darwiniaChain,
  hydradxChain,
  pangolinChain,
} from "@/config/chains";
import { ChainID, Network } from "@/types";

export function getChainConfig(chainIdOrNetwork: ChainID | Network | undefined) {
  switch (chainIdOrNetwork) {
    case ChainID.PANGOLIN:
    case "pangolin":
      return pangolinChain;
    case "assethub-rococo":
      return assethubRococoChain;
    case ChainID.DARWINIA:
    case "darwinia":
      return darwiniaChain;
    case "assethub-polkadot":
      return assethubPolkadotChain;
    case ChainID.HYDRADX:
    case "hydradx":
      return hydradxChain;
  }
}

export function getChainsConfig() {
  return [hydradxChain, darwiniaChain, assethubPolkadotChain];
}
