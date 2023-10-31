import { ApiPromise } from "@polkadot/api";

export abstract class BaseBridge {
  protected readonly api: ApiPromise;

  constructor(args: { api: ApiPromise }) {
    this.api = args.api;
  }

  abstract transfer(): Promise<undefined>;
}
