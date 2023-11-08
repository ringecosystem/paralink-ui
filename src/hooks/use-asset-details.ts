import { EvmBridge } from "@/libs";
import type { PalletAssetsAssetDetails } from "@polkadot/types/lookup";
import { useCallback, useEffect, useState } from "react";
import { from, EMPTY } from "rxjs";

export function useAssetDetails(bridge: EvmBridge | undefined, position: "source" | "target") {
  const [assetDetails, setAssetDetails] = useState<PalletAssetsAssetDetails>();

  const updateBalance = useCallback(() => {
    if (bridge) {
      return from(position === "source" ? bridge.getSourceAssetDetails() : bridge.getTargetAssetDetails()).subscribe({
        next: setAssetDetails,
        error: (err) => {
          console.error(err);
          setAssetDetails(undefined);
        },
      });
    } else {
      setAssetDetails(undefined);
    }

    return EMPTY.subscribe();
  }, [bridge, position]);

  useEffect(() => {
    const sub$$ = updateBalance();
    return () => sub$$.unsubscribe();
  }, [updateBalance]);

  return { assetDetails, refetch: updateBalance };
}
