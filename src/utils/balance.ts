import { Asset } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { BN, BN_ZERO, formatBalance as formatUnits } from "@polkadot/util";

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

export function formatBalance(value: BN, decimals = 18, options?: { precision?: number; keepZero?: boolean }) {
  const precision = options?.precision ?? 3;
  const keepZero = options?.keepZero ?? false;

  const [i, d] = formatUnits(value, { decimals, forceUnit: "Unit", withAll: true, withUnit: false }).split(".");
  const _integers = i;
  let _decimals = Number(`0.${d || 0}`).toFixed(precision);

  if (!keepZero) {
    _decimals = Number(_decimals).toString();
  }
  return `${_integers}${_decimals.slice(1)}`;
}
