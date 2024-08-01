import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <section className="flex h-[56px] w-full items-center justify-between px-[30px]">
      <Link href="/">
        <Image src="/images/paralink-logo.svg" width={90} height={24} alt="Paralink logo" />
      </Link>
      <div className="flex items-center justify-center gap-[10px]">
        <div className="flex h-[36px] w-fit cursor-pointer items-center justify-center gap-[5px] rounded-[10px] bg-white px-[10px]">
          <span className="block h-[19px] w-[19px] bg-[url('/images/icons/wallet-icon.svg')] bg-contain bg-center bg-no-repeat" />
          <p className="text-[14px] leading-[24px]">Connect Wallet</p>
        </div>
        <div className="flex h-[36px] w-fit cursor-pointer items-center justify-center gap-[5px] rounded-[10px] bg-white px-[10px]">
          <span className="block h-[24px] w-[24px] bg-[url('/images/icons/assethub-icon.svg')] bg-contain bg-center bg-no-repeat" />
          <span className="block h-[16px] w-[16px] bg-[url('/images/icons/downarrow-icon.svg')] bg-contain bg-center bg-no-repeat" />
        </div>
      </div>
    </section>
  );
}
