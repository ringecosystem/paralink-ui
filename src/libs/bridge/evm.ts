import { ApiPromise } from "@polkadot/api";
import { BN, u8aToHex } from "@polkadot/util";
import { SubstrateBridge } from "./substrate";
import { Asset, ChainConfig } from "@/types";
import { Address, PublicClient, WalletClient } from "wagmi";
import { DISPATCH_PRECOMPILE_ADDRESS } from "@/config";

/**
 * Supported wallets: MetaMask, etc.
 */

export class EvmBridge extends SubstrateBridge {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | null | undefined;

  constructor(args: {
    sourceApi: ApiPromise;
    targetApi: ApiPromise;
    publicClient: PublicClient;
    walletClient: WalletClient | null | undefined;
    sourceChain: ChainConfig;
    targetChain: ChainConfig;
    sourceAsset: Asset;
    targetAsset: Asset;
  }) {
    super(args);
    this.publicClient = args.publicClient;
    this.walletClient = args.walletClient;
  }

  async transfer(): Promise<undefined> {
    return;
  }

  async transferAssetsWithPrecompile(sender: string, recipient: string, amount: BN) {
    const extrinsic = await this.transferAssets(recipient, amount);
    const account = sender as Address;

    // const estimateGas = await this.publicClient.estimateGas({
    //   account,
    //   to: DISPATCH_PRECOMPILE_ADDRESS,
    //   data: u8aToHex(extrinsic.method.toU8a()),
    // });
    // const { maxFeePerGas } = await this.publicClient.estimateFeesPerGas();
    // const estimateGasFee = estimateGas * (maxFeePerGas || 0n);

    if (this.walletClient) {
      const hash = await this.walletClient.sendTransaction({
        account,
        to: DISPATCH_PRECOMPILE_ADDRESS,
        data: u8aToHex(extrinsic.method.toU8a()),
      });
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      return receipt;
    }
  }
}
