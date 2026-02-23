"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CiImageOn } from "react-icons/ci";
import { MdLocationOn } from "react-icons/md";

type AdminListingCardProps = {
  id: string;
  titlu: string;
  image: string;
  pret: string;
  tags: string[];
  locationText: string;
  imageCount: number;
  href: string;
  status?: "active" | "inactive" | "pending";
  deactivationReason?: string;
};

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

const getDeactivationReasonColor = (
  reason: string,
  isDark: boolean
): { background: string; color: string } => {
  switch (reason) {
    case "A trecut prea mult timp":
      return {
        background: isDark
          ? "rgba(245, 158, 11, 0.2)"
          : "rgba(245, 158, 11, 0.15)",
        color: "#F59E0B",
      };
    case "Vandut":
      return {
        background: isDark
          ? "rgba(16, 185, 129, 0.2)"
          : "rgba(16, 185, 129, 0.15)",
        color: "#10B981",
      };
    case "Dezactivat utilizator":
      return {
        background: isDark
          ? "rgba(59, 130, 246, 0.2)"
          : "rgba(59, 130, 246, 0.15)",
        color: "#3B82F6",
      };
    case "Dezactivat admin":
      return {
        background: isDark
          ? "rgba(239, 68, 68, 0.2)"
          : "rgba(239, 68, 68, 0.15)",
        color: "#EF4444",
      };
    default:
      return {
        background: isDark
          ? "rgba(239, 68, 68, 0.2)"
          : "rgba(239, 68, 68, 0.15)",
        color: "#EF4444",
      };
  }
};

export default function AdminListingCard({
  id,
  titlu,
  image,
  pret,
  tags,
  locationText,
  imageCount,
  href,
  status,
  deactivationReason,
}: AdminListingCardProps) {
  const isDark = useDarkMode();

  const cardStyle: React.CSSProperties = {
    background: isDark
      ? "rgba(35, 35, 48, 0.5)"
      : "rgba(255, 255, 255, 0.6)",
    border: isDark
      ? "1px solid rgba(255, 255, 255, 0.12)"
      : "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: isDark
      ? "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
      : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(60px) saturate(1.6)",
    WebkitBackdropFilter: "blur(60px) saturate(1.6)",
    transition: "all 0.2s ease",
  };

  return (
    <Link
      href={href}
      className="block rounded-xl overflow-hidden relative cursor-pointer"
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isDark
          ? "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          : "0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.55)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isDark
          ? "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
          : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Imagine mică */}
        <div className="w-20 h-20 md:w-24 md:h-24 relative shrink-0 overflow-hidden rounded-lg">
          <Image
            src={image}
            alt={titlu}
            fill
            className="object-cover object-center"
          />
          <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs flex items-center gap-1 backdrop-blur-sm">
            <CiImageOn size={12} />
            <span className="text-xs">{imageCount}</span>
          </div>
        </div>

        {/* Conținut */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm md:text-base font-semibold text-foreground mb-1"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {titlu}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <MdLocationOn size={12} />
            <span className="truncate">București, {locationText}</span>
          </div>
          {status === "inactive" && deactivationReason && (
            <div className="mb-1.5">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={getDeactivationReasonColor(deactivationReason, isDark)}
              >
                {deactivationReason}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-base md:text-lg font-bold text-foreground">
              {pret}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={`${id}-tag-${idx}`}
                  className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
