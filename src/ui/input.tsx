import { InputHTMLAttributes, forwardRef } from "react";

interface Props {
  inputChildren?: JSX.Element;
}

export default forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Props>(function Input(
  { className, inputChildren, ...rest },
  ref,
) {
  return (
    <div className="relative w-full">
      <input
        className={`focus-visible:outline-none disabled:cursor-not-allowed ${
          inputChildren ? "text-transparent" : ""
        } ${className}`}
        ref={ref}
        {...rest}
      />
      {inputChildren && <div className="absolute bottom-0 left-0 right-0 top-0 truncate">{inputChildren}</div>}
    </div>
  );
});
