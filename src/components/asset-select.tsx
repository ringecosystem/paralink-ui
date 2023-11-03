import { Asset } from "@/types";
import Select from "@/ui/select";
import { getAssetIconSrc } from "@/utils";
import Image from "next/image";

interface Props {
  value: Asset;
  options?: Asset[];
  disabled?: boolean;
  onChange?: (value: Asset) => void;
}

export default function AssetSelect({ value, options, disabled, onChange = () => undefined }: Props) {
  return (
    <Select
      label={
        <div className="flex items-center gap-small">
          <Image width={16} height={16} alt="Asset icon" src={getAssetIconSrc(value.icon)} />
          <span>{value.symbol}</span>
        </div>
      }
      disabled={disabled}
      sameWidth
      childClassName="flex flex-col py-small"
    >
      {options?.length ? (
        options.map((asset) => (
          <button key={asset.symbol} onClick={() => onChange(asset)} className="flex items-center gap-small">
            <Image width={16} height={16} alt="Asset icon" src={getAssetIconSrc(asset.icon)} />
            <span>{asset.symbol}</span>
          </button>
        ))
      ) : (
        <div>
          <span>No data</span>
        </div>
      )}
    </Select>
  );
}
