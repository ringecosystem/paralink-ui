import { BaseBridge } from "./base";
import { BN, u8aToHex } from "@polkadot/util";
import { Asset, ChainConfig } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { decodeAddress } from "@polkadot/util-crypto";

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

  async transfer(recipient: string, amount: BN) {
    switch (`${this.cross?.section}.${this.cross?.method}`) {
      case "xTokens.transferMultiassets":
        return this.xTokensTransferMultiassets(recipient, amount);
      case "polkadotXcm.limitedReserveTransferAssets":
        return this.polkadotXcmLimitedReserveTransferAssets(recipient, amount);
      case "polkadotXcm.reserveTransferAssets":
        return this.polkadotXcmReserveTransferAssets(recipient, amount);
      case "xTokens.transferMultiasset":
        return this.xTokensTransferMultiasset(recipient, amount);
    }
  }

  /**
   * To Assethub
   * @param recipient Address
   * @param amount Transfer amount
   * @returns Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>
   */
  private async xTokensTransferMultiassets(recipient: string, amount: BN) {
    const section = "xTokens";
    const method = "transferMultiassets";
    const fn = this.sourceApi.tx[section][method];

    const assetItems = [
      {
        id: {
          Concrete: {
            parents: this.sourceAsset.origin.parachainId === this.sourceChain.parachainId ? 0 : 1,
            interior: {
              X3: [
                { Parachain: this.sourceAsset.origin.parachainId },
                { PalletInstance: this.sourceAsset.origin.palletInstance },
                { GeneralIndex: this.sourceAsset.origin.id },
              ],
            },
          },
        },
        fun: { Fungible: amount },
      },
    ];
    if (this.cross && this.cross.fee.asset.local.id !== this.sourceAsset.id) {
      assetItems.push({
        id: {
          Concrete: {
            parents: this.cross.fee.asset.origin.parachainId === this.sourceChain.parachainId ? 0 : 1,
            interior: {
              X3: [
                { Parachain: this.cross.fee.asset.origin.parachainId },
                { PalletInstance: this.cross.fee.asset.origin.palletInstance },
                { GeneralIndex: this.cross.fee.asset.origin.id },
              ],
            },
          },
        },
        fun: { Fungible: this.cross.fee.amount },
      });
    }

    const _assets = { V3: assetItems };
    const _feeAssetItem = assetItems.length - 1;
    const _dest = {
      V3: {
        parents: 1,
        interior: {
          X2: [
            { Parachain: this.targetChain.parachainId },
            { AccountId32: { network: null, id: u8aToHex(decodeAddress(recipient)) } },
          ],
        },
      },
    };
    const _destWeightLimit = { Unlimited: null };

    const extrinsic = fn(_assets, _feeAssetItem, _dest, _destWeightLimit);
    return extrinsic;
  }

  /**
   * From Assethub
   * @param recipient Address
   * @param amount Transfer amount
   * @returns Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>
   */
  private async polkadotXcmLimitedReserveTransferAssets(recipient: string, amount: BN) {
    const section = "polkadotXcm";
    const method = "limitedReserveTransferAssets";
    const fn = this.sourceApi.tx[section][method];

    const assetItems = [
      {
        id: {
          Concrete: {
            parents: this.sourceAsset.origin.parachainId === this.sourceChain.parachainId ? 0 : 1,
            interior: {
              X2: [
                { PalletInstance: this.sourceAsset.origin.palletInstance },
                { GeneralIndex: this.sourceAsset.origin.id },
              ],
            },
          },
        },
        fun: { Fungible: amount },
      },
    ];
    if (this.cross && this.cross.fee.asset.local.id !== this.sourceAsset.id) {
      assetItems.push({
        id: {
          Concrete: {
            parents: this.cross.fee.asset.origin.parachainId === this.sourceChain.parachainId ? 0 : 1,
            interior: {
              X2: [
                { PalletInstance: this.cross.fee.asset.origin.palletInstance },
                { GeneralIndex: this.cross.fee.asset.origin.id },
              ],
            },
          },
        },
        fun: { Fungible: this.cross.fee.amount },
      });
    }

    const _dest = { V3: { parents: 1, interior: { X1: { Parachain: this.targetChain.parachainId } } } };
    const _beneficiary = { V3: { parents: 0, interior: { X1: { AccountKey20: { network: null, key: recipient } } } } };
    const _assets = { V3: assetItems };
    const _feeAssetItem = assetItems.length - 1;
    const _weightLimit = { Unlimited: null };

    const extrinsic = fn(_dest, _beneficiary, _assets, _feeAssetItem, _weightLimit);
    return extrinsic;
  }

  /**
   * Transfer RING from Darwinia to HydraDX
   * Refer https://github.com/darwinia-network/assethub-bridge-ui/issues/29#issuecomment-2167207048
   * @param recipient Address
   * @param amount Transfer amount
   * @returns Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>
   */
  private async polkadotXcmReserveTransferAssets(recipient: string, amount: BN) {
    const section = "polkadotXcm";
    const method = "reserveTransferAssets";
    const fn = this.sourceApi.tx[section][method];

    const _dest = { V2: { parents: 1, interior: { X1: { Parachain: this.targetChain.parachainId } } } };
    const _beneficiary = {
      V2: { parents: 0, interior: { X1: { AccountId32: { network: null, id: u8aToHex(decodeAddress(recipient)) } } } },
    };
    const _assets = {
      V2: [
        {
          id: {
            Concrete: { parents: 0, interior: { X1: { PalletInstance: this.sourceAsset.origin.palletInstance } } },
          },
          fun: { Fungible: amount },
        },
      ],
    };
    const _feeAssetItem = 0;

    const extrinsic = fn(_dest, _beneficiary, _assets, _feeAssetItem);
    return extrinsic;
  }

  /**
   * Transfer RING from HydraDX to Darwinia
   * Refer https://github.com/darwinia-network/assethub-bridge-ui/issues/29#issuecomment-2167207048
   * @param recipient Address
   * @param amount Transfer amount
   * @returns Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>
   */
  private async xTokensTransferMultiasset(recipient: string, amount: BN) {
    const section = "xTokens";
    const method = "transferMultiasset";
    const fn = this.sourceApi.tx[section][method];

    const _asset = {
      V2: {
        id: {
          Concrete: {
            parents: this.sourceAsset.origin.parachainId === this.sourceChain.parachainId ? 0 : 1,
            interior: {
              X2: [
                { Parachain: this.sourceAsset.origin.parachainId },
                { PalletInstance: this.sourceAsset.origin.palletInstance },
              ],
            },
          },
        },
        fun: { Fungible: amount },
      },
    };
    const _dest = {
      V2: {
        parents: 1,
        interior: {
          X2: [{ Parachain: this.targetChain.parachainId }, { AccountKey20: { network: null, key: recipient } }],
        },
      },
    };
    const _weightLimit = { Unlimited: null };

    const extrinsic = fn(_asset, _dest, _weightLimit);
    return extrinsic;
  }
}
