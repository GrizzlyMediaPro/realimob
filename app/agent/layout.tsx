import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Panou agent imobiliar",
  description: "Panou agent Realimob.",
  path: "/agent",
  noIndex: true,
});

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
