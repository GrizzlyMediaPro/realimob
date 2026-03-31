import { prisma } from "@/lib/prisma";

export const PLATFORM_SETTINGS_KEY = "global";

export async function getOrCreatePlatformSettings() {
  const existing = await prisma.platformSettings.findUnique({
    where: { key: PLATFORM_SETTINGS_KEY },
  });
  if (existing) return existing;
  return prisma.platformSettings.create({
    data: { key: PLATFORM_SETTINGS_KEY },
  });
}
