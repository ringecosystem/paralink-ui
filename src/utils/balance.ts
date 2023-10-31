import { BN, formatBalance as formatUnits } from "@polkadot/util";

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
