import { Asset, ChainConfig, Cross } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { BN_ZERO } from "@polkadot/util";

export abstract class BaseBridge {
  protected readonly cross: Cross | undefined;
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
  async getSourceNativeBalance(address: string) {
    const balancesAll = await this.sourceApi.derive.balances.all(address);
    const locked = balancesAll.lockedBalance;
    const transferrable = balancesAll.availableBalance;
    const total = balancesAll.freeBalance.add(balancesAll.reservedBalance);
    return { transferrable, locked, total, currency: this.transferSource.chain.nativeCurrency };
  }

  /**
   * Token name, symbol and decimals: api.query.assets.metadata
   */
  async getSourceAssetBalance(address: string) {
    let value = BN_ZERO;
    const { asset } = this.transferSource;

    const assetOption = await this.sourceApi.query.assets.account(asset.id, address);
    if (assetOption.isSome) {
      value = assetOption.unwrap().balance;
    }
    return { value, asset };
  }

  abstract transfer(): Promise<undefined>;
}
