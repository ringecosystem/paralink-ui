import { SubstrateChainConfig } from "@/types";

export const assethubChain: SubstrateChainConfig = {
  logo: "", // TODO
  endpoint: "wss://rococo-asset-hub-rpc.polkadot.io",
  explorer: {
    name: "Subscan",
    url: "https://assethub-rococo.subscan.io",
  },
};
