import { assethubPolkadotChain, darwiniaChain } from "@/config/chains";
import { AvailableSourceAssetOptions, AvailableTargetAssetOptions, AvailableTargetChainOptions } from "@/types";
import { getChainConfig, getChainsConfig } from ".";

let defaultSourceChain = assethubPolkadotChain;
let defaultTargetChain = darwiniaChain;

let defaultSourceAsset = defaultSourceChain.assets[0];
let defaultTargetAsset = defaultTargetChain.assets[0];

let defaultSourceChainOptions = [defaultSourceChain, defaultTargetChain];
let defaultTargetChainOptions = [defaultTargetChain];

let defaultSourceAssetOptions = [defaultSourceAsset];
let defaultTargetAssetOptions = [defaultTargetAsset];

let availableSourceAssetOptions: AvailableSourceAssetOptions = {};
let availableTargetChainOptions: AvailableTargetChainOptions = {};
let availableTargetAssetOptions: AvailableTargetAssetOptions = {};

getChainsConfig().forEach(({ assets, ...sourceChain }) => {
  assets.forEach((sourceAsset) => {
    sourceAsset.cross.forEach((cross) => {
      const targetChain = getChainConfig(cross.target.network);
      const targetAsset = targetChain?.assets.find((a) => a.symbol === cross.target.symbol);

      if (targetChain && targetAsset) {
        availableSourceAssetOptions = {
          ...availableSourceAssetOptions,
          [sourceChain.network]: (availableSourceAssetOptions[sourceChain.network] || []).concat(sourceAsset),
        };

        availableTargetChainOptions = {
          ...availableTargetChainOptions,
          [sourceChain.network]: {
            ...availableTargetChainOptions[sourceChain.network],
            [sourceAsset.symbol]: (availableTargetChainOptions[sourceChain.network]?.[sourceAsset.symbol] || []).concat(
              targetChain,
            ),
          },
        };

        availableTargetAssetOptions = {
          ...availableTargetAssetOptions,
          [sourceChain.network]: {
            ...availableTargetAssetOptions[sourceChain.network],
            [sourceAsset.symbol]: {
              ...availableTargetAssetOptions[sourceChain.network]?.[sourceAsset.symbol],
              [targetChain.network]: (
                availableTargetAssetOptions[sourceChain.network]?.[sourceAsset.symbol]?.[targetChain.network] || []
              ).concat(targetAsset),
            },
          },
        };
      }
    });
  });
});

export function parseCross() {
  return {
    defaultSourceChain,
    defaultTargetChain,
    defaultSourceAsset,
    defaultTargetAsset,
    defaultSourceChainOptions,
    defaultTargetChainOptions,
    defaultSourceAssetOptions,
    defaultTargetAssetOptions,
    availableSourceAssetOptions,
    availableTargetChainOptions,
    availableTargetAssetOptions,
  };
}
