import { PropsWithChildren, ReactElement } from "react";
import Label from "./label";

interface Props {
  label: string;
  extra?: ReactElement;
  className?: string;
}

export default function TransferSection({ label, extra, children, className }: PropsWithChildren<Props>) {
  return (
    <div className={`relative flex flex-col gap-middle ${className}`}>
      <div className="absolute -top-8 left-0 flex w-full items-center justify-between">
        <Label text={label} />
        {extra}
      </div>
      <div className="border-radius bg-app-black">{children}</div>
    </div>
  );
}
