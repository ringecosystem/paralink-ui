import PageWrap from "@/components/page-wrap";
import dynamic from "next/dynamic";

const JayTest = dynamic(() => import("@/components/jay-test"), { ssr: false });

export default function Home() {
  return (
    <PageWrap>
      <JayTest />
    </PageWrap>
  );
}
