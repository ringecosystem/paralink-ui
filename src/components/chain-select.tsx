import { ChainConfig } from "@/types";
import Select from "@/ui/select";
import { getChainLogoSrc } from "@/utils";
import Image from "next/image";

interface Props {
  value: ChainConfig;
  options?: ChainConfig[];
  disabled?: boolean;
  onChange?: (value: ChainConfig) => void;
}

export default function ChainSelect({ value, options, disabled, onChange = () => undefined }: Props) {
  return (
    <Select
      label={
        <div className="flex items-center gap-small">
          <Image width={18} height={18} alt="Chain logo" src={getChainLogoSrc(value.logo)} />
          <span className="text-white/50">{value.name}</span>
        </div>
      }
      disabled={disabled}
      sameWidth
      labelClassName="flex items-center gap-middle py-[2px] px-[6px] bg-transparent hover:bg-white/10 border-radius"
      childClassName="flex flex-col py-middle bg-component border-primary border border-radius"
      arrowClassName="opacity-50"
    >
      {options?.length ? (
        options.map((chain) => (
          <button
            key={chain.network}
            onClick={() => onChange(chain)}
            className="flex items-center gap-small px-middle py-1 transition-colors hover:bg-white/10"
          >
            <Image width={16} height={16} alt="Chain logo" src={getChainLogoSrc(chain.logo)} />
            <span>{chain.name}</span>
          </button>
        ))
      ) : (
        <div className="px-middle py-small">
          <span>No data</span>
        </div>
      )}
    </Select>
  );
}
