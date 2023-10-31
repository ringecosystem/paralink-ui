import { Asset, ChainConfig, Cross } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { BN_ZERO, BN } from "@polkadot/util";

export abstract class BaseBridge {
  protected readonly cross: Cross | undefined;
  protected readonly sourceApi: ApiPromise;
  protected readonly targetApi: ApiPromise;
  protected readonly transferSource: { asset: Asset; chain: ChainConfig };
  protected readonly transferTarget: { asset: Asset; chain: ChainConfig };

  constructor(args: {
    sourceApi: ApiPromise;
    targetApi: ApiPromise;
    transferSource: { asset: Asset; chain: ChainConfig };
    transferTarget: { asset: Asset; chain: ChainConfig };
  }) {
    this.sourceApi = args.sourceApi;
    this.targetApi = args.targetApi;
    this.transferSource = args.transferSource;
    this.transferTarget = args.transferTarget;

    const { asset, chain } = args.transferTarget;
    this.cross = args.transferSource.asset.cross.find(
      ({ target }) => target.network === chain.network && target.symbol === asset.symbol,
    );
  }

  getCrossInfo() {
    return this.cross;
  }

  getTransferSource() {
    return this.transferSource;
  }

  getTransferTarget() {
    return this.transferTarget;
  }

  /**
   * Token decimals and symbol: api.rpc.system.properties
   */
  private async getNativeBalance(api: ApiPromise, address: string) {
    const balancesAll = await api.derive.balances.all(address);
    const locked = balancesAll.lockedBalance;
    const transferrable = balancesAll.availableBalance;
    const total = balancesAll.freeBalance.add(balancesAll.reservedBalance);
    return { transferrable, locked, total };
  }

  async getSourceNativeBalance(address: string) {
    const balances = await this.getNativeBalance(this.sourceApi, address);
    return { ...balances, currency: this.transferSource.chain.nativeCurrency };
  }

  async getTargetNativeBalance(address: string) {
    const balances = await this.getNativeBalance(this.targetApi, address);
    return { ...balances, currency: this.transferTarget.chain.nativeCurrency };
  }

  /**
   * Token name, symbol and decimals: api.query.assets.metadata
   */
  private async getAssetBalance(api: ApiPromise, asset: Asset, address: string) {
    const assetOption = await api.query.assets.account(asset.id, address);
    if (assetOption.isSome) {
      return assetOption.unwrap().balance as BN;
    }
    return BN_ZERO;
  }

  async getSourceAssetBalance(address: string) {
    const { asset } = this.transferSource;
    const value = await this.getAssetBalance(this.sourceApi, asset, address);
    return { value, asset };
  }

  async getTargetAssetBalance(address: string) {
    const { asset } = this.transferTarget;
    const value = await this.getAssetBalance(this.targetApi, asset, address);
    return { value, asset };
  }

  abstract transfer(): Promise<undefined>;
}
