import {
  computePresetRange,
  parseUtcDateParam,
} from "@/lib/adminAnalyticsRange";

/**
 * URL pentru GET analitice.
 * `null` = interval personalizat incomplet (nu încărcăm date).
 */
export function resolveAdminAnalyticsFetchUrl(
  params: URLSearchParams
): string | null {
  const interval = params.get("interval") ?? "all";
  if (!interval || interval === "all") return "/api/admin/analytics";

  if (interval === "custom") {
    const f = params.get("from");
    const t = params.get("to");
    if (!f || !t || !parseUtcDateParam(f) || !parseUtcDateParam(t)) {
      return null;
    }
    return `/api/admin/analytics?from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}`;
  }

  if (
    interval === "luna" ||
    interval === "l3" ||
    interval === "l6" ||
    interval === "l12"
  ) {
    const { from, to } = computePresetRange(interval, new Date());
    return `/api/admin/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  }

  return "/api/admin/analytics";
}
