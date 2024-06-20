import { ApiPromise } from "@polkadot/api";
import { BN, u8aToHex } from "@polkadot/util";
import { SubstrateBridge } from "./substrate";
import { Asset, ChainConfig } from "@/types";
import { PublicClient, WalletClient } from "wagmi";
import { DISPATCH_PRECOMPILE_ADDRESS } from "@/config";

export class UniversalBridge extends SubstrateBridge {
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

  async transferWithPrecompile(recipient: string, amount: BN) {
    const extrinsic = await this.transfer(recipient, amount);
    if (extrinsic && this.walletClient) {
      const sender = (await this.walletClient.getAddresses())[0];

      // const estimateGas = await this.publicClient.estimateGas({
      //   account: sender,
      //   to: DISPATCH_PRECOMPILE_ADDRESS,
      //   data: u8aToHex(extrinsic.method.toU8a()),
      // });
      // const { maxFeePerGas } = await this.publicClient.estimateFeesPerGas();
      // const estimateGasFee = estimateGas * (maxFeePerGas || 0n);

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
