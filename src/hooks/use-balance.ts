import { EvmBridge } from "@/libs";
import { useCallback, useEffect, useState } from "react";
import { BN } from "@polkadot/util";
import { Asset } from "@/types";
import { forkJoin, EMPTY } from "rxjs";

export function useBalance(
  bridge: EvmBridge | undefined,
  value: { address: string; valid: boolean } | undefined,
  type: "source" | "target" | "usdt",
) {
  const [balance, setBalance] = useState<{ asset: { value: BN; asset: Asset } }>();

  const updateBalance = useCallback(() => {
    if (bridge && value?.address && value.valid) {
      return forkJoin([
        type === "usdt"
          ? bridge.getSourceUsdtBalance(value.address)
          : type === "source"
          ? bridge.getSourceAssetBalance(value.address)
          : bridge.getTargetAssetBalance(value.address),
      ]).subscribe({
        next: ([asset]) => {
          setBalance(asset ? { asset } : undefined);
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
  }, [bridge, value, type]);

  useEffect(() => {
    const sub$$ = updateBalance();
    return () => sub$$.unsubscribe();
  }, [updateBalance]);

  return { balance, refetch: updateBalance };
}
