import { PropsWithChildren } from "react";
import MetaMaskProvider from "./metamask-provider";
import WalletConnectProvider from "./walletconnect-provider";
import RoninProvider from "./roninwallet-provider";
import NovaWalletProvider from "./novaPRovider";

export default function WalletProviders({ children }: PropsWithChildren<unknown>) {
  return (
    <MetaMaskProvider>
      <WalletConnectProvider>
        <NovaWalletProvider>
          <RoninProvider>{children}</RoninProvider>
        </NovaWalletProvider>
      </WalletConnectProvider>
    </MetaMaskProvider>
  );
}
