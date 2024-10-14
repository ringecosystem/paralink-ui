import { AddressType, ChainConfig } from "@/types";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from "@polkadot/util";
import { isAddress } from "viem";

function isValidAddressPolkadotAddress(address: string) {
  if (isAddress(address)) {
    return false;
  }
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

export function toShortAdrress(address: string) {
  return address.length > 16 ? `${address.slice(0, 5)}...${address.slice(-4)}` : address;
}

export function formatAddressByChain(address: string | undefined, chain: ChainConfig) {
  return address && !isAddress(address) && chain.addressType === "substrate"
    ? encodeAddress(address, chain.ss58Prefix)
    : address;
}
