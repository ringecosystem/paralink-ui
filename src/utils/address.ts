import { AddressType } from "@/types";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from "@polkadot/util";
import { isAddress } from "viem";

function isValidAddressPolkadotAddress(address: string) {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
    return true;
  } catch (error) {
    return false;
  }
}

export function isValidAddress(address: string, addressType: AddressType) {
  return addressType === "evm" ? isAddress(address) : isValidAddressPolkadotAddress(address);
}
