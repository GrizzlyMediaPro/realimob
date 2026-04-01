/**
 * Câmpuri stocate în Clerk publicMetadata.agentApplication
 * pentru fluxul de înregistrare agent + contract.
 */
export type AgentApplicationMetadata = {
  buletinUrl?: string;
  formaOrganizare?: string;
  cui?: string;
  telefon?: string;
  gdprAcceptedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionMessage?: string;
  contractTemplateUrl?: string;
  contractTemplateFileName?: string;
  contractSentAt?: string;
  signedContractUrl?: string;
  signedContractFileName?: string;
  signedUploadedAt?: string;
};
