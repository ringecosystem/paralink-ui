import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTransfer } from "@/hooks";
import { getChainLogoSrc, parseCross } from "@/utils";
import { Asset, ChainConfig, WalletID } from "@/types";

export default function ChainButton() {
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

  const [subMenu, setSubMenu] = useState<boolean>(false);
  const handleToggleSubMenu = useCallback(() => {
    setSubMenu(!subMenu);
  }, [subMenu]);

  useEffect(() => {
    window.addEventListener("click", () => {
      console.log("hi");
      setSubMenu(false);
    });
  }, []);

  return (
    <div className="relative">
      <div
        className="flex h-[36px] w-[190px] cursor-pointer items-center gap-[5px] rounded-[10px] bg-white px-[10px] duration-300 hover:shadow-lg lg:w-fit lg:justify-center"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleSubMenu();
        }}
      >
        <Image src={getChainLogoSrc(sourceChain.logo)} width={24} height={24} alt={sourceChain.name} />
        <p className="lg:hidden">
          {sourceChain.name.includes("Polkadot") ? sourceChain.name.replace(" AssetHub", "") : sourceChain.name}
        </p>
        <span className="lg:ml-unset ml-auto block h-[16px] w-[16px] bg-[url('/images/icons/downarrow-icon.svg')] bg-contain bg-center bg-no-repeat" />
      </div>
      <div
        className="absolute left-[-5px] right-[-5px] top-[calc(100%+20px)] overflow-hidden rounded-[10px] shadow-lg duration-500 lg:left-[unset] lg:right-[-21px]"
        style={{ maxHeight: subMenu ? "30vh" : "0" }}
      >
        <div className=" flex w-[200px] flex-col gap-[20px] bg-white p-[20px]">
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
              <p className="flex-shrink-0 whitespace-nowrap text-[14px] leading-[24px] text-[#121619]">
                {chain.name.includes("Polkadot") ? chain.name.replace(" AssetHub", "") : chain.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
