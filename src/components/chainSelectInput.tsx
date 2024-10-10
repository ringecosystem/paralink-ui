"use clients";

import Image from "next/image";
import { useState } from "react";
import { getChainLogoSrc } from "@/utils";
import { ChainConfig } from "@/types";

export default function ChainSelectInput({
  value,
  options,
  onSelect,
}: {
  value: ChainConfig;
  options: ChainConfig[];
  onSelect: (chain: ChainConfig) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => {
        setOpen((prev) => !prev);
      }}
    >
      <div className="flex items-center justify-center gap-[5px]">
        <Image src={getChainLogoSrc(value.logo)} width={20} height={20} alt={value.name} />
        <p className="text-[12px] leading-[15px]">{value.name}</p>
        <span className="block h-[16px] w-[16px] bg-[url('/images/icons/downarrow-icon.svg')] bg-contain bg-center bg-no-repeat" />
      </div>
      <div
        className="absolute left-0 right-0 top-[calc(100%+10px)] z-[300]  overflow-hidden rounded-[10px] bg-white shadow-xl duration-500"
        style={{ maxHeight: open ? "10vh" : "0" }}
      >
        <div className="relative flex h-fit w-full  flex-col gap-[10px] rounded-[10px] p-[10px]">
          {options.map((item) => (
            <div key={item.name} className="flex w-full items-center gap-[5px]" onClick={() => onSelect(item)}>
              <Image src={getChainLogoSrc(item.logo)} width={16} height={16} alt={item.name} />
              <p className="truncate whitespace-nowrap text-[12px] leading-[15px]">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
