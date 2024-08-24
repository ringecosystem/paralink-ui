import DisconnectButton from "./disconnetButton";
import data from "../data/data.json";
import Image from "next/image";
import { MouseEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useTalisman, useTransfer } from "@/hooks";
import { isValidAddress, parseCross, toShortAdrress, formatBalance, getAssetIconSrc } from "@/utils";
import { WalletID } from "@/types";

export default function AccountButton() {
  const { talismanAccounts } = useTalisman();

  const { address } = useAccount();
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetworkAsync } = useSwitchNetwork();

  const { defaultSourceAssetOptions } = parseCross();
  const {
    sender,
    sourceChain,
    targetChain,
    activeSenderWallet,
    activeRecipientWallet,
    setSender,
    activeSenderAccount,
    sourceAssetBalance,
    setActiveSenderAccount,
    setActiveRecipientAccount,
    setActiveSenderWallet,
    setActiveRecipientWallet,
  } = useTransfer();

  const [sourceAssetOptions, setSourceAssetOptions] = useState(defaultSourceAssetOptions);
  const [subMenu, setSubMenu] = useState(false);
  const handleToggleSubMenu = useCallback(() => {
    setSubMenu((prev) => !prev);
  }, []);

  const needSwitchNetwork = useMemo(
    () => activeSenderWallet === WalletID.EVM && chain && chain.id !== sourceChain.id,
    [chain, sourceChain, activeSenderWallet],
  );

  useEffect(() => {
    if (needSwitchNetwork) {
      switchNetworkAsync?.(sourceChain.id)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [sourceChain, chain, switchNetworkAsync]);

  const connectedAddress =
    activeSenderWallet === WalletID.TALISMAN
      ? talismanAccounts[0]?.address
      : activeSenderWallet === WalletID.EVM
      ? address
      : undefined;

  const walletIcon = activeSenderWallet === WalletID.EVM ? "evm.png" : "talisman-red.svg";

  return (
    <div className="relative">
      <div
        onClick={handleToggleSubMenu}
        className="relative flex h-[36px] w-fit cursor-pointer items-center justify-center gap-[5px] rounded-[10px] bg-white px-[10px] duration-300 hover:shadow-lg"
      >
        <Image width={16} height={16} alt="Wallet" src={`/images/wallet/${walletIcon}`} className="rounded-full" />

        <p className="text-[14px] leading-[24px]">{connectedAddress && toShortAdrress(connectedAddress.toString())}</p>
        <span className="block h-[16px] w-[16px] bg-[url('/images/icons/downarrow-icon.svg')] bg-contain bg-center bg-no-repeat" />
      </div>
      {subMenu && (
        <div className="absolute right-[-21px] top-[calc(100%+20px)] flex w-[290px] flex-col gap-[20px] rounded-[10px] bg-white p-[20px]">
          <div className="flex items-center gap-[10px]">
            <span className="block h-[30px] w-[30px] bg-[url('/images/icons/assethub-icon.svg')] bg-contain bg-center bg-no-repeat" />
            <p className="text-[16px] font-bold leading-[24px]">
              {connectedAddress && toShortAdrress(connectedAddress.toString())}
            </p>
            <span className="block h-[18px] w-[18px] bg-[url('/images/icons/copy-icon.svg')] bg-contain bg-center bg-no-repeat" />
          </div>
          <DisconnectButton />
          <span className="block h-[1px] w-full bg-[#1216191A]" />
          {sourceAssetOptions.map((token) => (
            <div key={token.name} className="flex items-center gap-[10px]">
              <Image src={getAssetIconSrc(token.icon)} width={30} height={30} alt={token.name} />
              <div className="flex flex-col ">
                <p className="text-[16px] leading-[21px] text-[#121619]"></p>
                <p className="text-[12px] leading-[16px] text-[#12161980]">{token.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
