import Select from "@/ui/select";
import ConnectWallet from "./connect-wallet";

interface Value {
  name?: string;
  address: string;
}

interface Props {
  value?: Value;
  options: Value[];
  onChange?: (value: Value) => void;
}

export default function AddressSelect({ value, options, onChange = () => undefined }: Props) {
  return (
    <Select
      label={value ? <span>{value.address}</span> : undefined}
      placeholder={<span>Select an address</span>}
      sameWidth
      childClassName="flex flex-col py-small"
    >
      {options?.length ? (
        options.map((account) => (
          <button key={account.address} onClick={() => onChange(account)} className="flex items-center gap-small">
            <span>{account.address}</span>
          </button>
        ))
      ) : (
        <div>
          <span>No data</span>
        </div>
      )}

      {value ? null : <ConnectWallet />}
    </Select>
  );
}
