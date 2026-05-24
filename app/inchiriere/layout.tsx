import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Apartamente de închiriat în București",
  description:
    "Anunțuri de închiriere în București — apartamente, case și spații comerciale. Chirie lunară, locație pe hartă și contact direct cu agenții Realimob.",
  path: "/inchiriere",
  keywords: [
    "apartamente de închiriat București",
    "chirie apartament București",
    "închiriere garsonieră București",
    "imobiliare închiriere București",
  ],
});

export default function InchiriereLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
