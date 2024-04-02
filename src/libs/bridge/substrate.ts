import { BaseBridge } from "./base";
import { BN, bnToBn, u8aToHex } from "@polkadot/util";
import { Asset, ChainConfig } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { decodeAddress } from "@polkadot/util-crypto";

/**
 * Supported wallets: Talisman
 */

export class SubstrateBridge extends BaseBridge {
  constructor(args: {
    sourceApi: ApiPromise;
    targetApi: ApiPromise;
    sourceChain: ChainConfig;
    targetChain: ChainConfig;
    sourceAsset: Asset;
    targetAsset: Asset;
  }) {
    super(args);
  }

  async transfer(): Promise<undefined> {
    return;
  }

  /**
   * To Asset-Hub
   * @param recipient Address
   * @param amount Transfer amount
   * @returns Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>
   */
  async transferAssets(recipient: string, amount: BN) {
    const section = "xTokens";
    const method = "transferMultiassets";
    const fn = this.sourceApi.tx[section][method];

    const Parachain = bnToBn(this.targetChain.parachainId);
    const assetItems = [
      {
        id: {
          Concrete: {
            parents: 1,
            interior: {
              X3: [{ Parachain }, { PalletInstance: 50 }, { GeneralIndex: bnToBn(this.targetAsset.id) }],
            },
          },
        },
        fun: { Fungible: amount },
      },
    ];
    if (this.cross && this.cross.fee.asset.symbol !== this.cross.target.symbol) {
      assetItems.push({
        id: {
          Concrete: {
            parents: 1,
            interior: {
              X3: [{ Parachain }, { PalletInstance: 50 }, { GeneralIndex: bnToBn(this.cross.fee.asset.id) }],
            },
          },
        },
        fun: { Fungible: this.cross.fee.amount },
      });
    }

    const _assets = { V3: assetItems };
    const _feeAssetItem = bnToBn(assetItems.length - 1);
    const _dest = {
      V3: {
        parents: 1,
        interior: {
          X2: [{ Parachain }, { AccountId32: { network: null, id: u8aToHex(decodeAddress(recipient)) } }],
        },
      },
    };
    const _destWeightLimit = { Unlimited: null };

    const extrinsic = fn(_assets, _feeAssetItem, _dest, _destWeightLimit);
    return extrinsic;
  }

  /**
   * From Asset-Hub
   * @param recipient Address
   * @param amount Transfer amount
   * @returns Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>
   */
  async limitedReserveTransferAssets(recipient: string, amount: BN) {
    const section = "polkadotXcm";
    const method = "limitedReserveTransferAssets";
    const fn = this.sourceApi.tx[section][method];

    const Parachain = bnToBn(this.targetChain.parachainId);
    const assetItems = [
      {
        id: {
          Concrete: {
            parents: 0,
            interior: { X2: [{ PalletInstance: 50 }, { GeneralIndex: bnToBn(this.sourceAsset.id) }] },
          },
        },
        fun: { Fungible: amount },
      },
    ];
    if (this.cross && this.cross.fee.asset.symbol !== this.cross.target.symbol) {
      assetItems.push({
        id: {
          Concrete: {
            parents: 0,
            interior: { X2: [{ PalletInstance: 50 }, { GeneralIndex: bnToBn(this.cross.fee.asset.id) }] },
          },
        },
        fun: { Fungible: this.cross.fee.amount },
      });
    }

    const _dest = { V3: { parents: 1, interior: { X1: { Parachain } } } };
    const _beneficiary = { V3: { parents: 0, interior: { X1: { AccountKey20: { network: null, key: recipient } } } } };
    const _assets = { V3: assetItems };
    const _feeAssetItem = bnToBn(assetItems.length - 1);
    const _weightLimit = { Unlimited: null };

    const extrinsic = fn(_dest, _beneficiary, _assets, _feeAssetItem, _weightLimit);
    return extrinsic;
  }
}
