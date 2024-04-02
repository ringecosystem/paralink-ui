import InputSelect from "@/ui/input-select";
import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef } from "react";
import ConnectWallet from "./connect-wallet";
import { WalletAccount } from "@talismn/connect-wallets";
import { isValidAddress } from "@/utils";
import { useTransfer } from "@/hooks";
import AddressIdenticon from "./address-identicon";

interface Value {
  name?: string;
  address: string;
  valid: boolean;
}

interface Props {
  canInput?: boolean;
  who: "sender" | "recipient";
  value?: Value;
  options?: Pick<Value, "address" | "name">[];
  accounts?: WalletAccount[];
  placeholder?: string;
  onClear?: (value: undefined) => void;
  onChange?: (value: Value | undefined) => void;
  onAccountChange?: (account: WalletAccount) => void;
}

export default function AddressInput({
  who,
  value,
  options,
  accounts,
  placeholder,
  canInput,
  onClear,
  onChange = () => undefined,
  onAccountChange = () => undefined,
}: Props) {
  const { sourceChain, targetChain } = useTransfer();

  const addressType = useMemo(
    () => (who === "sender" ? sourceChain.addressType : targetChain.addressType),
    [who, sourceChain, targetChain],
  );
  const addressTypeRef = useRef(addressType);

  const handleClear = useCallback(() => onClear && onClear(undefined), [onClear]);

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (canInput) {
        const address = e.target.value;
        const valid = address ? isValidAddress(address, addressType) : true;
        onChange({ valid, address });
      }
    },
    [addressType, canInput, onChange],
  );

  // Fire onChange to update `valid`
  useEffect(() => {
    if (addressType !== addressTypeRef.current && value) {
      onChange(who === "sender" ? undefined : { ...value, valid: isValidAddress(value.address, addressType) });
    }
    addressTypeRef.current = addressType;
  }, [who, value, addressType, onChange]);

  return (
    <InputSelect
      sameWidth
      clearable
      clickable={!!options?.length || !canInput}
      canInput={canInput}
      innerSuffix={<ConnectWallet who={who} height="full" />}
      wrapClassName={`h-12 bg-transparent flex items-center justify-between p-1 border border-radius transition-colors duration-200 ${
        value?.valid === false ? "border-alert" : "border-transparent"
      }`}
      inputClassName="w-full border-radius h-full bg-transparent px-1"
      childClassName="flex flex-col py-middle bg-component border-primary border border-radius max-h-60 overflow-y-auto"
      placeholder={placeholder ?? "Address"}
      value={value?.address ?? ""} // Keep it as a controlled component
      alert={value?.valid === false ? "* Unavailable address" : ""}
      onClear={handleClear}
      onChange={handleChange}
    >
      {options?.length ? (
        options.map((account, index) => (
          <button
            key={account.address}
            onClick={() => {
              onChange({ ...account, valid: isValidAddress(account.address, addressType) });
              if (accounts?.at(index)) {
                onAccountChange(accounts[index]);
              }
            }}
            disabled={!isValidAddress(account.address, addressType)}
            className="flex items-center gap-middle px-middle py-1 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <AddressIdenticon size={20} address={account.address} />
            <span className="truncate text-sm font-medium">{account.name || account.address}</span>
          </button>
        ))
      ) : (
        <div className="inline-flex justify-center px-middle py-small">
          <span className="text-sm font-medium text-slate-400">No data</span>
        </div>
      )}
    </InputSelect>
  );
}
