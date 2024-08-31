import { useCallback, useEffect, useRef, useState } from "react";
import WalletSelectionModal from "./walletSelectionModal";
import { useTransfer } from "@/hooks";
import { getChainLogoSrc, parseCross } from "@/utils";
import { ChainConfig } from "@/types";
import Image from "next/image";
import data from "../data/data.json";

export default function WalletButton({ openModal }: { openModal: () => void }) {
  const [subMenu, setSubMenu] = useState<boolean>(false);
  const [tab, setTab] = useState<string>("evm");
  const { sourceChain, setSourceChain } = useTransfer();
  const { defaultSourceChainOptions } = parseCross();
  const [sourceChainOptions, _setSourceChainOptions] = useState<any[]>([...defaultSourceChainOptions]);

  const sourceChainRef = useRef(sourceChain);

  const _setSourceChain = useCallback(
    (chain: ChainConfig | undefined) => {
      setSourceChain((prev) => chain ?? prev);
      sourceChainRef.current = chain ?? sourceChainRef.current;
    },
    [setSourceChain],
  );

  const handleToggleSubMenu = useCallback(() => {
    setSubMenu(!subMenu);
  }, [subMenu]);

  useEffect(() => {
    window.addEventListener("click", () => {
      console.log("hi");
      setSubMenu(false);
    });
  }, []);

  console.log(subMenu);
  return (
    <div className="relative">
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleToggleSubMenu();
        }}
        className="flex h-[36px] w-[190px] cursor-pointer items-center gap-[5px] rounded-[10px] bg-white px-[10px] hover:shadow-lg lg:w-fit lg:justify-center"
      >
        <span className="block h-[19px] w-[19px] bg-[url('/images/icons/wallet-icon.svg')] bg-contain bg-center bg-no-repeat" />
        <p className="text-[14px] leading-[24px]">Connect Wallet</p>
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{ maxHeight: subMenu ? "100vh" : "0" }}
        className="absolute right-0 top-[calc(100%+20px)] z-50 flex h-fit w-[500px] flex-col gap-[40px] overflow-hidden rounded-[10px] bg-white duration-700"
      >
        <div className=" flex w-full flex-wrap gap-[20px] bg-white p-[20px]">
          {sourceChainOptions.map((chain) => (
            <div
              key={chain.name}
              className="flex h-[40px] w-[45%] items-center justify-start gap-[10px] rounded-[10px] border-[1px] border-solid border-gray-400 p-[5px_10px]"
              style={{ opacity: chain.id ? 1 : 0.6, cursor: chain.id ? "pointer" : "default" }}
              onClick={() => {
                if (chain.id !== undefined) {
                  _setSourceChain(chain);
                  setSubMenu(false);
                }
              }}
            >
              <Image src={getChainLogoSrc(chain.logo)} width={24} height={24} alt={chain.name} />
              <p className="flex-shrink-0 whitespace-nowrap text-[14px] leading-[24px] text-[#121619]">
                {chain.name.includes("Polkadot") ? chain.name.replace(" AssetHub", "") : chain.name}
              </p>
            </div>
          ))}
        </div>
        <div className="relative flex flex-col items-center">
          <div className="border-b-solid flex w-full items-center justify-center border-b-[1px] border-b-[#ff0083]">
            <div
              onClick={() => {
                setTab("evm");
              }}
              className="-mb-[1px] w-[150px] cursor-pointer rounded-[10px_10px_0_0] p-[10px] text-center"
              style={{
                borderTop: tab === "evm" ? "1px solid #FF0083" : "none",
                borderRight: tab === "evm" ? "1px solid #FF0083" : "none",
                borderLeft: tab === "evm" ? "1px solid #FF0083" : "none",
                borderBottom: "none",
                backgroundColor: tab === "evm" ? "white" : "transparent",
              }}
            >
              EVM wallet
            </div>
            <div
              onClick={() => {
                setTab("substrate");
              }}
              className="-mb-[1px] w-[150px] cursor-pointer rounded-[10px_10px_0_0] p-[10px] text-center"
              style={{
                borderBottom: "none",
                borderTop: tab === "substrate" ? "1px solid #FF0083" : "none",
                borderRight: tab === "substrate" ? "1px solid #FF0083" : "none",
                borderLeft: tab === "substrate" ? "1px solid #FF0083" : "none",
                backgroundColor: tab === "substrate" ? "#fff" : "transparent",
              }}
            >
              Substrate wallet
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-[20px] p-[20px] pt-[40px]">
            {data.wallets[tab === "evm" ? "evm" : "substrate"].map((item: any) => (
              <div
                key={item.name}
                className="flex h-[40px] w-[45%] items-center justify-start gap-[10px] rounded-[10px] border-[1px] border-solid border-gray-400 p-[5px_10px]"
              >
                <Image
                  src={`/images/wallet/${item.logo}`}
                  width={18}
                  height={18}
                  alt={item.name}
                  className="rounded-full"
                />
                <p>{item.name}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-[5px] p-[20px]">
          <h4>Accounts</h4>
          <div className="h-[45px] w-full rounded-[10px] border-[1px] border-solid border-gray-400"></div>
        </div>
      </div>
    </div>
  );
}
