import { useToggle } from "@/hooks";
import Button from "@/ui/button";
import Modal from "@/ui/modal";
import Image from "next/image";

export default function ConnectWallet() {
  const { state: isOpen, setTrue: setIsOpenTrue, setFalse: setIsOpenFalse } = useToggle(false);

  return (
    <>
      <Button onClick={setIsOpenTrue}>Connect wallet</Button>
      <Modal title="Wallets" isOpen={isOpen} onClose={setIsOpenFalse}>
        <div className="flex flex-col gap-large">
          <Item icon="talisman.svg" name="Talisman" onClick={() => {}} />
          <Item icon="rainbow.svg" name="Rainbow" onClick={() => {}} />
        </div>
      </Modal>
    </>
  );
}

function Item({ icon, name, onClick }: { icon: string; name: string; onClick: () => void }) {
  return (
    <button className="flex items-center gap-small bg-transparent p-[2px] hover:bg-white/20" onClick={onClick}>
      <Image width={18} height={18} alt="Wallet icon" src={`/images/wallet/${icon}`} />
      <span>{name}</span>
    </button>
  );
}
