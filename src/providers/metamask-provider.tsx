import { Wallet } from "ethers";
import { PropsWithChildren } from "react";

interface MetamaskCtx {
  isMetamaskInstalled: boolean;
  metamaskWallet: Wallet | undefined;
  metamaskAccounts: any[];
  connectMetaMask: () => Promise<void>;
  disconnectMetaMask: () => void;
}

const defaultValue: MetamaskCtx = {
  isMetamaskInstalled: false,
  metamaskWallet: undefined,
  metamaskAccounts: [],
  connectMetaMask: async () => undefined,
  disconnectMetaMask: () => undefined,
};

export default function MetaMaskProvider({ children }: PropsWithChildren<unknown>) {
  return <div>{children}</div>;
}
