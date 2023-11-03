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
          <Image width={16} height={16} alt="Chain logo" src={getChainLogoSrc(value.logo)} />
          <span>{value.name}</span>
        </div>
      }
      disabled={disabled}
      sameWidth
      childClassName="flex flex-col py-small"
    >
      {options?.length ? (
        options.map((chain) => (
          <button key={chain.network} onClick={() => onChange(chain)} className="flex items-center gap-small">
            <Image width={16} height={16} alt="Chain logo" src={getChainLogoSrc(chain.logo)} />
            <span>{chain.name}</span>
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
