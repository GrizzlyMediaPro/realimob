 "use client";

import { useState, useRef, useEffect } from "react";
import { CiCirclePlus, CiUser, CiLogin } from "react-icons/ci";
import { MdClose, MdMenu } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Detectare dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

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

  const pillButtonStyle = (baseColor: string, shadowColor: string): React.CSSProperties => ({
    background: isDark
      ? `linear-gradient(135deg, ${baseColor} 0%, ${baseColor} 100%)`
      : `linear-gradient(135deg, ${baseColor} 0%, ${baseColor} 100%)`,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.2)",
    boxShadow: `0 2px 8px ${shadowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`,
    backdropFilter: "blur(20px) saturate(1.4)",
    WebkitBackdropFilter: "blur(20px) saturate(1.4)",
  });

  return (
    <>
      <nav 
        ref={navRef} 
        className="fixed top-0 w-full flex items-center justify-center px-4 md:px-8 py-5 z-200"
        style={{
          background: isDark 
            ? "rgba(35, 35, 48, 0.5)" 
            : "rgba(255, 255, 255, 0.6)",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(80px) saturate(1.6)",
          WebkitBackdropFilter: "blur(80px) saturate(1.6)",
          boxShadow: isDark
            ? "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.1)"
            : "0 4px 20px rgba(0, 0, 0, 0.06), inset 0 -1px 0 rgba(255, 255, 255, 0.5)",
        }}
      >
        <div className="flex items-center justify-between w-full max-w-[1250px] relative z-1">
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
                <Link 
                  href="/inregistrare" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white hover:opacity-90 transition-opacity"
                  style={pillButtonStyle("rgba(59, 31, 58, 0.8)", "rgba(59, 31, 58, 0.3)")}
                >
                  <CiUser size={24} />
                  Cont nou
                </Link>
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white hover:opacity-90 transition-opacity"
                  style={pillButtonStyle("rgba(31, 45, 68, 0.8)", "rgba(31, 45, 68, 0.3)")}
                >
                  <CiLogin size={24} />
                  Intră în cont
                </Link>
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
            className="rounded-b-2xl relative"
            style={{
              fontFamily: "var(--font-galak-regular)",
              background: isDark
                ? "rgba(35, 35, 48, 0.5)"
                : "rgba(255, 255, 255, 0.6)",
              borderLeftWidth: "1px",
              borderRightWidth: "1px",
              borderBottomWidth: "1px",
              borderTopWidth: "0",
              borderStyle: "solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.5)",
              boxShadow: isDark
                ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                : "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(80px) saturate(1.6)",
              WebkitBackdropFilter: "blur(80px) saturate(1.6)",
            }}
          >
            <div className="px-4 md:px-8 py-4 relative z-1">
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
                <Link 
                  href="/inregistrare" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-base hover:opacity-90 transition-opacity justify-center grow"
                  style={pillButtonStyle("rgba(59, 31, 58, 0.8)", "rgba(59, 31, 58, 0.3)")}
                >
                  <CiUser size={24} />
                  Cont nou
                </Link>
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-base hover:opacity-90 transition-opacity justify-center grow"
                  style={pillButtonStyle("rgba(31, 45, 68, 0.8)", "rgba(31, 45, 68, 0.3)")}
                >
                  <CiLogin size={24} />
                  Intră în cont
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
