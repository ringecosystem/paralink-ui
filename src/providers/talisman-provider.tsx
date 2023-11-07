"use client";

import { APP_NAME } from "@/config";
import { Wallet, WalletAccount, getWallets } from "@talismn/connect-wallets";
import { PropsWithChildren, createContext, useCallback, useEffect, useRef, useState } from "react";
import type { Unsubcall } from "@polkadot/extension-inject/types";

interface TalismanCtx {
  isTalismanInstalled: boolean;
  talismanWallet: Wallet | undefined;
  talismanAccounts: WalletAccount[];
  connectTalisman: () => Promise<void>;
  disconnectTalisman: () => void;
}

const defaultValue: TalismanCtx = {
  isTalismanInstalled: false,
  talismanWallet: undefined,
  talismanAccounts: [],
  disconnectTalisman: () => undefined,
  connectTalisman: async () => undefined,
};

export const TalismanContext = createContext(defaultValue);

export default function TalismanProvider({ children }: PropsWithChildren<unknown>) {
  const walletRef = useRef<Wallet>();
  const [isTalismanInstalled, setIsTalismanInstalled] = useState(false);
  const [talismanWallet, setTalismanWallet] = useState<Wallet>();
  const [talismanAccounts, setTalismanAccounts] = useState<WalletAccount[]>([]);

  const connectTalisman = useCallback(async () => {
    if (walletRef.current) {
      await walletRef.current.enable(APP_NAME);
      setTalismanWallet(walletRef.current);
    }
  }, []);

  const disconnectTalisman = useCallback(() => setTalismanWallet(undefined), []);

  useEffect(() => {
    const installedWallets = getWallets().filter((w) => w.installed);
    const talisman = installedWallets.find((wallet) => wallet.extensionName === "talisman");
    walletRef.current = talisman;
    setIsTalismanInstalled(!!talisman);
  }, []);

  /**
   * Subscribe accounts
   */
  useEffect(() => {
    let unsub: Unsubcall | undefined;

    if (talismanWallet) {
      (
        talismanWallet.subscribeAccounts((accounts) => {
          setTalismanAccounts(accounts || []);
        }) as Promise<Unsubcall>
      )
        .then((_unsub) => {
          unsub = _unsub;
        })
        .catch((err) => {
          console.error(err);
          setTalismanAccounts([]);
        });
    } else {
      setTalismanAccounts([]);
    }

    return () => {
      unsub && unsub();
    };
  }, [talismanWallet]);

  return (
    <TalismanContext.Provider
      value={{
        isTalismanInstalled,
        talismanWallet,
        talismanAccounts,
        connectTalisman,
        disconnectTalisman,
      }}
    >
      {children}
    </TalismanContext.Provider>
  );
}
