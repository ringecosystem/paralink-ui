import { Asset, Cross } from "@/types";
import Input from "@/ui/input";
import { BN, BN_ZERO, bnToBn } from "@polkadot/util";
import AssetSelect from "./asset-select";
import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatBalance } from "@/utils";
import { parseUnits } from "viem";
import { InputAlert } from "./input-alert";

interface Value {
  valid: boolean;
  input: string;
  amount: BN;
}

interface Props {
  value?: Value;
  disabled?: boolean;
  placeholder?: string;
  balance?: BN;
  cross?: Cross;
  asset?: Asset;
  assetSupply?: BN;
  assetLimit?: BN;
  assetOptions?: Asset[];
  onChange?: (value: Value) => void;
  onAssetChange?: (value: Asset) => void;
}

export default function BalanceInput({
  value,
  disabled,
  placeholder,
  balance,
  cross,
  asset,
  assetSupply,
  assetLimit,
  assetOptions,
  onChange = () => undefined,
  onAssetChange,
}: Props) {
  const assetRef = useRef(asset);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dynamicStyle, setDynamicStyle] = useState("");

  const _placeholder = useMemo(() => {
    if (balance && asset) {
      return `Balance ${formatBalance(balance, asset.decimals)}`;
    }
    return placeholder ?? "Enter an amount";
  }, [balance, asset, placeholder]);

  const min = useMemo(() => {
    if (cross && cross.fee.asset.native) {
      return cross.fee.amount;
    }
    return undefined;
  }, [cross]);

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.target.value) {
        if (!Number.isNaN(Number(e.target.value)) && asset) {
          onChange(parseValue(e.target.value, asset.decimals, min, balance, assetLimit, assetSupply));
        }
      } else {
        onChange({ valid: true, input: e.target.value, amount: BN_ZERO });
      }
    },
    [asset, min, balance, assetLimit, assetSupply, onChange],
  );

  useEffect(() => {
    // Fire onChange to update `amount`
    if (assetRef.current?.decimals !== asset?.decimals) {
      onChange(parseValue(value?.input || "", asset?.decimals || 0, min, balance, assetLimit, assetSupply));
    }
    assetRef.current = asset;
  }, [value, asset, min, balance, assetLimit, assetSupply, onChange]);

  useEffect(() => {
    const inputWidth = inputRef.current?.clientWidth || 1;
    const spanWidth = spanRef.current?.clientWidth || 0;
    const percent = (spanWidth / inputWidth) * 100;
    if (percent < 20) {
      setDynamicStyle("text-[2.25rem] font-light");
    } else if (percent < 30) {
      setDynamicStyle("text-[1.875rem] font-light");
    } else if (percent < 40) {
      setDynamicStyle("text-[1.5rem] font-normal");
    } else if (percent < 50) {
      setDynamicStyle("text-[1.25rem] font-normal");
    } else if (percent < 60) {
      setDynamicStyle("text-[1.125rem] font-medium");
    } else {
      setDynamicStyle("text-[1rem] font-medium");
    }
  }, [value]);

  const insufficient = balance && value?.input && balance.lt(value.amount) ? true : false;
  const requireMin = min && value?.input && value.amount.lt(min) ? true : false;
  const requireLimit = isExcess(assetLimit, assetSupply, value?.amount);

  return (
    <div
      className={`border-radius relative flex h-12 items-center justify-between border p-1 transition-colors ${
        value?.valid === false ? "border-alert" : "border-transparent"
      }`}
    >
      <Input
        disabled={disabled}
        placeholder={_placeholder}
        className={`h-full w-full bg-transparent px-1 transition-[font-weight,font-size,line-height] duration-300 ${
          value?.input ? `leading-none ${dynamicStyle}` : ""
        }`}
        ref={inputRef}
        value={value?.input}
        onChange={handleInputChange}
      />
      {asset ? <AssetSelect disabled={disabled} value={asset} options={assetOptions} onChange={onAssetChange} /> : null}

      {/* Alert */}
      {requireLimit ? (
        <InputAlert
          text={`* Limit: ${formatBalance(assetLimit ?? BN_ZERO, asset?.decimals ?? 0)}, supply: ${formatBalance(
            (assetSupply ?? BN_ZERO).add(value?.amount ?? BN_ZERO),
            asset?.decimals ?? 0,
          )}`}
        />
      ) : requireMin ? (
        <InputAlert text={`* Minimum: ${formatBalance(min ?? BN_ZERO, asset?.decimals ?? 0)}`} />
      ) : insufficient ? (
        <InputAlert text="* Insufficient" />
      ) : null}

      {/*  Invisible */}
      <span className="invisible fixed left-0 top-0 -z-50" ref={spanRef}>
        {value?.input}
      </span>
    </div>
  );
}

function parseValue(origin: string, decimals: number, min?: BN, max?: BN, limit?: BN, supply?: BN) {
  let input = "";
  let amount = BN_ZERO;
  const [i, d] = origin.split(".").concat("-1");
  if (i) {
    input = d === "-1" ? i : d ? `${i}.${d.slice(0, decimals)}` : `${i}.`;
    amount = bnToBn(parseUnits(input, decimals));
  }
  const valid =
    min && amount.lt(min) ? false : max && amount.gt(max) ? false : isExcess(limit, supply, amount) ? false : true;
  return { input, amount, valid };
}

function isExcess(limit?: BN, supply?: BN, amount = BN_ZERO) {
  return limit && supply && supply.add(amount).gt(limit) ? true : false;
}
