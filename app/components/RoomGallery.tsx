"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { MdChevronLeft, MdChevronRight, MdClose, MdZoomIn, MdZoomOut } from "react-icons/md";

export type RoomImageData = {
  url: string;
  roomName: string;
};

interface RoomGalleryProps {
  images: RoomImageData[];
  titlu: string;
  anuntId: string;
}

const GLASS_PILL = {
  background: "rgba(0, 0, 0, 0.45)",
  backdropFilter: "blur(12px) saturate(1.4)",
  WebkitBackdropFilter: "blur(12px) saturate(1.4)",
  border: "1px solid rgba(255, 255, 255, 0.14)",
} as const;

const GLASS_NAV = {
  background: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
} as const;

function RoomTabs({
  rooms,
  counts,
  total,
  selected,
  onSelect,
  variant = "inline",
}: {
  rooms: string[];
  counts: Record<string, number>;
  total: number;
  selected: string | null;
  onSelect: (room: string | null) => void;
  variant?: "inline" | "lightbox";
}) {
  const isLightbox = variant === "lightbox";
  const base = isLightbox
    ? "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border"
    : "shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 border";

  const activeClass = "bg-[#C25A2B] text-white border-[#C25A2B] shadow-md";
  const inactiveInline =
    "bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50 hover:text-[#C25A2B]";
  const inactiveLightbox =
    "bg-white/10 text-white/80 border-white/15 hover:bg-white/20 hover:text-white";

  const inactive = isLightbox ? inactiveLightbox : inactiveInline;

  return (
    <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 hide-scrollbar">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`${base} ${selected === null ? activeClass : inactive}`}
      >
        Toate ({total})
      </button>
      {rooms.map((room) => (
        <button
          key={room}
          type="button"
          onClick={() => onSelect(room)}
          className={`${base} ${selected === room ? activeClass : inactive}`}
        >
          {room} ({counts[room]})
        </button>
      ))}
    </div>
  );
}

function Lightbox({
  images,
  rooms,
  roomCounts,
  totalCount,
  startIndex,
  startRoom,
  titlu,
  anuntId,
  onClose,
}: {
  images: RoomImageData[];
  rooms: string[];
  roomCounts: Record<string, number>;
  totalCount: number;
  startIndex: number;
  startRoom: string | null;
  titlu: string;
  anuntId: string;
  onClose: () => void;
}) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(startRoom);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!selectedRoom) return images;
    return images.filter((img) => img.roomName === selectedRoom);
  }, [images, selectedRoom]);

  const safeIdx = Math.min(activeIndex, filtered.length - 1);
  const current = filtered[safeIdx];

  const goPrev = useCallback(() => {
    if (zoomed) return;
    setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
  }, [filtered.length, zoomed]);

  const goNext = useCallback(() => {
    if (zoomed) return;
    setActiveIndex((i) => (i >= filtered.length - 1 ? 0 : i + 1));
  }, [filtered.length, zoomed]);

  const handleRoomSelect = (room: string | null) => {
    setSelectedRoom(room);
    setActiveIndex(0);
    setZoomed(false);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleZoom = useCallback(() => {
    setZoomed((z) => {
      if (!z) {
        setPanOffset({ x: 0, y: 0 });
      }
      return !z;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, goPrev, goNext]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!zoomed) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !zoomed) return;
    const nx = e.clientX - dragStart.current.x;
    const ny = e.clientY - dragStart.current.y;
    dragOffset.current = { x: nx, y: ny };
    setPanOffset({ x: nx, y: ny });
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  if (!current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100000 flex flex-col"
      style={{ background: "rgba(0, 0, 0, 0.92)" }}
      role="dialog"
      aria-modal="true"
    >
      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between gap-2 px-3 sm:px-6 pt-[max(env(safe-area-inset-top,0px),0.75rem)] pb-2">
        <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
          <RoomTabs
            rooms={rooms}
            counts={roomCounts}
            total={totalCount}
            selected={selectedRoom}
            onSelect={handleRoomSelect}
            variant="lightbox"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            type="button"
            onClick={toggleZoom}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-colors"
            style={GLASS_NAV}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
          >
            {zoomed ? <MdZoomOut size={20} /> : <MdZoomIn size={20} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-colors"
            style={GLASS_NAV}
            aria-label="Închide galeria"
          >
            <MdClose size={20} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        ref={imageContainerRef}
        className="flex-1 relative min-h-0 flex items-center justify-center select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Nav arrows */}
        {filtered.length > 1 && !zoomed && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
              style={GLASS_NAV}
              aria-label="Anterioară"
            >
              <MdChevronLeft size={28} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
              style={GLASS_NAV}
              aria-label="Următoare"
            >
              <MdChevronRight size={28} />
            </button>
          </>
        )}

        {/* Main image */}
        <div
          className={`relative transition-transform duration-300 ease-out ${
            zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
          }`}
          style={{
            width: zoomed ? "100%" : "min(90vw, 1200px)",
            height: zoomed ? "100%" : "min(75vh, 800px)",
            transform: zoomed
              ? `scale(2) translate(${panOffset.x / 2}px, ${panOffset.y / 2}px)`
              : "scale(1)",
          }}
          onClick={(e) => {
            if (!isDragging.current || (Math.abs(dragOffset.current.x) < 3 && Math.abs(dragOffset.current.y) < 3)) {
              if (!zoomed) toggleZoom();
            }
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <Image
            src={current.url}
            alt={`${titlu} - ${current.roomName}`}
            fill
            className="object-contain pointer-events-none"
            sizes="100vw"
            priority
            draggable={false}
          />
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          <span
            className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white"
            style={GLASS_PILL}
          >
            {current.roomName}
          </span>
          <span
            className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-white/90"
            style={GLASS_PILL}
          >
            {safeIdx + 1} / {filtered.length}
          </span>
        </div>
      </div>

      {/* Thumbnails strip */}
      <div className="relative z-20 px-3 sm:px-6 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] pt-2">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar justify-center">
          {filtered.map((img, i) => (
            <button
              key={`${anuntId}-lb-${img.roomName}-${i}`}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setZoomed(false);
                setPanOffset({ x: 0, y: 0 });
              }}
              className={`relative rounded-lg overflow-hidden shrink-0 w-16 h-12 sm:w-20 sm:h-14 transition-all duration-200 ${
                i === safeIdx
                  ? "ring-2 ring-[#C25A2B] ring-offset-1 ring-offset-black opacity-100"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <Image
                src={img.url}
                alt={`${img.roomName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function RoomGallery({
  images,
  titlu,
  anuntId,
}: RoomGalleryProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const roomNames = useMemo(() => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const img of images) {
      if (!seen.has(img.roomName)) {
        seen.add(img.roomName);
        names.push(img.roomName);
      }
    }
    return names;
  }, [images]);

  const filteredImages = useMemo(() => {
    if (!selectedRoom) return images;
    return images.filter((img) => img.roomName === selectedRoom);
  }, [images, selectedRoom]);

  const roomCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const img of images) {
      counts[img.roomName] = (counts[img.roomName] || 0) + 1;
    }
    return counts;
  }, [images]);

  const safeIndex = Math.min(activeIndex, filteredImages.length - 1);
  const currentImage = filteredImages[safeIndex];

  const handleRoomSelect = (room: string | null) => {
    setSelectedRoom(room);
    setActiveIndex(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev <= 0 ? filteredImages.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev >= filteredImages.length - 1 ? 0 : prev + 1,
    );
  };

  const openLightbox = (index?: number) => {
    if (index !== undefined) setActiveIndex(index);
    setLightboxOpen(true);
  };

  if (!images.length) return null;

  return (
    <section className="mb-6 md:mb-8">
      {/* Room filter tabs */}
      <div className="mb-3 md:mb-4">
        <RoomTabs
          rooms={roomNames}
          counts={roomCounts}
          total={images.length}
          selected={selectedRoom}
          onSelect={handleRoomSelect}
        />
      </div>

      {/* Main image */}
      <div
        className="w-full max-w-[1250px] mx-auto aspect-video md:rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 relative group cursor-pointer"
        onClick={() => openLightbox()}
      >
        {currentImage && (
          <>
            <Image
              src={currentImage.url}
              alt={`${titlu} - ${currentImage.roomName}`}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 1250px"
              priority
            />

            {/* Room name badge */}
            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-semibold text-white backdrop-blur-xl"
                style={{
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                {currentImage.roomName}
              </span>
            </div>

            {/* Image counter badge */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
              <span
                className="inline-flex items-center px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium text-white backdrop-blur-xl"
                style={{
                  background: "rgba(0, 0, 0, 0.45)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                {safeIndex + 1} / {filteredImages.length}
              </span>
            </div>

            {/* Navigation arrows */}
            {filteredImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  style={GLASS_NAV}
                  aria-label="Imaginea anterioară"
                >
                  <MdChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  style={GLASS_NAV}
                  aria-label="Imaginea următoare"
                >
                  <MdChevronRight size={22} />
                </button>
              </>
            )}

            {/* Zoom hint */}
            <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-white/80"
                style={GLASS_PILL}
              >
                <MdZoomIn size={14} />
                Click pentru galerie
              </span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div className="mt-3 md:mt-4 flex gap-2 md:gap-3 overflow-x-auto pb-1 hide-scrollbar">
        {filteredImages.map((img, index) => (
          <button
            key={`${anuntId}-thumb-${img.roomName}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            onDoubleClick={() => openLightbox(index)}
            className={`relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0 w-20 h-16 md:w-28 md:h-20 transition-all duration-200 ${
              index === safeIndex
                ? "ring-2 ring-[#C25A2B] ring-offset-1 dark:ring-offset-gray-900"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={img.url}
              alt={`${titlu} - ${img.roomName} ${index + 1}`}
              fill
              className="object-cover"
              sizes="120px"
            />
            {selectedRoom === null && (
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <span
                  className="block w-full text-center text-[9px] md:text-[10px] font-medium text-white py-0.5 truncate px-1"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
                  }}
                >
                  {img.roomName}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          rooms={roomNames}
          roomCounts={roomCounts}
          totalCount={images.length}
          startIndex={safeIndex}
          startRoom={selectedRoom}
          titlu={titlu}
          anuntId={anuntId}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
}
