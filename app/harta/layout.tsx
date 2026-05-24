import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Hartă imobiliară București",
  description:
    "Explorează anunțurile imobiliare din București pe hartă interactivă. Filtrează după zonă, tip proprietate, transport și puncte de interes.",
  path: "/harta",
  keywords: [
    "hartă imobiliare București",
    "apartamente pe hartă",
    "anunțuri imobiliare hartă",
  ],
});

export default function HartaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
