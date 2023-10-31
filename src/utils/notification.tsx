import { ChainConfig } from "@/types/chain";
import notification from "@/ui/notification";
import { TransactionReceipt } from "viem";

function notify(hash: string, explorer: string, path: "tx" | "extrinsic", isSuccess: boolean) {
  const title = isSuccess ? "Transaction successful" : "Transaction failed";
  const method = isSuccess ? "success" : "error";

  notification[method]({
    title,
    description: (
      <a
        target="_blank"
        rel="noopener"
        className="break-all text-primary hover:underline"
        href={new URL(`${path}/${hash}`, explorer).href}
      >
        {hash}
      </a>
    ),
  });
}

export function notifyTransaction(receipt?: TransactionReceipt, chain?: ChainConfig) {
  const explorer = chain?.blockExplorers?.default.url;

  if (receipt?.status === "success" && explorer) {
    notify(receipt.transactionHash, explorer, "tx", true);
  } else if (receipt?.status === "reverted" && explorer) {
    notify(receipt.transactionHash, explorer, "tx", false);
  }
}

export function notifyExtrinsic(hash: string, chain: ChainConfig, isSuccess: boolean) {
  const explorer = chain?.blockExplorers?.default.url;
  if (explorer) {
    notify(hash, explorer, "extrinsic", isSuccess);
  }
}
