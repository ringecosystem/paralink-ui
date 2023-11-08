import { EvmBridge } from "@/libs";
import { BN_ZERO } from "@polkadot/util";

export function getChainLogoSrc(fileName: string) {
  return `/images/network/${fileName}`;
}

export function getAssetIconSrc(fileName: string) {
  return `/images/asset/${fileName}`;
}

export async function isAssetExcess(bridge: EvmBridge, amount = BN_ZERO) {
  const limit = await bridge.getAssetLimit();
  if (limit) {
    const details = await bridge.getTargetAssetDetails();
    return (details?.supply ?? BN_ZERO).add(amount).gt(limit);
  }
  return false;
}
