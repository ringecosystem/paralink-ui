"use client";

import { createContext, PropsWithChildren, useState } from "react";

interface EVMWalletCtx {
  walletType: string;
  accounts: any[];
  connectToEVM: (walletType: string) => void;
  disconnectEVM: () => void;
}

const defaultValue: EVMWalletCtx = {
  walletType: "",
  accounts: [],
  connectToEVM: (walletType) => undefined,
  disconnectEVM: () => undefined,
};

export const EVMWalletContext = createContext(defaultValue);

export default function EVMWalletProviders({ children }: PropsWithChildren<unknown>) {
  const [walletType, setWalletType] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);

  const connectToEVM = (walletType: string) => {
    console.log("wallet Type", walletType);
    setWalletType(walletType);
    switch (walletType) {
      case "metaMask":
        connectToMetaMask();
        break;
      case "coinBase":
        connectToCoinBase();
        break;
      case "walletConnect":
        connectToWalletConnect();
        break;
      case "novaWallet":
        connectToNovaWallet();
        break;
      case "RoninWallet":
        connectToRoninWallet();
        break;
      default:
        connectToMetaMask();
    }
  };

  const connectToMetaMask = async () => {
    console.log("metaMask");
    if (window.ethereum) {
      try {
        const accountsList = await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log(accountsList);
        setAccounts([...accountsList]);
      } catch (error) {
        console.error("User rejected connection request:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this feature.");
    }
  };

  const connectToCoinBase = () => {
    console.log("coin base");
  };

  const connectToWalletConnect = () => {
    console.log("wallet connect");
  };

  const connectToNovaWallet = () => {
    console.log("nova wallet");
  };

  const connectToRoninWallet = () => {
    console.log("ronin wallet");
  };

  const disconnectEVM = () => {
    console.log("disconnect");
  };
  return (
    <EVMWalletContext.Provider value={{ walletType, accounts, connectToEVM, disconnectEVM }}>
      {children}
    </EVMWalletContext.Provider>
  );
}
