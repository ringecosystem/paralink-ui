"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import data from "../data/data.json";
import WalletButton from "./walletButton";
import AccountButton from "./accountButton";
import ChainButton from "./chainButton";
import { useAccount, useChainId } from "wagmi";
import { useTalisman, useTransfer } from "@/hooks";
import { isValidAddress, parseCross } from "@/utils";
import WalletSelectionModal from "./walletSelectionModal";
import { WalletID } from "@/types";
import { getWallets } from "@talisman-connect/wallets";

export default function Header() {
  const [connectModal, setConnectModal] = useState(false);
  const [connected, setConnected] = useState(false);
  const { address: activeAddress } = useAccount();
  const { talismanAccounts, connectTalisman } = useTalisman();
  const { activeSenderWallet, setSender, sourceChain, sender } = useTransfer();
  const [switchWallet, setSwitchWallet] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    setConnectModal(false);
    setSwitchWallet(false);
  }, []);

  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handleOpenMenu = useCallback(() => {
    setShowMenu(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  const senderOptions =
    activeSenderWallet === WalletID.EVM && activeAddress
      ? [{ address: activeAddress }]
      : activeSenderWallet === WalletID.TALISMAN
      ? talismanAccounts
      : [];

  useEffect(() => {
    if ((activeAddress || talismanAccounts.length > 0) && activeSenderWallet) {
      setConnected(true);
      if (senderOptions.length > 0) {
        const address = senderOptions[0].address;
        const valid = address ? isValidAddress(address, sourceChain.addressType) : true;
        setSender({ valid, address });
      }
    } else {
      setConnected(false);
      setSender(undefined);
    }
  }, [activeAddress, talismanAccounts.length, activeSenderWallet]);

  return (
    <section className="flex h-[50px] w-full items-center justify-between px-[10px] lg:h-[56px] lg:px-[30px]">
      <div>
        <Link href="/">
          <Image src="/images/paralink-logo.svg" width={90} height={24} alt="Paralink logo" />
        </Link>
      </div>
      <div className="hidden items-center justify-center gap-[10px] lg:flex">
        {!connected ? (
          <div>
            <WalletButton openModal={() => setConnectModal(true)} />
          </div>
        ) : (
          <div>
            <AccountButton setSwitchWallet={setSwitchWallet} />
          </div>
        )}
        <div>
          <ChainButton />
        </div>
      </div>
      <div className="lg:hidden">
        <div className="flex flex-col items-center justify-center gap-[5px]" onClick={handleOpenMenu}>
          <span className="block h-[3px] w-[20px] bg-[#FF0083]" />
          <span className="block h-[3px] w-[20px] bg-[#FF0083]" />
          <span className="block h-[3px] w-[20px] bg-[#FF0083]" />
        </div>
        <div
          className="fixed left-0 top-0 h-[100vh] w-[100vw] bg-[rgba(0,0,0,0.4)]"
          style={{ opacity: showMenu ? 1 : 0, zIndex: showMenu ? 10 : "-1" }}
          onClick={handleCloseMenu}
        />
        <div
          className="absolute right-0 top-0 z-10 flex h-[100vh] w-[247px] flex-col gap-[10px] bg-[#F2F3F5] transition-transform duration-300"
          style={{ transform: showMenu ? "translateX(0)" : "translateX(100%)" }}
        >
          <div className="flex h-[50px] items-center justify-between px-[20px]">
            <p className="text-[14px] leading-[24px] text-[#121619]">MENU</p>
            <div className="relative h-[16px] w-[16px]" onClick={handleCloseMenu}>
              <span className="absolute bottom-0 top-0 m-auto h-[2px] w-[20px] rotate-[-45deg] bg-black" />
              <span className="absolute bottom-0 top-0 m-auto h-[2px] w-[20px] rotate-45 bg-black" />
              <span />
            </div>
          </div>
          <div className="flex flex-col items-center gap-[20px] pt-[20px]">
            <ChainButton />
            {!sender ? (
              <WalletButton
                openModal={() => {
                  handleCloseMenu();
                  setConnectModal(true);
                }}
              />
            ) : (
              <AccountButton setSwitchWallet={setSwitchWallet} />
            )}
          </div>
          <div className="mt-auto flex items-center justify-center gap-[10px]">
            {data.social.map((item: any) => (
              <Link key={item.name} href={item.url}>
                <span
                  className="block h-[24px] w-[24px] bg-contain bg-center bg-no-repeat"
                  style={{ background: `url(${item.icon})` }}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <WalletSelectionModal visible={connectModal || switchWallet} onClose={handleClose} switchWallet={switchWallet} />
    </section>
  );
}
