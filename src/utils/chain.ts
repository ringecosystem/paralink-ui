import { assethubRococoChain, pangolinChain } from "@/config/chains";
import { ChainID, Network } from "@/types";

export function getChainConfig(chainIdOrNetwork: ChainID | Network | undefined) {
  switch (chainIdOrNetwork) {
    case ChainID.PANGOLIN:
    case "pangolin":
      return pangolinChain;
    case "assethub-rococo":
      return assethubRococoChain;
  }
}

export function getChainsConfig() {
  return [assethubRococoChain, pangolinChain];
}
