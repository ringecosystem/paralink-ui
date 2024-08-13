"use clients";

import Image from "next/image";
import data from "../data/data.json";
import { useCallback, useRef, useState } from "react";
import { useTransfer } from "@/hooks";
import { getChainLogoSrc, parseCross } from "@/utils";
import { ChainConfig } from "@/types";

export interface chainType {
  name: string;
  logo: string;
}

export default function ChainSelectInput() {
  const { sourceChain, setSourceChain } = useTransfer();
  const { defaultSourceChainOptions } = parseCross();
  const [sourceChainOptions, _setSourceChainOptions] = useState(defaultSourceChainOptions);

  const sourceChainRef = useRef(sourceChain);

  const _setSourceChain = useCallback(
    (chain: ChainConfig | undefined) => {
      setSourceChain((prev) => chain ?? prev);
      sourceChainRef.current = chain ?? sourceChainRef.current;
    },
    [setSourceChain],
  );
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div
      className="relative cursor-pointer"
      onClick={() => {
        setOpen(!open);
      }}
    >
      <div className="flex items-center justify-center gap-[5px]">
        <Image src={getChainLogoSrc(sourceChain.logo)} width={20} height={20} alt={sourceChain.name} />
        <p className="text-[12px] leading-[15px]">{sourceChain.name}</p>
        <span className="block h-[16px] w-[16px] bg-[url('/images/icons/downarrow-icon.svg')] bg-contain bg-center bg-no-repeat" />
      </div>
      {open && (
        <div className="absolute left-[-10px] right-[-10px] top-[calc(100%+10px)] z-10 flex h-fit flex-col gap-[10px] rounded-[10px] bg-white p-[10px] shadow-lg">
          {sourceChainOptions.map((item) => (
            <div key={item.name} className="flex items-center gap-[5px]" onClick={() => _setSourceChain(item)}>
              <Image src={getChainLogoSrc(item.logo)} width={20} height={20} alt={item.name} />
              <p className="text-[12px] leading-[15px]">{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
