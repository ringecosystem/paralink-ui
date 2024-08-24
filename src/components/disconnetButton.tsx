import { useTransfer } from "@/hooks";
import { MouseEventHandler, useCallback } from "react";
import { useDisconnect } from "wagmi";

export default function DisconnectButton() {
  const { disconnect } = useDisconnect();
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

  const handleDisconnect = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.stopPropagation();
      setSender(undefined);
      setActiveSenderWallet(undefined);
      setActiveSenderAccount(undefined);
      disconnect();
    },
    [setSender, setActiveSenderWallet, setActiveSenderAccount],
  );
  return (
    <button
      onClick={handleDisconnect}
      className="flex h-[28px] w-full items-center justify-center gap-[10px] rounded-[10px] bg-[#FF00831A] duration-200 hover:shadow-lg"
    >
      <span className="block h-[16px] w-[16px] bg-[url('/images/icons/disconnect-icon.svg')] bg-contain bg-center bg-repeat" />
      <p className="text-[14px] text-[#FF0083]">Disconnect</p>
    </button>
  );
}
