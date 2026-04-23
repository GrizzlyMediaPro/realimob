import {
  getOrCreatePlatformSettings,
  type CollaboratorEntry,
  type PlatformSettingsRecord,
} from "@/lib/platformSettings";
import ColaboratoriCarousel from "./ColaboratoriCarousel";

export default async function ColaboratoriSection() {
  let collaborators: CollaboratorEntry[] = [];

  try {
    const settings =
      (await getOrCreatePlatformSettings()) as PlatformSettingsRecord;
    collaborators = settings.collaborators ?? [];
  } catch (error) {
    console.error("ColaboratoriSection settings load failed", error);
  }

  if (collaborators.length === 0) return null;

  return <ColaboratoriCarousel collaborators={collaborators} />;
}
