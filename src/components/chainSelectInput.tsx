"use clients";

import Image from "next/image";
import data from "../data/data.json";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTransfer } from "@/hooks";
import { getChainLogoSrc, parseCross } from "@/utils";
import { Asset, ChainConfig } from "@/types";

export interface chainType {
  name: string;
  logo: string;
}

export default function ChainSelectInput({ who, options }: { who: string; options: [any] }) {
  const { sourceChain, setSourceChain, sourceAsset, setTargetChain, setSourceAsset, targetChain } = useTransfer();
  const {
    defaultSourceChainOptions,
    defaultTargetChainOptions,
    availableTargetChainOptions,
    availableSourceAssetOptions,
    defaultSourceAssetOptions,
  } = parseCross();
  const [sourceChainOptions, _setSourceChainOptions] = useState(defaultSourceChainOptions);
  const [sourceAssetOptions, setSourceAssetOptions] = useState(defaultSourceAssetOptions);
  const [targetChainOptions, setTargetChainOptions] = useState(defaultTargetChainOptions);

  const targetChainRef = useRef(targetChain);
  const sourceAssetRef = useRef(sourceAsset);
  const sourceChainRef = useRef(sourceChain);

  const _setTargetChain = useCallback(
    (chain: ChainConfig | undefined) => {
      setTargetChain((prev) => chain ?? prev);
      targetChainRef.current = chain ?? targetChainRef.current;
    },
    [setTargetChain],
  );

  // useEffect(() => {
  //   const options = availableTargetChainOptions[sourceChain.network]?.[sourceAsset.symbol] || [];
  //   setTargetChainOptions(options);
  //   _setTargetChain(options.at(0));
  // }, [sourceChain, sourceAsset, _setTargetChain]);

  const _setSourceChain = useCallback(
    (chain: ChainConfig | undefined) => {
      setSourceChain((prev) => chain ?? prev);
      sourceChainRef.current = chain ?? sourceChainRef.current;
    },
    [setSourceChain],
  );

  // const _setSourceAsset = useCallback(
  //   (asset: Asset | undefined) => {
  //     setSourceAsset((prev) => asset ?? prev);
  //     sourceAssetRef.current = asset ?? sourceAssetRef.current;
  //   },
  //   [setSourceAsset],
  // );

  // useEffect(() => {
  //   const options = availableSourceAssetOptions[sourceChain.network] || [];
  //   setSourceAssetOptions(options);
  //   _setSourceAsset(options.at(0));
  // }, [sourceChain, _setSourceAsset]);
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div
      className="relative cursor-pointer"
      onClick={() => {
        setOpen(!open);
      }}
    >
      <div className="flex items-center justify-center gap-[5px]">
        <Image
          src={getChainLogoSrc(who === "sender" ? sourceChain.logo : targetChain.logo)}
          width={20}
          height={20}
          alt={who === "sender" ? sourceChain.name : targetChain.name}
        />
        <p className="text-[12px] leading-[15px]">{who === "sender" ? sourceChain.name : targetChain.name}</p>
        <span className="block h-[16px] w-[16px] bg-[url('/images/icons/downarrow-icon.svg')] bg-contain bg-center bg-no-repeat" />
      </div>
      {open && (
        <div className="absolute left-[-10px] right-[-10px] top-[calc(100%+10px)] z-10 flex h-fit flex-col gap-[10px] rounded-[10px] bg-white p-[10px] shadow-lg">
          {options.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-[5px]"
              onClick={who === "sender" ? () => _setSourceChain(item) : () => _setTargetChain(item)}
            >
              <Image src={getChainLogoSrc(item.logo)} width={20} height={20} alt={item.name} />
              <p className="text-[12px] leading-[15px]">{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
