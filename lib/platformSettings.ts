import { prisma } from "@/lib/prisma";

export const PLATFORM_SETTINGS_KEY = "global";

type RawPlatformSettings = Awaited<
  ReturnType<typeof prisma.platformSettings.findUnique>
>;
type ExistingPlatformSettings = NonNullable<RawPlatformSettings>;

export type CollaboratorEntry = {
  name: string;
  imageUrl: string;
  description: string;
};

export type PlatformSettingsRecord = ExistingPlatformSettings & {
  collaboratorsTitle: string | null;
  collaboratorsImageUrl: string | null;
  collaboratorsDescription: string | null;
  collaborators: CollaboratorEntry[];
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function sanitizeCollaboratorEntry(value: unknown): CollaboratorEntry | null {
  if (!isObject(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const imageUrl =
    typeof value.imageUrl === "string" ? value.imageUrl.trim() : "";
  const description =
    typeof value.description === "string" ? value.description.trim() : "";
  if (!name && !imageUrl && !description) return null;
  return {
    name: name.slice(0, 140),
    imageUrl: imageUrl.slice(0, 1200),
    description: description.slice(0, 12000),
  };
}

export function sanitizeCollaboratorsList(value: unknown): CollaboratorEntry[] {
  if (!Array.isArray(value)) return [];
  const result: CollaboratorEntry[] = [];
  for (const item of value) {
    const entry = sanitizeCollaboratorEntry(item);
    if (entry) result.push(entry);
    if (result.length >= 24) break;
  }
  return result;
}

function normalizePlatformSettings(
  settings: ExistingPlatformSettings
): PlatformSettingsRecord {
  const rawSettings = settings as ExistingPlatformSettings &
    Partial<
      Pick<
        PlatformSettingsRecord,
        | "collaboratorsTitle"
        | "collaboratorsImageUrl"
        | "collaboratorsDescription"
      >
    > & { collaborators?: unknown };

  const collaboratorsTitle = rawSettings.collaboratorsTitle ?? null;
  const collaboratorsImageUrl = rawSettings.collaboratorsImageUrl ?? null;
  const collaboratorsDescription = rawSettings.collaboratorsDescription ?? null;

  let collaborators = sanitizeCollaboratorsList(rawSettings.collaborators);

  // Compatibilitate: dacă lista e goală dar există vechile câmpuri, le folosim ca prim colaborator.
  if (collaborators.length === 0) {
    const fallback = sanitizeCollaboratorEntry({
      name: collaboratorsTitle ?? "",
      imageUrl: collaboratorsImageUrl ?? "",
      description: collaboratorsDescription ?? "",
    });
    if (fallback) collaborators = [fallback];
  }

  return {
    ...settings,
    collaboratorsTitle,
    collaboratorsImageUrl,
    collaboratorsDescription,
    collaborators,
  };
}

export async function getOrCreatePlatformSettings(): Promise<PlatformSettingsRecord> {
  const existing = await prisma.platformSettings.findUnique({
    where: { key: PLATFORM_SETTINGS_KEY },
  });
  if (existing) return normalizePlatformSettings(existing);

  const created = await prisma.platformSettings.create({
    data: { key: PLATFORM_SETTINGS_KEY },
  });
  return normalizePlatformSettings(created);
}
