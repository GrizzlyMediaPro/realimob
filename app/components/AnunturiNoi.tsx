"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MdOutlineKeyboardArrowRight, 
  MdOutlineKeyboardArrowLeft,
  MdAttachMoney,
  MdSquareFoot,
  MdLocationOn,
  MdStairs,
  MdBuild,
  MdBalcony,
  MdHomeWork,
  MdStar,
  MdDeck,
  MdViewQuilt,
  MdAutoAwesome,
  MdHome
} from "react-icons/md";
import type { IconType } from "react-icons";

// Funcție helper pentru a obține icoana potrivită pentru fiecare tag
const getTagIcon = (tag: string): IconType | null => {
  const lowerTag = tag.toLowerCase();
  
  if (lowerTag.includes("€") || lowerTag.includes("pret") || lowerTag.includes("de la")) {
    return MdAttachMoney;
  }
  if (lowerTag.includes("m²") || lowerTag.includes("suprafata")) {
    return MdSquareFoot;
  }
  if (lowerTag.includes("centru") || lowerTag.includes("sector") || lowerTag.includes("locatie")) {
    return MdLocationOn;
  }
  if (lowerTag.includes("etaj") || lowerTag.includes("parter")) {
    return MdStairs;
  }
  if (lowerTag.includes("mobilat") || lowerTag.includes("mobila")) {
    return MdHome;
  }
  if (lowerTag.includes("balcon")) {
    return MdBalcony;
  }
  if (lowerTag.includes("renovat") || lowerTag.includes("renovare")) {
    return MdBuild;
  }
  if (lowerTag.includes("duplex")) {
    return MdHomeWork;
  }
  if (lowerTag.includes("lux") || lowerTag.includes("premium")) {
    return MdStar;
  }
  if (lowerTag.includes("terasa") || lowerTag.includes("terasă")) {
    return MdDeck;
  }
  if (lowerTag.includes("compartimentare") || lowerTag.includes("decomandat")) {
    return MdViewQuilt;
  }
  if (lowerTag.includes("modern")) {
    return MdAutoAwesome;
  }
  
  return null;
};

// Placeholder data - va fi înlocuit cu date reale
const anunturi = [
  {
    titlu: "Apartament 2 camere, Sector 1",
    image: "/ap2.jpg",
    pret: "85.000 €",
    tags: ["65 m²", "Sector 1", "Etaj 3", "Renovat"],
  },
  {
    titlu: "Apartament 3 camere, Sector 2",
    image: "/ap3.jpg",
    pret: "120.000 €",
    tags: ["85 m²", "Sector 2", "Etaj 5", "Balcon"],
  },
  {
    titlu: "Apartament 4 camere, Sector 3",
    image: "/ap4.jpg",
    pret: "180.000 €",
    tags: ["120 m²", "Sector 3", "Etaj 2", "Duplex"],
  },
  {
    titlu: "Studio, Centru",
    image: "/studio.jpg",
    pret: "45.000 €",
    tags: ["35 m²", "Centru", "Parter", "Mobilat"],
  },
  {
    titlu: "Apartament 2 camere, Sector 4",
    image: "/ap2.jpg",
    pret: "75.000 €",
    tags: ["60 m²", "Sector 4", "Etaj 1", "Modern"],
  },
  {
    titlu: "Apartament 3 camere, Sector 5",
    image: "/ap3.jpg",
    pret: "110.000 €",
    tags: ["80 m²", "Sector 5", "Etaj 4", "Decomandat"],
  },
];

export default function AnunturiNoi() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340; // card width (320px) + gap (24px)
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 100);
    }
  };

  return (
    <section className="w-full pb-6 md:pb-12 px-0 md:px-8 bg-background">
      <div className="w-full md:max-w-[1250px] md:mx-auto">
        <div className="bg-white dark:bg-[#1B1B21] border-0 md:border border-[#d5dae0] dark:border-[#2b2b33] rounded-none md:rounded-2xl p-4 md:p-6" style={{ fontFamily: "var(--font-galak-regular)" }}>
          {/* Heading și buton pe aceeași linie pe desktop */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-8">
            <h2
              className="text-2xl md:text-5xl font-bold text-foreground mb-2 md:mb-0"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Anunțuri noi
            </h2>
            <Link
              href="/anunturi"
              className="hidden md:block px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#C25A2B", fontFamily: "var(--font-galak-regular)" }}
            >
              Vezi toate anunțurile
              <MdOutlineKeyboardArrowRight size={18} className="ml-2 inline-block" />
            </Link>
          </div>
          
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto hide-scrollbar pb-4"
            >
              {anunturi.map((anunt, index) => (
                <div
                  key={index}
                  className="shrink-0 w-[320px] bg-background rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                >
                  {/* Imagine cu preț overlay */}
                  <div className="w-full h-[200px] relative">
                    <Image
                      src={anunt.image}
                      alt={anunt.titlu}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Preț ca sticker semi-transparent în partea de jos */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-black/60 backdrop-blur-sm">
                      <div className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-galak-regular)" }}>
                        {anunt.pret}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3
                      className="text-xl font-bold mb-3 text-foreground line-clamp-2"
                      style={{ 
                        fontFamily: "var(--font-galak-regular)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "3.5rem"
                      }}
                    >
                      {anunt.titlu}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {anunt.tags.map((tag, tagIndex) => {
                        const Icon = getTagIcon(tag);
                        return (
                          <span
                            key={tagIndex}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            style={{ fontFamily: "var(--font-galak-regular)" }}
                          >
                            {Icon && <Icon size={14} />}
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Buton navigare stânga */}
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background hover:opacity-80 items-center justify-center text-foreground transition-opacity shadow-lg z-10"
                aria-label="Scroll left"
              >
                <MdOutlineKeyboardArrowLeft size={24} />
              </button>
            )}
            
            {/* Buton navigare dreapta */}
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background hover:opacity-80 items-center justify-center text-foreground transition-opacity shadow-lg z-10"
                aria-label="Scroll right"
              >
                <MdOutlineKeyboardArrowRight size={24} />
              </button>
            )}
          </div>
          
          {/* Buton pe mobil sub carduri */}
          <div className="md:hidden mt-4 mb-6 px-4">
            <Link
              href="/anunturi"
              className="w-full block px-5 py-2.5 text-base rounded-md text-white font-medium hover:opacity-90 transition-opacity text-center"
              style={{ backgroundColor: "#C25A2B", fontFamily: "var(--font-galak-regular)" }}
            >
              Vezi toate anunțurile
              <MdOutlineKeyboardArrowRight size={18} className="ml-2 inline-block" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
