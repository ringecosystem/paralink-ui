import { Asset } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { BN, BN_ZERO } from "@polkadot/util";

export abstract class BaseBridge {
  protected readonly api: ApiPromise;

  constructor(args: { api: ApiPromise }) {
    this.api = args.api;
  }

  abstract transfer(): Promise<undefined>;

  /**
   * Token decimals and symbol: api.rpc.system.properties
   */
  async getNativeTokenBalance(address: string) {
    const balancesAll = await this.api.derive.balances.all(address);
    const locked = balancesAll.lockedBalance;
    const transferrable = balancesAll.availableBalance;
    const total = balancesAll.freeBalance.add(balancesAll.reservedBalance);
    return { transferrable, locked, total };
  }

  /**
   * Token name, symbol and decimals: api.query.assets.metadata
   */
  async getAssetBalance(address: string, asset: Asset) {
    const assetOption = await this.api.query.assets.account(asset.id, address);
    if (assetOption.isSome) {
      const assetBalance = assetOption.unwrap().balance;
      return assetBalance as BN;
    }
    return BN_ZERO;
  }
}
