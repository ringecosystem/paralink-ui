import { EvmBridge } from "@/libs";
import { useEffect, useState } from "react";
import { BN } from "@polkadot/util";
import { Asset } from "@/types";
import { forkJoin, Subscription } from "rxjs";

export function useBalance(bridge: EvmBridge | undefined, address: string | undefined, position: "source" | "target") {
  const [balance, setBalance] = useState<{ asset: { value: BN; asset: Asset } }>();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (bridge && address) {
      const assetCall = position === "source" ? bridge.getSourceAssetBalance : bridge.getTargetAssetBalance;

      sub$$ = forkJoin([assetCall(address)]).subscribe({
        next: ([asset]) => {
          setBalance({ asset });
        },
        error: (err) => {
          console.error(err);
          setBalance(undefined);
        },
      });
    } else {
      setBalance(undefined);
    }

    return () => sub$$?.unsubscribe();
  }, [bridge, address, position]);

  return { balance };
}
