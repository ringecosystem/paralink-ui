import { PropsWithChildren, ReactElement } from "react";
import Label from "./label";

interface Props {
  label: string;
  extra: ReactElement;
}

export default function TransferSection({ label, extra, children }: PropsWithChildren<Props>) {
  return (
    <div className="flex flex-col gap-middle">
      <div className="flex items-center justify-between">
        <Label text={label} />
        {extra}
      </div>
      {children}
    </div>
  );
}
