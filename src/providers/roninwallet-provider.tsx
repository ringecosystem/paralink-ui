import { PropsWithChildren } from "react";

export default function RoninProvider({ children }: PropsWithChildren<unknown>) {
  return <div>{children}</div>;
}
