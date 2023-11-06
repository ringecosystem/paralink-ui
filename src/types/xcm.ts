import type { Enum } from "@polkadot/types-codec";
import type { XcmV2MultiAsset, XcmV3MultiAsset } from "@polkadot/types/lookup";

interface XcmV2MultiassetMultiAsset extends XcmV2MultiAsset {}
interface XcmV3MultiassetMultiAsset extends XcmV3MultiAsset {}

export interface XcmVersionedMultiAsset extends Enum {
  readonly isV2: boolean;
  readonly asV2: XcmV2MultiassetMultiAsset;
  readonly isV3: boolean;
  readonly asV3: XcmV3MultiassetMultiAsset;
  readonly type: "V2" | "V3";
}
