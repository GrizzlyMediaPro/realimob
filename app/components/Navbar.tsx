 "use client";

import { useState, useRef, useEffect } from "react";
import { CiCirclePlus, CiUser, CiLogin } from "react-icons/ci";
import { MdClose, MdMenu } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Închide meniul când se face click în afara lui
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        navRef.current &&
        !menuRef.current.contains(target) &&
        !navRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const menuItems = {
    "De vânzare": [
      "Apartamente de vânzare",
      "Garsoniere de vânzare",
      "Case și vile de vânzare",
      "Terenuri de vânzare",
      "Spații comerciale de vânzare",
    ],
    "De închiriat": [
      "Apartamente de închiriat",
      "Garsoniere de închiriat",
      "Case și vile de închiriat",
      "Spații comerciale de închiriat",
      "Birouri de închiriat",
    ],
    "Ansambluri Rezidențiale": [
      "Complexuri Rezidențiale",
      "Dezvoltatori",
    ],
  };

  return (
    <>
      <nav ref={navRef} className="fixed top-0 w-full flex items-center justify-center px-4 md:px-8 py-5 bg-white dark:bg-[#1B1B21] z-200 border-b border-[#d5dae0] dark:border-[#2b2b33]">
        <div className="flex items-center justify-between w-full max-w-[1250px]">
          {/* Logo pe stânga */}
          <Link
            href="/"
            className="text-2xl tracking-tight text-black dark:text-foreground"
            style={{ fontFamily: "var(--font-kursk-medium)" }}
          >
            real
            <span style={{ color: "#C25A2B" }}>i</span>
            mob
          </Link>

          {/* Butoane pe dreapta */}
          <div 
            className="flex items-center gap-4"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
              {/* Desktop: butoane normale + steag + hamburger */}
              <div className="items-center gap-4 hidden md:flex">
                <a href="#" className="flex items-center gap-2 text-black dark:text-foreground hover:opacity-80 transition-opacity">
                  <CiCirclePlus size={24} />
                  Adaugă anunț
                </a>
                <a 
                  href="#" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#3B1F3A" }}
                >
                  <CiUser size={24} />
                  Cont nou
                </a>
                <a 
                  href="#" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#1F2D44" }}
                >
                  <CiLogin size={24} />
                  Intră în cont
                </a>
                <Image 
                  src="/Flag_of_Romania.svg.webp" 
                  alt="România" 
                  width={24} 
                  height={18}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 text-black dark:text-foreground hover:opacity-80 transition-opacity relative"
                  aria-label="Menu"
                >
                  <div className="relative w-6 h-6">
                    <MdMenu 
                      size={24} 
                      className={`absolute inset-0 transition-all duration-300 ${
                        isMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                      }`}
                    />
                    <MdClose 
                      size={24} 
                      className={`absolute inset-0 transition-all duration-300 ${
                        isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
                      }`}
                    />
                  </div>
                </button>
              </div>
            
              {/* Mobile: hamburger + steag */}
              <div className="flex items-center gap-4 md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 text-black dark:text-foreground hover:opacity-80 transition-opacity relative"
                  aria-label="Menu"
                >
                  <div className="relative w-6 h-6">
                    <MdMenu 
                      size={24} 
                      className={`absolute inset-0 transition-all duration-300 ${
                        isMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                      }`}
                    />
                    <MdClose 
                      size={24} 
                      className={`absolute inset-0 transition-all duration-300 ${
                        isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
                      }`}
                    />
                  </div>
                </button>
                <Image 
                  src="/Flag_of_Romania.svg.webp" 
                  alt="România" 
                  width={24} 
                  height={18}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              </div>
            </div>
        </div>
      </nav>

      {/* Backdrop transparent când meniul este deschis (pentru a închide la click) */}
      <div
        className={`fixed inset-0 z-150 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Menu overlay — deasupra paginii, sub navbar */}
      <div
        ref={menuRef}
        className={`absolute left-0 right-0 z-190 flex justify-center transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
        style={{ top: "73px" }}
      >
        <div className="w-full max-w-[1250px] mx-auto">
          {/* Linie subțire separator */}
          <div className="h-px bg-[#d5dae0] dark:bg-[#2b2b33]" />
          
          {/* Conținut menu */}
          <div
            className="bg-white dark:bg-[#1B1B21] rounded-b-2xl shadow-2xl border border-t-0 border-[#d5dae0] dark:border-[#2b2b33]"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            <div className="px-4 md:px-8 py-4">
              {/* Adaugă anunț (doar pe mobil) */}
              <a
                href="#"
                className="flex items-center gap-2 text-base text-black dark:text-foreground hover:opacity-80 transition-opacity mb-6 md:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <CiCirclePlus size={24} />
                Adaugă anunț
              </a>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {Object.entries(menuItems).map(([category, subcategories], index) => (
                  <div key={index}>
                    {/* Categorie principală */}
                    <a
                      href="#"
                      className="block text-lg font-semibold text-foreground hover:text-[#C25A2B] transition-colors mb-4"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(false);
                      }}
                    >
                      {category}
                    </a>
                    
                    {/* Subcategorii */}
                    <div className="space-y-2.5">
                      {subcategories.map((subcategory, subIndex) => (
                        <a
                          key={subIndex}
                          href="#"
                          className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#C25A2B] dark:hover:text-[#C25A2B] transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsMenuOpen(false);
                          }}
                        >
                          {subcategory}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Cont nou și Intră în cont (doar pe mobil) */}
              <div className="flex flex-row gap-4 mt-8 md:hidden">
                <a 
                  href="#" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-base hover:opacity-90 transition-opacity justify-center grow"
                  style={{ backgroundColor: "#3B1F3A" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CiUser size={24} />
                  Cont nou
                </a>
                <a 
                  href="#" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-base hover:opacity-90 transition-opacity justify-center grow"
                  style={{ backgroundColor: "#1F2D44" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CiLogin size={24} />
                  Intră în cont
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
