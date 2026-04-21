import { prisma } from "@/lib/prisma";

export const PLATFORM_SETTINGS_KEY = "global";

type RawPlatformSettings = Awaited<
  ReturnType<typeof prisma.platformSettings.findUnique>
>;
type ExistingPlatformSettings = NonNullable<RawPlatformSettings>;

export type PlatformSettingsRecord = ExistingPlatformSettings & {
  collaboratorsTitle: string | null;
  collaboratorsImageUrl: string | null;
  collaboratorsDescription: string | null;
};

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
    >;

  return {
    ...settings,
    collaboratorsTitle: rawSettings.collaboratorsTitle ?? null,
    collaboratorsImageUrl: rawSettings.collaboratorsImageUrl ?? null,
    collaboratorsDescription: rawSettings.collaboratorsDescription ?? null,
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
