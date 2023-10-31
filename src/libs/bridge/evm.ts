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
    publicClient: PublicClient;
    walletClient: WalletClient | null | undefined;
    transferSource: { asset: Asset; chain: ChainConfig };
    transferTarget: { asset: Asset; chain: ChainConfig };
  }) {
    super(args);
    this.publicClient = args.publicClient;
    this.walletClient = args.walletClient;
  }

  async transfer(): Promise<undefined> {
    return;
  }

  async _transferAssetWithPrecompile(sender: Address, recipient: string, amount: BN) {
    const extrinsic = await this._transferAsset(recipient, amount);

    // const estimateGas = await this.publicClient.estimateGas({
    //   account: sender,
    //   to: DISPATCH_PRECOMPILE_ADDRESS,
    //   data: u8aToHex(extrinsic.method.toU8a()),
    // });
    // const { maxFeePerGas } = await this.publicClient.estimateFeesPerGas();
    // const estimateGasFee = estimateGas * (maxFeePerGas || 0n);

    if (this.walletClient) {
      const hash = await this.walletClient.sendTransaction({
        account: sender,
        to: DISPATCH_PRECOMPILE_ADDRESS,
        data: u8aToHex(extrinsic.method.toU8a()),
      });
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      return receipt;
    }
  }
}
