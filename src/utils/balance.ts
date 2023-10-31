import { Asset } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { BN, BN_ZERO } from "@polkadot/util";

/**
 * Token decimals and symbol: api.rpc.system.properties
 */
export async function getNativeTokenBalance(api: ApiPromise, address: string) {
  const balancesAll = await api.derive.balances.all(address);
  const locked = balancesAll.lockedBalance;
  const transferrable = balancesAll.availableBalance;
  const total = balancesAll.freeBalance.add(balancesAll.reservedBalance);
  return { transferrable, locked, total };
}

/**
 * Token name, symbol and decimals: api.query.assets.metadata
 */
export async function getAssetBalance(api: ApiPromise, address: string, asset: Asset) {
  const assetOption = await api.query.assets.account(asset.id, address);
  if (assetOption.isSome) {
    const assetBalance = assetOption.unwrap().balance;
    return assetBalance as BN;
  }
  return BN_ZERO;
}
