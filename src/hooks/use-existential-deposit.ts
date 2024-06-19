import { BaseBridge } from "@/libs";
import { useCallback, useEffect, useState } from "react";
import type { BN } from "@polkadot/util";
import { from } from "rxjs";
import { Currency } from "@/types";

export function useExistentialDeposit(bridge: BaseBridge | undefined, position: "source" | "target") {
  const [value, setValue] = useState<{ currency: Currency; amount: BN }>();

  const update = useCallback(() => {
    if (bridge) {
      return from(
        position === "source" ? bridge.getSourceExistentialDeposit() : bridge.getTargetExistentialDeposit(),
      ).subscribe({
        next: setValue,
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      setValue(undefined);
    }
  }, [bridge, position]);

  useEffect(() => {
    const sub$$ = update();
    return () => {
      sub$$?.unsubscribe();
    };
  }, [update]);

  return { value, update };
}
