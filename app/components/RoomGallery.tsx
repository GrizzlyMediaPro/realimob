"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

export type RoomImageData = {
  url: string;
  roomName: string;
};

interface RoomGalleryProps {
  images: RoomImageData[];
  titlu: string;
  anuntId: string;
}

export default function RoomGallery({
  images,
  titlu,
  anuntId,
}: RoomGalleryProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Extract unique room names preserving order
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

  // Filtered images based on selected room
  const filteredImages = useMemo(() => {
    if (!selectedRoom) return images;
    return images.filter((img) => img.roomName === selectedRoom);
  }, [images, selectedRoom]);

  // Room counts
  const roomCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const img of images) {
      counts[img.roomName] = (counts[img.roomName] || 0) + 1;
    }
    return counts;
  }, [images]);

  // Ensure active index stays within bounds
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

  if (!images.length) return null;

  return (
    <section className="mb-6 md:mb-8">
      {/* Room filter tabs */}
      <div className="mb-3 md:mb-4 flex gap-1.5 md:gap-2 overflow-x-auto pb-1 hide-scrollbar">
        <button
          type="button"
          onClick={() => handleRoomSelect(null)}
          className={`shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 border ${
            selectedRoom === null
              ? "bg-[#C25A2B] text-white border-[#C25A2B] shadow-md"
              : "bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50 hover:text-[#C25A2B]"
          }`}
        >
          Toate ({images.length})
        </button>
        {roomNames.map((room) => (
          <button
            key={room}
            type="button"
            onClick={() => handleRoomSelect(room)}
            className={`shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 border ${
              selectedRoom === room
                ? "bg-[#C25A2B] text-white border-[#C25A2B] shadow-md"
                : "bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50 hover:text-[#C25A2B]"
            }`}
          >
            {room} ({roomCounts[room]})
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="w-full max-w-[1250px] mx-auto aspect-video md:rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 relative group">
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
                  onClick={handlePrev}
                  className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(0, 0, 0, 0.45)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                  aria-label="Imaginea anterioară"
                >
                  <MdChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(0, 0, 0, 0.45)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                  aria-label="Imaginea următoare"
                >
                  <MdChevronRight size={22} />
                </button>
              </>
            )}
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
            {/* Room label on thumbnail */}
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
    </section>
  );
}
