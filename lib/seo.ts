import type { Metadata } from "next";
import { getFirstListingImageUrl } from "./listingToAnunt";

export const SITE_NAME = "Realimob";
export const SITE_TAGLINE = "Noul standard pentru imobiliarele din București";
export const SITE_DESCRIPTION =
  "Realimob — platformă imobiliară din București pentru apartamente, case și spații comerciale de vânzare sau închiriere. Anunțuri verificate, agenți imobiliari și hartă interactivă.";

export const DEFAULT_KEYWORDS = [
  "imobiliare București",
  "anunțuri imobiliare",
  "apartamente de vânzare București",
  "apartamente de închiriat București",
  "case de vânzare București",
  "chirie apartament București",
  "agenți imobiliari București",
  "platformă imobiliară",
  "Realimob",
  "imobiliare online",
  "proprietăți București",
  "garsoniere București",
  "spații comerciale București",
] as const;

const DEFAULT_OG_IMAGE = "/living.jpg";

/** URL absolut al site-ului (fără slash final). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isRentTransactionType(transactionType: string): boolean {
  const t = transactionType.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  return t.includes("inchiri") || t.includes("închirier");
}

/** Calea canonică publică pentru un anunț aprobat. */
export function getListingCanonicalPath(
  transactionType: string,
  id: string,
): string {
  return isRentTransactionType(transactionType)
    ? `/inchiriere/${id}`
    : `/vanzare/${id}`;
}

export function truncateMetaDescription(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

type BuildMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
};

/** Metadata reutilizabilă pentru pagini statice și dinamice. */
export function buildPageMetadata(options: BuildMetadataOptions): Metadata {
  const {
    title,
    description = SITE_DESCRIPTION,
    path = "/",
    keywords = [...DEFAULT_KEYWORDS],
    image,
    noIndex = false,
    type = "website",
  } = options;

  const canonical = absoluteUrl(path);
  const ogImage = image?.startsWith("http")
    ? image
    : absoluteUrl(image || DEFAULT_OG_IMAGE);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords: [...keywords],
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type,
      locale: "ro_RO",
      url: canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  ...buildPageMetadata({
    title: `${SITE_NAME} — Imobiliare București`,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  applicationName: SITE_NAME,
  authors: [{ name: "Realimob Real Estate S.R.L.", url: absoluteUrl("/") }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "real estate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export type ListingSeoInput = {
  id: string;
  title: string;
  description: string;
  transactionType: string;
  propertyType: string;
  location: string;
  sector?: string | null;
  price: number;
  currency: string;
  images?: unknown;
  updatedAt: Date;
};

export function buildListingMetadata(listing: ListingSeoInput): Metadata {
  const path = getListingCanonicalPath(listing.transactionType, listing.id);
  const txLabel = isRentTransactionType(listing.transactionType) ? "închiriere" : "vânzare";
  const zone = listing.sector?.trim() || listing.location.trim();
  const priceLabel = `${listing.price.toLocaleString("ro-RO")} ${listing.currency}`;
  const metaDescription = truncateMetaDescription(
    listing.description ||
      `${listing.title} — ${listing.propertyType} la ${txLabel} în ${zone}, ${priceLabel}. Vezi detalii și contactează agentul pe Realimob.`,
  );

  const image = getFirstListingImageUrl(listing.images, DEFAULT_OG_IMAGE);
  const keywords = [
    listing.propertyType,
    `${listing.propertyType} ${zone}`,
    txLabel === "închiriere" ? `chirie ${zone}` : `vânzare ${zone}`,
    `imobiliare ${zone}`,
    ...DEFAULT_KEYWORDS,
  ];

  return buildPageMetadata({
    title: `${listing.title} — ${txLabel} ${zone}`,
    description: metaDescription,
    path,
    keywords,
    image,
    type: "article",
  });
}

/** JSON-LD RealEstateListing pentru paginile de detaliu. */
export function buildListingJsonLd(listing: ListingSeoInput): Record<string, unknown> {
  const path = getListingCanonicalPath(listing.transactionType, listing.id);
  const image = getFirstListingImageUrl(listing.images, DEFAULT_OG_IMAGE);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: truncateMetaDescription(listing.description || listing.title, 500),
    url: absoluteUrl(path),
    datePosted: listing.updatedAt.toISOString(),
    image: imageUrl,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.sector?.trim() || listing.location,
      addressRegion: "București",
      addressCountry: "RO",
    },
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: SITE_NAME,
  url: getSiteUrl(),
  description: SITE_DESCRIPTION,
  areaServed: {
    "@type": "City",
    name: "București",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "contact@realimob.ro",
    availableLanguage: ["Romanian"],
  },
} as const;
