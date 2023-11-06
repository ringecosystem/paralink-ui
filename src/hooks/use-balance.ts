import { EvmBridge } from "@/libs";
import { useCallback, useEffect, useState } from "react";
import { BN } from "@polkadot/util";
import { Asset } from "@/types";
import { forkJoin, EMPTY } from "rxjs";

export function useBalance(bridge: EvmBridge | undefined, address: string | undefined, position: "source" | "target") {
  const [balance, setBalance] = useState<{ asset: { value: BN; asset: Asset } }>();

  const updateBalance = useCallback(() => {
    if (bridge && address) {
      return forkJoin([
        position === "source" ? bridge.getSourceAssetBalance(address) : bridge.getTargetAssetBalance(address),
      ]).subscribe({
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

    return EMPTY.subscribe();
  }, [bridge, address, position]);

  useEffect(() => {
    const sub$$ = updateBalance();
    return () => sub$$.unsubscribe();
  }, [updateBalance]);

  return { balance, refetch: updateBalance };
}
