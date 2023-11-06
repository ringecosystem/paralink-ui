import type { Signer, SubmittableExtrinsic } from "@polkadot/api/types";
import { notifyExtrinsic } from ".";
import { ChainConfig } from "@/types";

const transferCb = {
  successCb: () => {},
  failedCb: () => {},
};

/**
 * Reference: https://github.com/darwinia-network/apps/blob/8748d9218a/src/utils/signer/signer.ts
 */
export const signAndSendExtrinsic = async (
  extrinsic: SubmittableExtrinsic<"promise">,
  signer: Signer,
  sender: string,
  chain: ChainConfig,
  options = transferCb,
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
              options.failedCb();
            } else if (method === "ExtrinsicSuccess") {
              notifyExtrinsic(result.txHash.toHex(), chain, true);
              options.successCb();
            }
          });
      } else if (result.isError) {
        notifyExtrinsic(result.txHash.toHex(), chain, false);
        options.failedCb();
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    //
  }
};
