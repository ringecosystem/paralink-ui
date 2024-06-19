import { BaseBridge } from "@/libs";
import { useCallback, useEffect, useState } from "react";
import { BN } from "@polkadot/util";
import { Currency } from "@/types";
import { from, EMPTY } from "rxjs";

export function useNativeBalance(
  bridge: BaseBridge | undefined,
  account: { address: string; valid: boolean } | undefined,
  position: "source" | "target",
) {
  const [value, setValue] = useState<{ currency: Currency; amount: BN }>();

  const update = useCallback(() => {
    if (bridge && account?.address && account.valid) {
      return from(
        position === "source"
          ? bridge.getSourceNativeBalance(account.address)
          : bridge.getTargetNativeBalance(account.address),
      ).subscribe({
        next: setValue,
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      setValue(undefined);
    }

    return EMPTY.subscribe();
  }, [bridge, account, position]);

  useEffect(() => {
    const sub$$ = update();
    return () => {
      sub$$?.unsubscribe();
    };
  }, [update]);

  return { value, update };
}
