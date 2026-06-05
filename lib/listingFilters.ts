import type { Anunt } from "./anunturiData";

export const TIP_PROPRIETATE_VALUES = [
  "Apartament",
  "Casă/Vilă",
  "Teren",
  "Comercial",
] as const;

export type TipProprietateValue = (typeof TIP_PROPRIETATE_VALUES)[number];

function normalizePropertyType(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export function listingMatchesPropertyTypeFilter(
  anunt: Pick<Anunt, "propertyType" | "dormitoare" | "suprafataUtil">,
  tipProprietate: string | null,
): boolean {
  const filter = normalizePropertyType(tipProprietate);
  if (!filter) return true;

  const pt = normalizePropertyType(anunt.propertyType);
  if (pt) return pt === filter;

  // Fallback heuristic doar când lipsește propertyType în date vechi
  switch (filter) {
    case "Teren":
      return false;
    case "Comercial":
      return false;
    case "Casă/Vilă":
      return (anunt.suprafataUtil ?? 0) >= 100 || (anunt.dormitoare ?? 0) >= 4;
    case "Apartament":
      return (anunt.dormitoare ?? 0) >= 1;
    default:
      return true;
  }
}

export function listingMatchesCommercialSubtypeFilter(
  anunt: Pick<Anunt, "commercialSubtype" | "propertyType">,
  subtipComercial: string | null,
): boolean {
  const filter = normalizePropertyType(subtipComercial);
  if (!filter) return true;
  if (normalizePropertyType(anunt.propertyType) !== "Comercial") return false;
  return normalizePropertyType(anunt.commercialSubtype) === filter;
}

export function filterByPropertyType(
  anunturi: Anunt[],
  tipProprietate: string | null,
): Anunt[] {
  if (!tipProprietate?.trim()) return anunturi;
  return anunturi.filter((a) => listingMatchesPropertyTypeFilter(a, tipProprietate));
}

export function filterByCommercialSubtype(
  anunturi: Anunt[],
  subtipComercial: string | null,
): Anunt[] {
  if (!subtipComercial?.trim()) return anunturi;
  return anunturi.filter((a) =>
    listingMatchesCommercialSubtypeFilter(a, subtipComercial),
  );
}

export function filterByCategorie(
  anunturi: Anunt[],
  categorie: string | null,
): Anunt[] {
  if (!categorie) return anunturi;

  switch (categorie) {
    case "terenuri":
      return filterByPropertyType(anunturi, "Teren");
    case "spatii-comerciale":
      return filterByPropertyType(anunturi, "Comercial");
    case "case":
    case "case-vile":
      return anunturi.filter((a) => {
        if (a.propertyType) return a.propertyType === "Casă/Vilă";
        return (a.suprafataUtil ?? 0) >= 100 || (a.dormitoare ?? 0) >= 4;
      });
    case "garsoniere":
      return anunturi.filter((a) => {
        if (a.propertyType && a.propertyType !== "Apartament") return false;
        return (a.dormitoare ?? 0) === 1;
      });
    case "apartamente":
      return anunturi.filter((a) => {
        if (a.propertyType && a.propertyType !== "Apartament") return false;
        return (a.dormitoare ?? 0) >= 2 && (a.dormitoare ?? 0) <= 3;
      });
    default:
      return anunturi;
  }
}
