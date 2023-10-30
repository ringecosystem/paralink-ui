import { BaseBridge } from "./base";
import { BN, BN_ZERO, bnToBn, u8aToHex } from "@polkadot/util";
import { Asset, XcmVersionedMultiAsset } from "@/types";
import { ApiPromise } from "@polkadot/api";
import { decodeAddress } from "@polkadot/util-crypto";
import type { XcmV3WeightLimit, XcmVersionedMultiLocation, XcmVersionedMultiAssets } from "@polkadot/types/lookup";

/**
 * Supported wallets: Talisman
 */

export class SubstrateBridge extends BaseBridge {
  constructor(args: { api: ApiPromise }) {
    super(args);
  }

  async transfer(): Promise<undefined> {
    return;
  }

  /**
   * From Pangolin to Asset-Hub
   * @param recipient Address
   * @param amount Transfer amount
   * @param asset Asset on target chain
   * @returns Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>
   */
  async _transferAsset(recipient: string, amount: BN, asset: Asset) {
    const section = "xTokens";
    const method = "transferMultiasset";
    const fn = this.api.tx[section][method];

    const Parachain = bnToBn(1000); // ParachainID of Asset-Hub

    const _asset = this.api.registry.createType<XcmVersionedMultiAsset>("XcmVersionedMultiAsset", {
      V3: {
        id: {
          Concrete: {
            parents: 1,
            interior: {
              X3: [{ Parachain }, { PalletInstance: 50 }, { GeneralIndex: bnToBn(asset.id) }],
            },
          },
        },
        fun: { Fungible: amount },
      },
    });
    const _dest = this.api.registry.createType<XcmVersionedMultiLocation>("XcmVersionedMultiLocation", {
      V3: {
        parents: 1,
        interior: {
          X2: [{ Parachain }, { AccountId32: { network: null, id: u8aToHex(decodeAddress(recipient)) } }],
        },
      },
    });
    const _destWeightLimit = this.api.registry.createType<XcmV3WeightLimit>("XcmV3WeightLimit", { Unlimited: null });

    const extrinsic = fn(_asset, _dest, _destWeightLimit);
    return extrinsic;
  }

  /**
   * From Asset-Hub to Pangolin
   * @param recipient Address
   * @param amount Transfer amount
   * @param asset Asset on source chain
   * @returns Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>
   */
  async _limitedReserveTransferAsset(recipient: string, amount: BN, asset: Asset) {
    const section = "polkadotXcm";
    const method = "limitedReserveTransferAssets";
    const fn = this.api.tx[section][method];

    const Parachain = bnToBn(2105); // ParachainID of Pangolin

    const _dest: XcmVersionedMultiLocation = this.api.registry.createType<XcmVersionedMultiLocation>(
      "XcmVersionedMultiLocation",
      { V3: { parents: 1, interior: { X1: { Parachain } } } },
    );
    const _beneficiary: XcmVersionedMultiLocation = this.api.registry.createType<XcmVersionedMultiLocation>(
      "XcmVersionedMultiLocation",
      { V3: { parents: 0, interior: { X1: { AccountKey20: { network: null, key: recipient } } } } },
    );
    const _assets: XcmVersionedMultiAssets = this.api.registry.createType<XcmVersionedMultiAssets>(
      "XcmVersionedMultiAssets",
      {
        V3: [
          {
            id: {
              Concrete: {
                parents: 0,
                interior: { X2: [{ PalletInstance: 50 }, { GeneralIndex: bnToBn(asset.id) }] },
              },
            },
            fun: { Fungible: amount },
          },
        ],
      },
    );
    const _feeAssetItem = BN_ZERO;
    const _weightLimit: XcmV3WeightLimit = this.api.registry.createType<XcmV3WeightLimit>("XcmV3WeightLimit", {
      Unlimited: null,
    });

    const extrinsic = fn(_dest, _beneficiary, _assets, _feeAssetItem, _weightLimit);
    return extrinsic;
  }
}
