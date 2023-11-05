interface Props {
  text: string;
}

export default function Label({ text }: Props) {
  return <span className="">{text}</span>;
}
