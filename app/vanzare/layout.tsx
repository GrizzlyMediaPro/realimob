import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Apartamente și case de vânzare în București",
  description:
    "Anunțuri imobiliare de vânzare în București — apartamente, case, garsoniere și spații comerciale. Filtre avansate, hartă și agenți Realimob.",
  path: "/vanzare",
  keywords: [
    "apartamente de vânzare București",
    "case de vânzare București",
    "garsoniere de vânzare",
    "imobiliare vânzare București",
  ],
});

export default function VanzareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
