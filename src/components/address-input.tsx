import Input from "@/ui/input";
import { ChangeEventHandler, useCallback } from "react";

interface Props {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export default function AddressInput({ value, placeholder, onChange = () => undefined }: Props) {
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      onChange(e.target.value);
    },
    [onChange],
  );
  return (
    <Input
      className="h-10 w-full bg-transparent px-middle"
      placeholder={placeholder ?? "Enter an address"}
      value={value ?? ""} // Keep it as a controlled component
      onChange={handleChange}
    />
  );
}
