import { BaseBridge } from "@/libs";
import { Currency } from "@/types";
import type { BN } from "@polkadot/util";
import { useCallback, useEffect, useState } from "react";
import { from, EMPTY } from "rxjs";

export function useAssetSupply(bridge: BaseBridge | undefined, position: "source" | "target") {
  const [value, setValue] = useState<{ currency: Currency; amount: BN }>();

  const update = useCallback(() => {
    if (bridge) {
      return from(position === "source" ? bridge.getSourceAssetSupply() : bridge.getTargetAssetSupply()).subscribe({
        next: setValue,
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      setValue(undefined);
    }

    return EMPTY.subscribe();
  }, [bridge, position]);

  useEffect(() => {
    const sub$$ = update();
    return () => {
      sub$$?.unsubscribe();
    };
  }, [update]);

  return { value, update };
}
