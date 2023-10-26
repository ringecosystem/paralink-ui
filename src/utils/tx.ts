import type { Signer, SubmittableExtrinsic } from "@polkadot/api/types";

/**
 * Reference: https://github.com/darwinia-network/apps/blob/8748d9218a/src/utils/signer/signer.ts
 */
export const signAndSendExtrinsic = async (
  extrinsic: SubmittableExtrinsic<"promise">,
  signer: Signer,
  sender: string,
) => {
  try {
    const unsub = await extrinsic.signAndSend(sender, { signer }, (result) => {
      if (result.isCompleted) {
        console.log("extrinsic complete");
        unsub();
      }

      if (result.status.isFinalized || result.status.isInBlock) {
        result.events
          .filter(({ event: { section } }) => section === "system")
          .forEach(({ event: { method } }): void => {
            if (method === "ExtrinsicFailed") {
              console.log("extrinsic failed");
            } else if (method === "ExtrinsicSuccess") {
              console.log("extrinsic success");
            }
          });
      } else if (result.isError) {
        console.log("extrinsic error");
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    //
  }
};
