import { EVMWalletContext } from "@/providers/evm-provider";
import { useContext } from "react";

export const useEVM = () => useContext(EVMWalletContext);
