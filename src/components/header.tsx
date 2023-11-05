import Image from "next/image";
import Link from "next/link";
// import ConnectWallet from "./connect-wallet";
import dynamic from "next/dynamic";

const ConnectWallet = dynamic(() => import("@/components/connect-wallet"), { ssr: false });

export default function Header() {
  return (
    <div className="app-header fixed left-0 top-0 w-full">
      <div className="container mx-auto flex h-full items-center justify-between px-middle">
        <Link href="/">
          <Image width={156} height={18} alt="Logo" src="/images/logo.png" />
        </Link>
        <ConnectWallet kind="primary" />
      </div>
    </div>
  );
}
