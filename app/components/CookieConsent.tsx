"use client";

import { useState, useEffect, useCallback } from "react";
import { MdCookie, MdClose, MdCheck } from "react-icons/md";

export type CookiePreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "realimob-cookie-consent";
const CONSENT_VERSION = "1";

function getSavedConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed.preferences as CookiePreferences;
  } catch {
    return null;
  }
}

function saveConsent(prefs: CookiePreferences) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: CONSENT_VERSION, preferences: prefs, timestamp: Date.now() })
  );
}

function clearNonEssentialCookies() {
  const essentialPrefixes = ["__clerk", "__session", "__client"];
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (!name) return;
    const isEssential = essentialPrefixes.some((p) => name.startsWith(p));
    if (!isEssential) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    }
  });
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

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

  useEffect(() => {
    const saved = getSavedConsent();
    if (!saved) {
      clearNonEssentialCookies();
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
    }
  }, []);

  const handleAccept = useCallback((prefs: CookiePreferences) => {
    saveConsent(prefs);

    // Restore the native document.cookie setter
    const restoreFn = (window as unknown as Record<string, unknown>).__realimobRestoreCookies;
    if (typeof restoreFn === "function") (restoreFn as () => void)();

    if (!prefs.analytics && !prefs.marketing) {
      clearNonEssentialCookies();
    }
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 350);
  }, []);

  const acceptAll = useCallback(() => {
    handleAccept({ essential: true, analytics: true, marketing: true });
  }, [handleAccept]);

  const rejectNonEssential = useCallback(() => {
    handleAccept({ essential: true, analytics: false, marketing: false });
  }, [handleAccept]);

  const savePreferences = useCallback(() => {
    handleAccept({ essential: true, analytics, marketing });
  }, [handleAccept, analytics, marketing]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-9998 transition-opacity duration-350 ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.25)" }}
      />

      {/* Cookie banner — centrat pe ecran */}
      <div
        className={`fixed inset-0 z-9999 flex items-center justify-center px-4 py-6 md:py-8 transition-all duration-350 pointer-events-none ${
          animateIn
            ? "opacity-100 scale-100"
            : "opacity-0 scale-[0.97]"
        }`}
      >
        <div
          className="w-full max-w-[680px] max-h-[min(90dvh,640px)] overflow-y-auto rounded-2xl pointer-events-auto"
          style={{
            background: isDark
              ? "rgba(35, 35, 48, 0.75)"
              : "rgba(255, 255, 255, 0.8)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: isDark
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(80px) saturate(1.6)",
            WebkitBackdropFilter: "blur(80px) saturate(1.6)",
            boxShadow: isDark
              ? "0 8px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "0 8px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
          }}
        >
          <div className="p-5 md:p-6">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{
                  background: isDark
                    ? "rgba(194, 90, 43, 0.2)"
                    : "rgba(194, 90, 43, 0.12)",
                }}
              >
                <MdCookie size={22} className="text-[#C25A2B]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-base font-semibold ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Acest site folosește cookie-uri
                </h3>
                <p
                  className={`text-sm mt-1 leading-relaxed ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Folosim cookie-uri pentru a îmbunătăți experiența ta pe site.
                  Cookie-urile esențiale sunt necesare pentru funcționarea corectă,
                  iar cele opționale ne ajută să analizăm traficul și să personalizăm conținutul.
                </p>
              </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div
                className="rounded-xl p-4 mb-4 space-y-3"
                style={{
                  background: isDark
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(0, 0, 0, 0.03)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.06)",
                }}
              >
                {/* Essential */}
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-200" : "text-gray-800"
                      }`}
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Esențiale
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        isDark ? "text-gray-500" : "text-gray-500"
                      }`}
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Necesare pentru funcționarea site-ului
                    </p>
                  </div>
                  <div
                    className="w-11 h-6 rounded-full flex items-center px-0.5 cursor-not-allowed opacity-60"
                    style={{ background: "#C25A2B" }}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm ml-auto" />
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-200" : "text-gray-800"
                      }`}
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Analitice
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        isDark ? "text-gray-500" : "text-gray-500"
                      }`}
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Ne ajută să înțelegem cum este utilizat site-ul
                    </p>
                  </div>
                  <button
                    onClick={() => setAnalytics((v) => !v)}
                    className="w-11 h-6 rounded-full flex items-center px-0.5 transition-colors duration-200 cursor-pointer"
                    style={{
                      background: analytics
                        ? "#C25A2B"
                        : isDark
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(0,0,0,0.15)",
                    }}
                    aria-label="Toggle analitice"
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        analytics ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-200" : "text-gray-800"
                      }`}
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Marketing
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        isDark ? "text-gray-500" : "text-gray-500"
                      }`}
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Folosite pentru publicitate personalizată
                    </p>
                  </div>
                  <button
                    onClick={() => setMarketing((v) => !v)}
                    className="w-11 h-6 rounded-full flex items-center px-0.5 transition-colors duration-200 cursor-pointer"
                    style={{
                      background: marketing
                        ? "#C25A2B"
                        : isDark
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(0,0,0,0.15)",
                    }}
                    aria-label="Toggle marketing"
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        marketing ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              {showSettings ? (
                <>
                  <button
                    onClick={savePreferences}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
                    style={{
                      fontFamily: "var(--font-galak-regular)",
                      background: "#C25A2B",
                      boxShadow: "0 2px 10px rgba(194, 90, 43, 0.35)",
                    }}
                  >
                    <MdCheck size={18} />
                    Salvează preferințele
                  </button>
                  <button
                    onClick={acceptAll}
                    className={`flex-1 px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                    style={{
                      fontFamily: "var(--font-galak-regular)",
                      background: isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.05)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    Acceptă toate
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={acceptAll}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
                    style={{
                      fontFamily: "var(--font-galak-regular)",
                      background: "#C25A2B",
                      boxShadow: "0 2px 10px rgba(194, 90, 43, 0.35)",
                    }}
                  >
                    <MdCheck size={18} />
                    Acceptă toate
                  </button>
                  <button
                    onClick={rejectNonEssential}
                    className={`flex-1 px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                    style={{
                      fontFamily: "var(--font-galak-regular)",
                      background: isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.05)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    Doar esențiale
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className={`flex-1 px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                    style={{
                      fontFamily: "var(--font-galak-regular)",
                    }}
                  >
                    Personalizează
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
