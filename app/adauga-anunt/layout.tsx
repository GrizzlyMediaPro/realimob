import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { requireAuthPage } from "@/lib/requireAuth";

export const metadata: Metadata = buildPageMetadata({
  title: "Adaugă anunț",
  description: "Publică un anunț imobiliar pe Realimob.",
  path: "/adauga-anunt",
  noIndex: true,
});

export default async function AdaugaAnuntLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthPage();
  return children;
}
