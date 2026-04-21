import {
  getOrCreatePlatformSettings,
  type PlatformSettingsRecord,
} from "@/lib/platformSettings";
import ListingDescriptionDisplay from "./ListingDescriptionDisplay";

export default async function ColaboratoriSection() {
  let title: string | null = null;
  let imageUrl: string | null = null;
  let description: string | null = null;

  try {
    const settings =
      (await getOrCreatePlatformSettings()) as PlatformSettingsRecord;
    title = settings.collaboratorsTitle ?? null;
    imageUrl = settings.collaboratorsImageUrl ?? null;
    description = settings.collaboratorsDescription ?? null;
  } catch (error) {
    console.error("ColaboratoriSection settings load failed", error);
  }

  const hasSectionContent =
    Boolean((title ?? "").trim()) ||
    Boolean((imageUrl ?? "").trim()) ||
    Boolean((description ?? "").trim());
  if (!hasSectionContent) return null;

  return (
    <section className="px-4 md:px-8 py-14 md:py-16">
      <div className="w-full max-w-[1250px] mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/70 to-[#C25A2B]/[0.08] dark:from-white/[0.08] dark:via-white/[0.04] dark:to-[#C25A2B]/[0.14] backdrop-blur-sm p-6 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,90,43,0.18),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(194,90,43,0.22),transparent_45%)]" />
          {title ? (
            <h2
              className="relative text-2xl md:text-4xl font-bold text-foreground mb-6 md:mb-7 tracking-tight"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              {title}
            </h2>
          ) : null}

          <div className="relative grid md:grid-cols-[1.05fr_1fr] gap-6 md:gap-10 items-start">
            {imageUrl ? (
              <div className="rounded-3xl p-3 md:p-4 ">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={title?.trim() || "Colaboratori"}
                  className="w-full h-auto max-h-[480px] object-contain rounded-2xl"
                />
              </div>
            ) : null}

            <div className="rounded-2xl   p-5 md:p-6">
              {description ? (
                <ListingDescriptionDisplay html={description} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
