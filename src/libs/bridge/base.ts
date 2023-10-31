import { Asset, ChainConfig } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { BN, BN_ZERO } from "@polkadot/util";

export abstract class BaseBridge {
  protected readonly sourceApi: ApiPromise;
  protected readonly transferSource: { asset: Asset; chain: ChainConfig };
  protected readonly transferTarget: { asset: Asset; chain: ChainConfig };

  constructor(args: {
    sourceApi: ApiPromise;
    transferSource: { asset: Asset; chain: ChainConfig };
    transferTarget: { asset: Asset; chain: ChainConfig };
  }) {
    this.sourceApi = args.sourceApi;
    this.transferSource = args.transferSource;
    this.transferTarget = args.transferTarget;
  }

  /**
   * Token decimals and symbol: api.rpc.system.properties
   */
  async getSourceNativeBalance(address: string) {
    const balancesAll = await this.sourceApi.derive.balances.all(address);
    const locked = balancesAll.lockedBalance;
    const transferrable = balancesAll.availableBalance;
    const total = balancesAll.freeBalance.add(balancesAll.reservedBalance);
    return { transferrable, locked, total };
  }

  /**
   * Token name, symbol and decimals: api.query.assets.metadata
   */
  async getSourceAssetBalance(address: string) {
    const { asset } = this.transferSource;
    const assetOption = await this.sourceApi.query.assets.account(asset.id, address);
    if (assetOption.isSome) {
      const assetBalance = assetOption.unwrap().balance;
      return assetBalance as BN;
    }
    return BN_ZERO;
  }

  abstract transfer(): Promise<undefined>;
}
