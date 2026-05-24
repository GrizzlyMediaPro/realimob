import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contul meu",
  description: "Gestionează contul tău Realimob.",
  path: "/cont",
  noIndex: true,
});

export default function ContLayout({ children }: { children: React.ReactNode }) {
  return children;
}
