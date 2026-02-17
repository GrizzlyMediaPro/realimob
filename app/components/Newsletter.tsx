"use client";

import { useState } from "react";
import { MdEmail, MdSend } from "react-icons/md";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  return (
    <section className="w-full pb-6 md:pb-16 px-0 md:px-8 bg-background">
      <div className="w-full md:max-w-[1250px] md:mx-auto">
        <div className="bg-white dark:bg-[#1B1B21] border-0 md:border border-[#d5dae0] dark:border-[#2b2b33] rounded-none md:rounded-2xl p-6 md:p-8" style={{ fontFamily: "var(--font-galak-regular)" }}>
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
                  className="w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-800 border border-[#d5dae0] dark:border-[#2b2b33] rounded-lg text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B] focus:border-transparent transition-all"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                  disabled={isSubmitting || isSubmitted}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || isSubmitted || !email}
                className="px-6 py-3 bg-[#C25A2B] hover:bg-[#A04A23] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                style={{ fontFamily: "var(--font-galak-regular)" }}
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
    </section>
  );
}
