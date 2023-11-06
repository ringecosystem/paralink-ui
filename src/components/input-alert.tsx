export function InputAlert({ text }: { text: string }) {
  return (
    <div className="absolute -bottom-5 left-0 inline-flex w-full">
      <span className="text-xs font-light lowercase text-red-500">{text}</span>
    </div>
  );
}
