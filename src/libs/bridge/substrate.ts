import { BaseBridge } from "./base";
import { BN, BN_ZERO, bnToBn, u8aToHex } from "@polkadot/util";
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
   * From Pangolin to Asset-Hub
   * @param recipient Address
   * @param amount Transfer amount
   * @returns Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>
   */
  async transferAsset(recipient: string, amount: BN) {
    const section = "xTokens";
    const method = "transferMultiasset";
    const fn = this.sourceApi.tx[section][method];

    const Parachain = bnToBn(this.targetChain.parachainId);

    const _asset = {
      V3: {
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
    };
    const _dest = {
      V3: {
        parents: 1,
        interior: {
          X2: [{ Parachain }, { AccountId32: { network: null, id: u8aToHex(decodeAddress(recipient)) } }],
        },
      },
    };
    const _destWeightLimit = { Unlimited: null };

    const extrinsic = fn(_asset, _dest, _destWeightLimit);
    return extrinsic;
  }

  /**
   * From Asset-Hub to Pangolin
   * @param recipient Address
   * @param amount Transfer amount
   * @returns Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>
   */
  async limitedReserveTransferAsset(recipient: string, amount: BN) {
    const section = "polkadotXcm";
    const method = "limitedReserveTransferAssets";
    const fn = this.sourceApi.tx[section][method];

    const Parachain = bnToBn(this.targetChain.parachainId);

    const _dest = { V3: { parents: 1, interior: { X1: { Parachain } } } };
    const _beneficiary = { V3: { parents: 0, interior: { X1: { AccountKey20: { network: null, key: recipient } } } } };
    const _assets = {
      V3: [
        {
          id: {
            Concrete: {
              parents: 0,
              interior: { X2: [{ PalletInstance: 50 }, { GeneralIndex: bnToBn(this.sourceAsset.id) }] },
            },
          },
          fun: { Fungible: amount },
        },
      ],
    };
    const _feeAssetItem = BN_ZERO;
    const _weightLimit = { Unlimited: null };

    const extrinsic = fn(_dest, _beneficiary, _assets, _feeAssetItem, _weightLimit);
    return extrinsic;
  }
}
