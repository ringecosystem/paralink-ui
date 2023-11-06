import { TalismanContext } from "@/providers/talisman-provider";
import { useContext } from "react";

export const useTalisman = () => useContext(TalismanContext);
