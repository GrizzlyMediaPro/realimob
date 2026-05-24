/** Fișier șablon din `public/` — contract intermediere vânzare/închiriere. */
export const LISTING_INTERMEDIATION_CONTRACT_TEMPLATE_FILENAME =
  "Contract intermediere vanzare inchiriere (1).pdf";

export const LISTING_INTERMEDIATION_CONTRACT_DOWNLOAD_NAME =
  "contract-intermediere-realimob.pdf";

export type ListingIntermediationContractFields = {
  intermediationContractUrl?: string | null;
  intermediationContractFileName?: string | null;
  intermediationContractSubmittedAt?: Date | string | null;
  intermediationContractVerifiedAt?: Date | string | null;
  intermediationContractRejectedAt?: Date | string | null;
  intermediationContractRejectionNote?: string | null;
};

export function hasIntermediationContractUploaded(
  listing: Pick<ListingIntermediationContractFields, "intermediationContractUrl">,
): boolean {
  return Boolean(listing.intermediationContractUrl?.trim());
}

export function isIntermediationContractAwaitingAdmin(
  listing: ListingIntermediationContractFields & { status: string },
): boolean {
  return (
    listing.status === "pending" &&
    Boolean(listing.intermediationContractSubmittedAt) &&
    !listing.intermediationContractVerifiedAt &&
    !listing.intermediationContractRejectedAt
  );
}

export function isIntermediationContractRejected(
  listing: ListingIntermediationContractFields & { status: string },
): boolean {
  return (
    listing.status === "pending" &&
    Boolean(listing.intermediationContractRejectedAt) &&
    !listing.intermediationContractSubmittedAt
  );
}
