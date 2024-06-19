import { BaseBridge } from "@/libs";
import { bnToBn } from "@polkadot/util";
import { parseUnits } from "viem";

export function getChainLogoSrc(fileName: string) {
  return `/images/network/${fileName}`;
}

export function getAssetIconSrc(fileName: string) {
  return `/images/asset/${fileName}`;
}

export async function isExceedingCrossChainLimit(bridge: BaseBridge, acrossAmount = "0") {
  const { amount: limit, currency } = await bridge.getAssetLimitOnTargetChain();
  const { amount: supply } = await bridge.getTargetAssetSupply();

  const amount = bnToBn(parseUnits(acrossAmount, currency.decimals)); // We use the decimals on the target chain
  return supply.add(amount).gt(limit);
}
