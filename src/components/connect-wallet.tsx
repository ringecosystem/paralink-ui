import { useTalisman, useToggle, useTransfer } from "@/hooks";
import { WalletID } from "@/types";
import BaseButton from "@/ui/button";
import Modal from "@/ui/modal";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { MouseEventHandler, PropsWithChildren, useCallback, useMemo } from "react";
import { useAccount, useDisconnect } from "wagmi";

export default function ConnectWallet() {
  const { state: isOpen, setTrue: setIsOpenTrue, setFalse: setIsOpenFalse } = useToggle(false);
  const { activeAccount, connectTalisman } = useTalisman();
  const { disconnect } = useDisconnect();
  const { address: activeAddress } = useAccount();
  const { bridgeInstance } = useTransfer();
  const { openConnectModal } = useConnectModal();

  const handleConnect = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.stopPropagation();
      setIsOpenTrue();
    },
    [setIsOpenTrue],
  );

  const handleDisconnect = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.stopPropagation();
      disconnect();
    },
    [disconnect],
  );

  const [supportedRainbow, supportedTalisman] = useMemo(() => {
    const crossInfo = bridgeInstance?.getCrossInfo();
    return [
      crossInfo?.wallets.some((id) => id === WalletID.RAINBOW),
      crossInfo?.wallets.some((id) => id === WalletID.TALISMAN),
    ];
  }, [bridgeInstance]);

  return activeAccount || activeAddress ? (
    <Button onClick={handleDisconnect}>Disconnect</Button>
  ) : (
    <>
      <Button onClick={handleConnect}>Connect wallet</Button>
      <Modal title="Wallets" isOpen={isOpen} onClose={setIsOpenFalse} className="w-full lg:w-[20rem]">
        <div className="flex flex-col">
          <Item
            icon="talisman.svg"
            name="Talisman"
            onClick={() => {
              connectTalisman();
              setIsOpenFalse();
            }}
            disabled={!supportedRainbow}
          />
          <Item
            icon="rainbow.svg"
            name="Rainbow"
            onClick={() => {
              openConnectModal?.();
              setIsOpenFalse();
            }}
            disabled={!supportedTalisman}
          />
        </div>
      </Modal>
    </>
  );
}

function Button({ children, onClick }: PropsWithChildren<{ onClick?: MouseEventHandler<HTMLButtonElement> }>) {
  return (
    <BaseButton onClick={onClick} kind="component" className="px-middle py-small">
      {children}
    </BaseButton>
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
