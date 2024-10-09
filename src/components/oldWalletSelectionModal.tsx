"use client";

import { useTalisman, useTransfer } from "@/hooks";
import { WalletID } from "@/types";
import { isValidAddress } from "@/utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { useAccount } from "wagmi";

export default function WalletSelectionModal({
  visible,
  onClose,
  switchWallet,
}: {
  visible: boolean;
  onClose: () => void;
  switchWallet?: boolean;
}) {
  const { talismanAccounts, connectTalisman } = useTalisman();
  const { openConnectModal } = useConnectModal();

  const {
    sender,
    sourceChain,
    targetChain,
    activeSenderWallet,
    activeRecipientWallet,
    setSender,
    setActiveSenderAccount,
    setActiveRecipientAccount,
    setActiveSenderWallet,
    setActiveRecipientWallet,
  } = useTransfer();

  const { address } = useAccount();

  const [supportedWalletEvm, supportedWalletTalisman] = useMemo(() => {
    return [
      sourceChain.wallets.some((id) => id === WalletID.EVM),
      sourceChain.wallets.some((id) => id === WalletID.TALISMAN),
    ];
  }, [sourceChain.wallets]);

  const senderOptions =
    activeSenderWallet === WalletID.EVM && address
      ? [{ address }]
      : activeSenderWallet === WalletID.TALISMAN
      ? talismanAccounts
      : [];

  // useEffect(() => {
  //   if (activeSenderWallet) {
  //     const address = senderOptions[0].address;
  //     const valid = address ? isValidAddress(address, sourceChain.addressType) : true;
  //     setSender({ valid, address });
  //   }
  // }, [activeSenderWallet]);
  return (
    <>
      {visible && (
        <div className="fixed left-0 top-0 z-50 h-[100vh] w-[100vw]">
          <div className="flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.3)]" onClick={onClose}>
            <div className="flex h-[300px] w-[80vw] flex-col items-center justify-between gap-middle rounded-[20px] bg-white p-[20px] lg:w-[500px]">
              <h2 className="text-[20px] font-bold">
                {switchWallet
                  ? "The selected source chain is not supported by current wallet, please change you wallet"
                  : "Select a wallet Type"}
              </h2>
              <div className="flex w-full flex-col gap-middle">
                <button
                  className="border-radius flex w-full items-center gap-middle bg-[#F2F3F5] p-middle transition-colors duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!supportedWalletTalisman}
                  onClick={() => {
                    setActiveSenderWallet(WalletID.TALISMAN);
                    connectTalisman();
                    onClose();
                  }}
                >
                  <Image
                    width={20}
                    height={20}
                    alt="Wallet icon"
                    src={`/images/wallet/talisman-red.svg`}
                    className="rounded-full"
                  />
                  <span>Talisman</span>
                </button>
                <button
                  className="border-radius flex w-full items-center gap-middle bg-[#F2F3F5] p-middle transition-colors duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!supportedWalletEvm}
                  onClick={() => {
                    setActiveSenderWallet(WalletID.EVM);
                    openConnectModal?.();
                    onClose();
                  }}
                >
                  <Image
                    width={20}
                    height={20}
                    alt="Wallet icon"
                    src={`/images/wallet/evm.png`}
                    className="rounded-full"
                  />
                  <span>EVM wallets</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full  flex-shrink-0 rounded-[10px] bg-[#FF0083] p-middle text-[14px] leading-[24px] text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
