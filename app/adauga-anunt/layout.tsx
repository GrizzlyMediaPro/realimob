import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Adaugă anunț",
  description: "Publică un anunț imobiliar pe Realimob.",
  path: "/adauga-anunt",
  noIndex: true,
});

export default function AdaugaAnuntLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
