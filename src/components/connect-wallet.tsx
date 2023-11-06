"use client";

import { useTalisman, useToggle, useTransfer } from "@/hooks";
import { WalletID } from "@/types";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import dynamic from "next/dynamic";
import Image from "next/image";
import { MouseEventHandler, PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { useAccount, useDisconnect } from "wagmi";

const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

interface Props {
  kind?: "component" | "primary";
}

export default function ConnectWallet({ kind = "component" }: Props) {
  const { state: isOpen, setTrue: setIsOpenTrue, setFalse: setIsOpenFalse } = useToggle(false);
  const { activeAccount, connectTalisman, disconnectTalisman } = useTalisman();
  const { disconnect: disconnectRainbow } = useDisconnect();
  const { address: activeAddress } = useAccount();
  const { bridgeInstance, activeWallet, setSender } = useTransfer();
  const { openConnectModal } = useConnectModal();

  const handleConnect = useCallback<MouseEventHandler<HTMLDivElement>>(
    (e) => {
      e.stopPropagation();
      setIsOpenTrue();
    },
    [setIsOpenTrue],
  );

  const handleDisconnect = useCallback<MouseEventHandler<HTMLDivElement>>(
    (e) => {
      e.stopPropagation();
      disconnectRainbow();
      disconnectTalisman();
      setSender(undefined);
    },
    [disconnectRainbow, disconnectTalisman, setSender],
  );

  const [supportedRainbow, supportedTalisman] = useMemo(() => {
    const crossInfo = bridgeInstance?.getCrossInfo();
    return [
      crossInfo?.wallets.some((id) => id === WalletID.RAINBOW),
      crossInfo?.wallets.some((id) => id === WalletID.TALISMAN),
    ];
  }, [bridgeInstance]);

  useEffect(() => {
    const crossInfo = bridgeInstance?.getCrossInfo();
    if (activeAccount && !crossInfo?.wallets.some((id) => id === WalletID.TALISMAN)) {
      disconnectTalisman();
      setSender(undefined);
    } else if (activeAddress && !crossInfo?.wallets.some((id) => id === WalletID.RAINBOW)) {
      disconnectRainbow();
      setSender(undefined);
    }
  }, [activeAccount, activeAddress, bridgeInstance, disconnectRainbow, disconnectTalisman, setSender]);

  const walletIcon =
    activeWallet === WalletID.RAINBOW ? "rainbow.svg" : kind === "component" ? "talisman-red.svg" : "talisman-blue.svg";

  return activeAccount || activeAddress ? (
    <Button onClick={handleDisconnect} kind={kind}>
      <Image width={16} height={16} alt="Wallet" src={`/images/wallet/${walletIcon}`} />
      <span>Disconnect</span>
    </Button>
  ) : (
    <>
      <Button onClick={handleConnect} kind={kind}>
        Connect wallet
      </Button>
      <Modal title="Wallets" isOpen={isOpen} onClose={setIsOpenFalse} className="w-full lg:w-[20rem]">
        <div className="flex flex-col">
          <Item
            icon="talisman-red.svg"
            name="Talisman"
            onClick={() => {
              connectTalisman();
              setIsOpenFalse();
            }}
            disabled={!supportedTalisman}
          />
          <Item
            icon="rainbow.svg"
            name="Rainbow"
            onClick={() => {
              openConnectModal?.();
              setIsOpenFalse();
            }}
            disabled={!supportedRainbow}
          />
        </div>
      </Modal>
    </>
  );
}

/**
 * Warning: validateDOMNesting(...): <button> cannot appear as a descendant of <button>. So we use `div` to mock a button here
 */
function Button({
  kind,
  children,
  onClick,
}: PropsWithChildren<{ kind?: "component" | "primary"; onClick?: MouseEventHandler<HTMLDivElement> }>) {
  return (
    <div
      onClick={onClick}
      className={`border-radius flex items-center gap-small border px-middle py-small transition-[transform,color] hover:cursor-pointer hover:opacity-80 active:translate-y-1 disabled:translate-y-0 disabled:opacity-100 ${
        kind === "component" ? "border-component bg-component" : "border-primary bg-primary"
      }`}
    >
      {children}
    </div>
  );
}

function Item({
  icon,
  name,
  onClick,
  disabled,
}: {
  icon: string;
  name: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="border-radius flex items-center gap-middle bg-transparent p-middle transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
      onClick={onClick}
      disabled={disabled}
    >
      <Image width={20} height={20} alt="Wallet icon" src={`/images/wallet/${icon}`} />
      <span>{name}</span>
    </button>
  );
}
