import Select from "@/ui/select";
import ConnectWallet from "./connect-wallet";
import { WalletAccount } from "@talismn/connect-wallets";

interface Value {
  name?: string;
  address: string;
}

interface Props {
  value?: Value;
  options?: Value[];
  accounts?: WalletAccount[];
  onChange?: (value: Value) => void;
  onAccountChange?: (account: WalletAccount) => void;
}

export default function AddressSelect({
  value,
  options,
  accounts,
  onChange = () => undefined,
  onAccountChange = () => undefined,
}: Props) {
  return (
    <Select
      label={value ? <span className="truncate">{value.name || value.address}</span> : undefined}
      placeholder={<span className="text-gray-400">Select an address</span>}
      innerSuffix={<ConnectWallet />}
      sameWidth
      labelClassName="flex items-center justify-between w-full pr-1 pl-middle py-1"
      childClassName="flex flex-col py-middle bg-component border-primary border border-radius max-h-60 overflow-y-auto"
    >
      {options?.length ? (
        options.map((account, index) => (
          <button
            key={account.address}
            onClick={() => {
              onChange(account);
              if (accounts?.at(index)) {
                onAccountChange(accounts[index]);
              }
            }}
            className="flex items-center gap-small px-middle py-1 transition-colors hover:bg-white/10"
          >
            <span className="truncate">{account.name || account.address}</span>
          </button>
        ))
      ) : (
        <div className="px-middle py-small">
          <span>No data</span>
        </div>
      )}
    </Select>
  );
}
