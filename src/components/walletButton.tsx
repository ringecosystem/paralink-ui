import { useCallback, useState } from "react";
import WalletSelectionModal from "./walletSelectionModal";

export default function WalletButton() {
  const [visible, setVisible] = useState(false);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  console.log(visible);

  return (
    <>
      <div
        onClick={() => {
          setVisible(true);
        }}
        className="flex h-[36px] w-fit cursor-pointer items-center justify-center gap-[5px] rounded-[10px] bg-white px-[10px] hover:shadow-lg"
      >
        <span className="block h-[19px] w-[19px] bg-[url('/images/icons/wallet-icon.svg')] bg-contain bg-center bg-no-repeat" />
        <p className="text-[14px] leading-[24px]">Connect Wallet</p>
      </div>
      <WalletSelectionModal visible={visible} onClose={handleClose} />
    </>
  );
}
