import { EvmBridge } from "@/libs";
import type { PalletAssetsAssetDetails } from "@polkadot/types/lookup";
import { useEffect, useState } from "react";
import { from, Subscription } from "rxjs";

export function useAssetDetails(bridge: EvmBridge | undefined, position: "source" | "target") {
  const [assetDetails, setAssetDetails] = useState<PalletAssetsAssetDetails>();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (bridge) {
      sub$$ = from(position === "source" ? bridge.getSourceAssetDetails() : bridge.getTargetAssetDetails()).subscribe({
        next: setAssetDetails,
        error: (err) => {
          console.error(err);
          setAssetDetails(undefined);
        },
      });
    } else {
      setAssetDetails(undefined);
    }

    return () => sub$$?.unsubscribe();
  }, [bridge, position]);

  return { assetDetails };
}
