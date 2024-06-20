import { Asset, AssetID, ChainConfig, Cross } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { BN_ZERO, bnToBn, isFunction } from "@polkadot/util";
import { Option, u128 } from "@polkadot/types";
import { parseUnits } from "viem";

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
   * Native Balance
   * Token decimals and symbol: api.rpc.system.properties
   */
  private async getNativeBalance(api: ApiPromise, account: string) {
    const balancesAll = await api.derive.balances.all(account);
    const locked = balancesAll.lockedBalance;
    const transferrable = balancesAll.availableBalance;
    const total = balancesAll.freeBalance.add(balancesAll.reservedBalance);
    return { transferrable, locked, total };
  }
  async getSourceNativeBalance(account: string) {
    const { transferrable } = await this.getNativeBalance(this.sourceApi, account);
    return { amount: transferrable.toBn(), currency: this.sourceChain.nativeCurrency };
  }
  async getTargetNativeBalance(account: string) {
    const { transferrable } = await this.getNativeBalance(this.targetApi, account);
    return { amount: transferrable.toBn(), currency: this.targetChain.nativeCurrency };
  }

  /**
   * Asset Balance
   * Token name, symbol and decimals: api.query.assets.metadata
   */
  private async getAssetBalance(api: ApiPromise, asset: Asset, account: string) {
    let amount = BN_ZERO;

    if (asset.id === AssetID.SYSTEM) {
      amount = (await this.getNativeBalance(api, account)).transferrable;
    } else if (isFunction(api.query.assets?.account)) {
      const assetOption = await api.query.assets.account(asset.id, account);
      amount = assetOption.isSome ? assetOption.unwrap().balance.toBn() : BN_ZERO;
    } else if (isFunction(api.query.tokens?.accounts)) {
      const { free } = (await api.query.tokens.accounts(account, asset.id)).toJSON() as { free?: string };
      amount = bnToBn(free ?? 0);
    }

    const { symbol, name, decimals } = asset;
    return { currency: { symbol, name, decimals }, amount };
  }
  async getSourceAssetBalance(account: string) {
    return this.getAssetBalance(this.sourceApi, this.sourceAsset, account);
  }
  async getTargetAssetBalance(account: string) {
    return this.getAssetBalance(this.targetApi, this.targetAsset, account);
  }

  async getFeeBalanceOnSourceChain(account: string) {
    const asset = this.sourceChain.assets.find(({ id }) => id === this.cross?.fee.asset.local.id);
    if (asset) {
      return this.getAssetBalance(this.sourceApi, asset, account);
    }
  }

  /**
   * Supply
   */
  private async getAssetSupply(api: ApiPromise, asset: Asset) {
    let amount = BN_ZERO;
    if (asset.id === AssetID.SYSTEM) {
    } else if (isFunction(api.query.assets?.asset)) {
      const detailsOption = await api.query.assets.asset(asset.id);
      amount = detailsOption.isSome ? detailsOption.unwrap().supply.toBn() : BN_ZERO;
    } else if (isFunction(api.query.tokens?.totalIssuance)) {
      amount = bnToBn((await api.query.tokens.totalIssuance(asset.id)).toString());
    }
    const { symbol, name, decimals } = asset;
    return { currency: { symbol, name, decimals }, amount };
  }
  async getSourceAssetSupply() {
    return this.getAssetSupply(this.sourceApi, this.sourceAsset);
  }
  async getTargetAssetSupply() {
    return this.getAssetSupply(this.targetApi, this.targetAsset);
  }

  async getAssetLimitOnTargetChain() {
    const section = "assetLimit";
    const method = "foreignAssetLimit";
    const fn = this.targetApi.query[section]?.[method];

    const { symbol, name, decimals, origin } = this.targetAsset;
    let amount = bnToBn(parseUnits(Number.MAX_SAFE_INTEGER.toString(), decimals));

    if (isFunction(fn) && origin.id !== AssetID.SYSTEM) {
      const limitOption = await (fn({
        Xcm: {
          parents: origin.parachainId === this.targetChain.parachainId ? 0 : 1,
          interior: {
            X3: [
              { Parachain: origin.parachainId },
              { PalletInstance: origin.palletInstance },
              { GeneralIndex: origin.id },
            ],
          },
        },
      }) as Promise<Option<u128>>);
      amount = limitOption.isSome ? limitOption.unwrap().toBn() : amount;
    }
    return { currency: { symbol, name, decimals }, amount };
  }

  /**
   * Existential Deposit
   */
  private getExistentialDeposit(api: ApiPromise) {
    const section = "balances";
    const method = "existentialDeposit";
    const c = api.consts[section]?.[method];
    return c ? c.toBn() : BN_ZERO;
  }
  async getSourceExistentialDeposit() {
    const amount = await this.getExistentialDeposit(this.sourceApi);
    return { currency: this.sourceChain.nativeCurrency, amount };
  }
  async getTargetExistentialDeposit() {
    const amount = await this.getExistentialDeposit(this.targetApi);
    return { currency: this.targetChain.nativeCurrency, amount };
  }
}
