import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { requireAuthPage } from "@/lib/requireAuth";

export const metadata: Metadata = buildPageMetadata({
  title: "Panou agent imobiliar",
  description: "Panou agent Realimob.",
  path: "/agent",
  noIndex: true,
});

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthPage();
  return children;
}
