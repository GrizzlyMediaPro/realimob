"use client";

import { useState, useEffect } from "react";
import { MdEmail, MdSend } from "react-icons/md";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    // Simulare submit - aici poți adăuga logica reală de API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail("");
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1000);
  };

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full pb-6 md:pb-16 px-0 md:px-8">
      <div className="w-full md:max-w-[1250px] md:mx-auto">
        <div 
          className="rounded-none md:rounded-3xl overflow-hidden relative"
          style={{ 
            fontFamily: "var(--font-galak-regular)",
            background: isDark ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: isDark 
              ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(80px) saturate(1.6)",
            WebkitBackdropFilter: "blur(80px) saturate(1.6)",
          }}
        >
          {/* Reflexie mată subtilă */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: isDark
                ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
                : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
              borderRadius: "inherit",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <div className="p-6 md:p-8 relative z-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Text și iconiță */}
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1">
                <MdEmail size={32} className="text-[#C25A2B]" />
              </div>
              <div>
                <h3
                  className="text-xl md:text-2xl font-bold mb-2 text-foreground"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Rămâi la curent cu cele mai noi oportunități
                </h3>
                <p
                  className="text-sm md:text-base text-gray-600 dark:text-gray-400"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Abonează-te la newsletter și primește direct în inbox cele mai noi proprietăți, 
                  sfaturi de la experți și păstrează-te la curent cu piața imobiliară din București.
                </p>
              </div>
            </div>

            {/* Form de abonare */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[400px]">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresa ta de email"
                  required
                  className="w-full px-4 py-3 pr-10 rounded-lg text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B] focus:border-transparent transition-all relative"
                  style={{
                    fontFamily: "var(--font-galak-regular)",
                    background: isDark ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.45)",
                    backdropFilter: "blur(40px) saturate(1.6)",
                    WebkitBackdropFilter: "blur(40px) saturate(1.6)",
                    boxShadow: isDark
                      ? "0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                      : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                  }}
                  disabled={isSubmitting || isSubmitted}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || isSubmitted || !email}
                className="px-6 py-3 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-galak-regular)",
                  background: "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(20px) saturate(1.5)",
                  WebkitBackdropFilter: "blur(20px) saturate(1.5)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && !isSubmitted && email) {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(194, 90, 43, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Se trimite...</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <span>✓</span>
                    <span>Abonat!</span>
                  </>
                ) : (
                  <>
                    <MdSend size={18} />
                    <span>Abonează-te</span>
                  </>
                )}
              </button>
            </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
