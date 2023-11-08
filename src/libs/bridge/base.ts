import { Asset, ChainConfig, Cross } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { BN_ZERO, BN, bnToBn } from "@polkadot/util";
import { Option, u128 } from "@polkadot/types";

export abstract class BaseBridge {
  protected readonly cross: Cross | undefined;
  protected readonly sourceApi: ApiPromise;
  protected readonly targetApi: ApiPromise;
  protected readonly sourceChain: ChainConfig;
  protected readonly targetChain: ChainConfig;
  protected readonly sourceAsset: Asset;
  protected readonly targetAsset: Asset;

  constructor(args: {
    sourceApi: ApiPromise;
    targetApi: ApiPromise;
    sourceChain: ChainConfig;
    targetChain: ChainConfig;
    sourceAsset: Asset;
    targetAsset: Asset;
  }) {
    this.sourceApi = args.sourceApi;
    this.targetApi = args.targetApi;
    this.sourceChain = args.sourceChain;
    this.targetChain = args.targetChain;
    this.sourceAsset = args.sourceAsset;
    this.targetAsset = args.targetAsset;

    this.cross = args.sourceAsset.cross.find(
      ({ target }) => target.network === args.targetChain.network && target.symbol === args.targetAsset.symbol,
    );
  }

  getCrossInfo() {
    return this.cross;
  }

  getSourceChain() {
    return this.sourceChain;
  }

  getTargetChain() {
    return this.targetChain;
  }

  getSourceAsset() {
    return this.sourceAsset;
  }

  getTargetAsset() {
    return this.targetAsset;
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
    return { ...balances, currency: this.sourceChain.nativeCurrency };
  }

  async getTargetNativeBalance(address: string) {
    const balances = await this.getNativeBalance(this.targetApi, address);
    return { ...balances, currency: this.targetChain.nativeCurrency };
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
    const asset = this.sourceAsset;
    const value = await this.getAssetBalance(this.sourceApi, asset, address);
    return { value, asset };
  }

  async getTargetAssetBalance(address: string) {
    const asset = this.targetAsset;
    const value = await this.getAssetBalance(this.targetApi, asset, address);
    return { value, asset };
  }

  /**
   * Supply
   */
  private async getAssetDetails(api: ApiPromise, asset: Asset) {
    const detailsOption = await api.query.assets.asset(asset.id);
    return detailsOption.isSome ? detailsOption.unwrap() : undefined;
  }

  async getSourceAssetDetails() {
    return this.getAssetDetails(this.sourceApi, this.sourceAsset);
  }

  async getTargetAssetDetails() {
    return this.getAssetDetails(this.targetApi, this.targetAsset);
  }

  async getAssetLimit() {
    if (this.sourceChain.hasAssetLimit) {
      const section = "assetLimit";
      const method = "foreignAssetLimit";
      const fn = this.sourceApi.query[section][method];

      const limitOption = await (fn({
        Xcm: {
          parents: 1,
          interior: {
            X3: [
              { Parachain: bnToBn(this.targetChain.parachainId) },
              { PalletInstance: 50 },
              { GeneralIndex: bnToBn(this.targetAsset.id) },
            ],
          },
        },
      }) as Promise<Option<u128>>);

      return limitOption.isSome ? limitOption.unwrap() : undefined;
    }
  }

  abstract transfer(): Promise<undefined>;
}
