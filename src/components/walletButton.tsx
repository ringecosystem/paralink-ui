import { useCallback, useState } from "react";
import WalletSelectionModal from "./walletSelectionModal";

export default function WalletButton({ openModal }: { openModal: () => void }) {
  return (
    <div
      onClick={openModal}
      className="flex h-[36px] w-[190px] cursor-pointer items-center gap-[5px] rounded-[10px] bg-white px-[10px] hover:shadow-lg lg:w-fit lg:justify-center"
    >
      <span className="block h-[19px] w-[19px] bg-[url('/images/icons/wallet-icon.svg')] bg-contain bg-center bg-no-repeat" />
      <p className="text-[14px] leading-[24px]">Connect Wallet</p>
    </div>
  );
}
