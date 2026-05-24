import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Toate anunțurile imobiliare din București",
  description:
    "Listă completă de anunțuri imobiliare în București — vânzare și închiriere. Caută după zonă, preț, camere și vezi proprietățile pe hartă.",
  path: "/anunturi",
  keywords: [
    "anunțuri imobiliare București",
    "listă apartamente București",
    "proprietăți București",
  ],
});

export default function AnunturiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
