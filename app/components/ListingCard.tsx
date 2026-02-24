"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CiImageOn, CiHeart } from "react-icons/ci";
import { MdLocationOn, MdPhone } from "react-icons/md";
import type { IconType } from "react-icons";

type ListingCardProps = {
  id: string;
  titlu: string;
  image: string;
  pret: string;
  tags: string[];
  locationText: string;
  imageCount: number;
  getTagIcon: (tag: string) => IconType | null;
  href: string;
  compact?: boolean;
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

export default function ListingCard({
  id,
  titlu,
  image,
  pret,
  tags,
  locationText,
  imageCount,
  getTagIcon,
  href,
  compact = false,
}: ListingCardProps) {
  const isDark = useDarkMode();

  const normalShadow = isDark
    ? "0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
    : "0 6px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)";

  const hoverShadow = isDark
    ? "0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
    : "0 10px 40px rgba(0, 0, 0, 0.09), inset 0 1px 0 rgba(255, 255, 255, 0.55)";

  const cardStyle: React.CSSProperties = {
    background: isDark
      ? "rgba(35, 35, 48, 0.5)"
      : "rgba(255, 255, 255, 0.6)",
    border: isDark
      ? "1px solid rgba(255, 255, 255, 0.12)"
      : "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: normalShadow,
    backdropFilter: "blur(80px) saturate(1.6)",
    WebkitBackdropFilter: "blur(80px) saturate(1.6)",
    transition: "all 0.3s ease",
  };

  /* ── Compact card (map view mobile) ── */
  if (compact) {
    return (
      <Link
        href={href}
        className="block rounded-xl overflow-hidden relative cursor-pointer"
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = hoverShadow;
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = normalShadow;
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div className="flex flex-row items-stretch h-full relative z-2">
          {/* Imagine mică stânga */}
          <div className="w-[110px] h-[110px] relative shrink-0 overflow-hidden rounded-l-xl">
            <Image
              src={image}
              alt={titlu}
              fill
              className="object-cover object-center"
            />
            <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] flex items-center gap-1 backdrop-blur-xl">
              <CiImageOn size={12} />
              <span className="font-medium">{imageCount}</span>
            </div>
          </div>

          {/* Info dreapta — compact */}
          <div className="p-2.5 flex-1 flex flex-col justify-between min-w-0">
            <div className="min-w-0">
              <h3
                className="text-xs font-bold text-foreground leading-tight"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {titlu}
              </h3>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <MdLocationOn size={11} />
                <span className="truncate">București, {locationText}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag, idx) => {
                  const Icon = getTagIcon(tag);
                  return (
                    <span
                      key={`${id}-tag-${idx}`}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[9px] leading-tight"
                    >
                      {Icon && <Icon size={10} />}
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between">
              <div className="text-sm font-bold text-foreground">{pret}</div>
              <button
                type="button"
                className="w-6 h-6 rounded-full bg-[#1F2D44] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                onClick={(e) => e.preventDefault()}
              >
                <MdPhone size={12} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Card normal ── */
  return (
    <Link
      href={href}
      className="block rounded-2xl overflow-hidden relative cursor-pointer sm:h-64 md:h-72"
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = hoverShadow;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = normalShadow;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Reflexie mată subtilă */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: isDark
            ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div className="flex flex-col sm:flex-row items-stretch h-full relative z-2">
        <div className="w-full sm:w-88 md:w-96 h-40 sm:h-full relative shrink-0 overflow-hidden rounded-l-2xl">
          <Image
            src={image}
            alt={titlu}
            fill
            className="object-cover object-center"
          />
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-md bg-black/60 text-white text-sm flex items-center gap-2 backdrop-blur-xl">
            <CiImageOn size={18} />
            <span className="font-medium">{imageCount}</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between rounded-r-2xl h-full">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3
                className="text-lg md:text-xl font-bold text-foreground flex-1"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {titlu}
              </h3>
              <button
                type="button"
                className="hidden sm:flex w-9 h-9 rounded-full bg-[#3B1F3A] items-center justify-center text-white hover:opacity-90 transition-opacity ml-3 shrink-0"
                onClick={(e) => e.preventDefault()}
              >
                <CiHeart size={18} />
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MdLocationOn size={16} />
              <span>București, {locationText}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {tags.map((tag, idx) => {
                const Icon = getTagIcon(tag);
                return (
                  <span
                    key={`${id}-tag-${idx}`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {Icon && <Icon size={14} />}
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-foreground">
              {pret}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-[#1F2D44] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                onClick={(e) => e.preventDefault()}
              >
                <MdPhone size={18} />
              </button>
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-[#3B1F3A] flex items-center justify-center text-white hover:opacity-90 transition-opacity sm:hidden"
                onClick={(e) => e.preventDefault()}
              >
                <CiHeart size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
