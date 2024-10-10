import { darwiniaChain, hydradxChain } from "@/config/chains";
import {
  Asset,
  AssetCategory,
  AvailableSourceAssetOptions,
  AvailableTargetAssetOptions,
  AvailableTargetChainOptions,
  ChainConfig,
} from "@/types";
import { getChainConfig, getChainsConfig } from ".";

let defaultSourceChain = darwiniaChain;
let defaultTargetChain = hydradxChain;

let defaultSourceAsset = defaultSourceChain.assets[0];
let defaultTargetAsset = defaultTargetChain.assets[0];

let defaultSourceChainOptions = getChainsConfig();
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

export function getAvailableSourceChainOptions(assetCategory: AssetCategory) {
  return getChainsConfig().filter((chain) => chain.assets.some((asset) => asset.category === assetCategory));
}

export function getAvailableSourceChain(availableSourceChainOptions: ChainConfig[]) {
  return availableSourceChainOptions[0];
}

export function getAvailableSourceAsset(availableSourceChain: ChainConfig, assetCategory: AssetCategory) {
  return availableSourceChain.assets.find((asset) => asset.category === assetCategory)!;
}

export function getAvailableTargetChainOptions(availableSourceAsset: Asset) {
  return availableSourceAsset.cross.map((cross) => getChainConfig(cross.target.network)!);
}

export function getAvailableTargetChain(availableTargetChainOptions: ChainConfig[]) {
  return availableTargetChainOptions[0];
}

export function getAvailableTargetAsset(availableTargetChain: ChainConfig, assetCategory: AssetCategory) {
  return availableTargetChain.assets.find((asset) => asset.category === assetCategory)!;
}
