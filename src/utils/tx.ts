import type { Signer, SubmittableExtrinsic } from "@polkadot/api/types";
import { notifyExtrinsic } from ".";
import { ChainConfig } from "@/types";

/**
 * Reference: https://github.com/darwinia-network/apps/blob/8748d9218a/src/utils/signer/signer.ts
 */
export const signAndSendExtrinsic = async (
  extrinsic: SubmittableExtrinsic<"promise">,
  signer: Signer,
  sender: string,
  chain: ChainConfig,
) => {
  try {
    const unsub = await extrinsic.signAndSend(sender, { signer }, (result) => {
      if (result.isCompleted) {
        unsub();
      }

      if (result.status.isFinalized || result.status.isInBlock) {
        result.events
          .filter(({ event: { section } }) => section === "system")
          .forEach(({ event: { method } }): void => {
            if (method === "ExtrinsicFailed") {
              notifyExtrinsic(result.txHash.toHex(), chain, false);
            } else if (method === "ExtrinsicSuccess") {
              notifyExtrinsic(result.txHash.toHex(), chain, true);
            }
          });
      } else if (result.isError) {
        notifyExtrinsic(result.txHash.toHex(), chain, false);
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    //
  }
};
