"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
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

const categorii = [
  {
    titlu: "Studio",
    image: "/studio.jpg",
    tags: ["de la 25.000 €", "20-30 m²", "Centru", "Mobilat"],
  },
  {
    titlu: "2 Camere",
    image: "/ap2.jpg",
    tags: ["de la 45.000 €", "40-60 m²", "Balcon", "Parter"],
  },
  {
    titlu: "3 Camere",
    image: "/ap3.jpg",
    tags: ["de la 75.000 €", "70-90 m²", "Etaj 2-5", "Renovat"],
  },
  {
    titlu: "4+ Camere",
    image: "/ap4.jpg",
    tags: ["de la 120.000 €", "100+ m²", "Duplex", "Lux"],
  },
  {
    titlu: "Penthouse",
    image: "/ap4.jpg",
    tags: ["de la 200.000 €", "150+ m²", "Ultimul etaj", "Terasa"],
  },
  {
    titlu: "Decomandat",
    image: "/ap3.jpg",
    tags: ["de la 50.000 €", "50-80 m²", "Compartimentare", "Modern"],
  },
];

export default function CategoriiPopulare() {
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
      // Check scroll position after a short delay
      setTimeout(checkScroll, 100);
    }
  };

  return (
    <section className="w-full pt-0 md:pt-32 pb-6 md:pb-12 px-0 md:px-8 bg-background">
      <div className="w-full md:max-w-[1250px] md:mx-auto">
        <div className="bg-white dark:bg-[#1B1B21] border-0 md:border border-[#d5dae0] dark:border-[#2b2b33] rounded-none md:rounded-2xl p-4 md:p-6" style={{ fontFamily: "var(--font-galak-regular)" }}>
          <h2
            className="text-2xl md:text-5xl font-bold mb-4 md:mb-8 text-foreground"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            Categorii populare
          </h2>
          
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto hide-scrollbar pb-4"
            >
              {categorii.map((categorie, index) => (
              <div
                key={index}
                className="shrink-0 w-[320px] bg-background rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              >
                {/* Imagine */}
                <div className="w-full h-[200px] relative">
                  <Image
                    src={categorie.image}
                    alt={categorie.titlu}
                    fill
                    className="object-cover"
                  />
                </div>
                
                  <div className="p-4">
                    <h3
                      className="text-xl font-bold mb-3 text-foreground"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      {categorie.titlu}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {categorie.tags.map((tag, tagIndex) => {
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
        </div>
      </div>
    </section>
  );
}
