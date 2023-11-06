import { useToggle } from "@/hooks";
import Image from "next/image";
import { MouseEventHandler, useCallback, useEffect } from "react";
import { timer, Subscription } from "rxjs";

interface Props {
  text: string;
}

export default function CopyIcon({ text }: Props) {
  const { state: isCopied, setTrue: setIsCopiedTrue, setFalse: setIsCopiedFalse } = useToggle(false);

  const handleCopy = useCallback<MouseEventHandler<HTMLImageElement>>(
    async (e) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(text);
        setIsCopiedTrue();
      } catch (err) {
        console.error(err);
      }
    },
    [text, setIsCopiedTrue],
  );

  useEffect(() => {
    let sub$$: Subscription | undefined;
    if (isCopied) {
      sub$$ = timer(1000, 0).subscribe(setIsCopiedFalse);
    }
    return () => sub$$?.unsubscribe();
  }, [isCopied, setIsCopiedFalse]);

  return isCopied ? (
    <Image width={16} height={16} alt="Copied" src="/images/checked.svg" className="shrink-0" />
  ) : (
    <Image
      width={16}
      height={16}
      alt="Copy"
      src="/images/copy.svg"
      className="shrink-0 transition hover:scale-105 hover:cursor-pointer hover:opacity-80 active:scale-105"
      onClick={handleCopy}
    />
  );
}
