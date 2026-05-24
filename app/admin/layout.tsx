import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/requireAdmin";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Administrare",
  description: "Panou de administrare Realimob.",
  noIndex: true,
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();
  return <>{children}</>;
}
