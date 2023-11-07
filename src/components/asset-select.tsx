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
        <div className="flex items-center gap-small truncate">
          <Image width={16} height={16} alt="Asset icon" src={getAssetIconSrc(value.icon)} />
          <span>{value.symbol}</span>
        </div>
      }
      disabled={disabled}
      sameWidth
      labelClassName="flex items-center gap-middle shrink-0 w-28 justify-between bg-component h-full border-radius px-1 hover:opacity-80 transition-[transform,color] active:translate-y-1 disabled:translate-y-0 disabled:opacity-100 disabled:cursor-not-allowed"
      childClassName="flex flex-col py-middle bg-component border-primary border border-radius"
    >
      {options?.length ? (
        options.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => onChange(asset)}
            className="flex items-center gap-small px-middle py-small transition-colors hover:bg-white/10"
          >
            <Image width={16} height={16} alt="Asset icon" src={getAssetIconSrc(asset.icon)} />
            <span className="text-sm font-medium">{asset.symbol}</span>
          </button>
        ))
      ) : (
        <div className="px-middle py-small">
          <span className="text-sm font-medium">No data</span>
        </div>
      )}
    </Select>
  );
}
