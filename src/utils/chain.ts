import { assethubPolkadotChain, assethubRococoChain, darwiniaChain, pangolinChain } from "@/config/chains";
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
  }
}

export function getChainsConfig() {
  return [assethubPolkadotChain, darwiniaChain];
}
