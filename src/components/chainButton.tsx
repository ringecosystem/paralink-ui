import { useCallback, useRef, useState } from "react";
import data from "../data/data.json";
import Image from "next/image";
import { useTransfer } from "@/hooks";
import { getChainLogoSrc, parseCross } from "@/utils";
import { Asset, ChainConfig, WalletID } from "@/types";

export default function ChainButton() {
  const { sourceChain, setSourceChain } = useTransfer();
  const { defaultSourceChainOptions } = parseCross();
  const [sourceChainOptions, _setSourceChainOptions] = useState(defaultSourceChainOptions);

  console.log("source chain", sourceChain);

  const sourceChainRef = useRef(sourceChain);

  const _setSourceChain = useCallback(
    (chain: ChainConfig | undefined) => {
      setSourceChain((prev) => chain ?? prev);
      sourceChainRef.current = chain ?? sourceChainRef.current;
    },
    [setSourceChain],
  );

  const [subMenu, setSubMenu] = useState<boolean>(false);
  const handleToggleSubMenu = useCallback(() => {
    setSubMenu((prev) => !prev);
  }, []);
  return (
    <div className="relative">
      <div
        className="flex h-[36px] w-fit cursor-pointer items-center justify-center gap-[5px] rounded-[10px] bg-white px-[10px] duration-300 hover:shadow-lg"
        onClick={handleToggleSubMenu}
      >
        <span className="block h-[24px] w-[24px] bg-[url('/images/icons/assethub-icon.svg')] bg-contain bg-center bg-no-repeat" />
        <span className="block h-[16px] w-[16px] bg-[url('/images/icons/downarrow-icon.svg')] bg-contain bg-center bg-no-repeat" />
      </div>
      {subMenu && (
        <div className="absolute right-[-21px] top-[calc(100%+20px)] flex w-[200px] flex-col gap-[20px] rounded-[10px] bg-white p-[20px]">
          {sourceChainOptions.map((chain) => (
            <div
              key={chain.name}
              className="flex cursor-pointer items-center justify-start gap-[10px]"
              onClick={() => {
                _setSourceChain(chain);
                setSubMenu(false);
              }}
            >
              <Image src={getChainLogoSrc(chain.logo)} width={24} height={24} alt={chain.name} />
              <p className="flex-shrink-0 whitespace-nowrap text-[14px] leading-[24px] text-[#121619]">{chain.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
