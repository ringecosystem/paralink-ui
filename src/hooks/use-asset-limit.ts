import { EvmBridge } from "@/libs";
import { useEffect, useState } from "react";
import { from, Subscription } from "rxjs";
import { BN } from "@polkadot/util";

export function useAssetLimit(bridge: EvmBridge | undefined) {
  const [assetLimit, setAssetLimit] = useState<BN>();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (bridge) {
      sub$$ = from(bridge.getAssetLimit()).subscribe({
        next: setAssetLimit,
        error: (err) => {
          console.error(err);
          setAssetLimit(undefined);
        },
      });
    } else {
      setAssetLimit(undefined);
    }

    return () => sub$$?.unsubscribe();
  }, [bridge]);

  return { assetLimit };
}
