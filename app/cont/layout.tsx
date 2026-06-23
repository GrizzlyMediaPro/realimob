import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { requireAuthPage } from "@/lib/requireAuth";

export const metadata: Metadata = buildPageMetadata({
  title: "Contul meu",
  description: "Gestionează contul tău Realimob.",
  path: "/cont",
  noIndex: true,
});

export default async function ContLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthPage();
  return children;
}
