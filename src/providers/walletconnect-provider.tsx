import { PropsWithChildren } from "react";

export default function WalletConnectProvider({ children }: PropsWithChildren<unknown>) {
  return <div>{children}</div>;
}
