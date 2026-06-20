"use client";

import { useCallback, useEffect, useState } from "react";
import { MdAccessTime, MdFavorite, MdVisibility } from "react-icons/md";
import { GlassDivider, GlassStatsCard } from "./LiquidGlassCards";

type ListingStatsCardProps = {
  listingId: string;
  zilePostat?: number;
  initialViewCount?: number;
  initialFavoriteCount?: number;
};

export const LISTING_FAVORITES_CHANGED_EVENT = "listing-favorites-changed";

export default function ListingStatsCard({
  listingId,
  zilePostat,
  initialViewCount = 0,
  initialFavoriteCount = 0,
}: ListingStatsCardProps) {
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);

  const refreshStats = useCallback(async (recordView: boolean) => {
    try {
      const response = await fetch(
        `/api/public/listings/${listingId}/stats`,
        {
          method: recordView ? "POST" : "GET",
          cache: "no-store",
        },
      );
      if (!response.ok) return undefined;
      const data = (await response.json()) as {
        viewCount?: number;
        favoriteCount?: number;
      };
      if (typeof data.viewCount === "number") setViewCount(data.viewCount);
      if (typeof data.favoriteCount === "number") {
        setFavoriteCount(data.favoriteCount);
      }
      return data;
    } catch {
      return undefined;
    }
  }, [listingId]);

  useEffect(() => {
    const sessionKey = `listing-view-recorded:v2:${listingId}`;
    const alreadyRecorded =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(sessionKey) === "1";

    if (alreadyRecorded) {
      void refreshStats(false);
      return;
    }

    void (async () => {
      const data = await refreshStats(true);
      if (data == null) return;
      try {
        window.sessionStorage.setItem(sessionKey, "1");
      } catch {
        /* ignore */
      }
    })();
  }, [listingId, refreshStats]);

  useEffect(() => {
    const onFavoritesChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ listingId?: string }>).detail;
      if (detail?.listingId && detail.listingId !== listingId) return;
      void refreshStats(false);
    };

    window.addEventListener(LISTING_FAVORITES_CHANGED_EVENT, onFavoritesChanged);
    return () => {
      window.removeEventListener(
        LISTING_FAVORITES_CHANGED_EVENT,
        onFavoritesChanged,
      );
    };
  }, [listingId, refreshStats]);

  const showStatsDivider =
    zilePostat !== undefined && (viewCount > 0 || favoriteCount > 0);

  return (
    <GlassStatsCard>
      {zilePostat !== undefined && (
        <div className="relative z-2 flex items-center gap-3">
          <MdAccessTime className="text-gray-500 dark:text-gray-400 text-lg shrink-0" />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Postat acum {zilePostat} {zilePostat === 1 ? "zi" : "zile"}
          </div>
        </div>
      )}
      {showStatsDivider && <GlassDivider />}
      <div className="relative z-2 flex items-center gap-3">
        <MdVisibility className="text-gray-500 dark:text-gray-400 text-lg shrink-0" />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {viewCount.toLocaleString("ro-RO")} vizualizări
        </div>
      </div>
      <GlassDivider />
      <div className="relative z-2 flex items-center gap-3">
        <MdFavorite className="text-gray-500 dark:text-gray-400 text-lg shrink-0" />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {favoriteCount.toLocaleString("ro-RO")}{" "}
          {favoriteCount === 1 ? "favorit" : "favorite"}
        </div>
      </div>
    </GlassStatsCard>
  );
}
