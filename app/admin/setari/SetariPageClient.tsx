"use client";

import { useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminSecuritatePanel } from "../_components/AdminSecuritatePanel";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  MdArrowBack,
  MdSettings,
  MdSave,
  MdEmail,
  MdPhone,
  MdBusiness,
  MdNotifications,
  MdSecurity,
  MdAssessment,
  MdInfoOutline,
  MdToggleOn,
} from "react-icons/md";

type PlatformSettingsDto = {
  id: string;
  key: string;
  siteName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  defaultCurrency: string;
  registrationsEnabled: boolean;
  newListingsAutoApprove: boolean;
  updatedAt: string;
};

const CURRENCIES = ["RON", "EUR", "USD"] as const;

export default function AdminSetariPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab =
    searchParams.get("tab") === "securitate" ? "securitate" : "platforma";

  const setTab = (t: "platforma" | "securitate") => {
    router.replace(
      t === "securitate" ? "/admin/setari?tab=securitate" : "/admin/setari",
      { scroll: false }
    );
  };

  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  const [siteName, setSiteName] = useState("realimob");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [defaultCurrency, setDefaultCurrency] =
    useState<(typeof CURRENCIES)[number]>("RON");
  const [registrationsEnabled, setRegistrationsEnabled] = useState(true);
  const [newListingsAutoApprove, setNewListingsAutoApprove] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

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
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Nu am putut încărca.");
        const s = data as PlatformSettingsDto;
        setSiteName(s.siteName || "realimob");
        setSupportEmail(s.supportEmail ?? "");
        setSupportPhone(s.supportPhone ?? "");
        const cur = (s.defaultCurrency || "RON").toUpperCase();
        setDefaultCurrency(
          CURRENCIES.includes(cur as (typeof CURRENCIES)[number])
            ? (cur as (typeof CURRENCIES)[number])
            : "RON"
        );
        setRegistrationsEnabled(s.registrationsEnabled !== false);
        setNewListingsAutoApprove(Boolean(s.newListingsAutoApprove));
        setUpdatedAt(s.updatedAt);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Eroare la încărcare.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSavedOk(false);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          supportEmail: supportEmail.trim() || null,
          supportPhone: supportPhone.trim() || null,
          defaultCurrency,
          registrationsEnabled,
          newListingsAutoApprove,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Salvare eșuată.");
      const s = data as PlatformSettingsDto;
      setUpdatedAt(s.updatedAt);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Salvare eșuată.");
    } finally {
      setSaving(false);
    }
  };

  const glassCard: CSSProperties = {
    background: isDark ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.65)",
    border: isDark
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: isDark
      ? "0 8px 32px rgba(0, 0, 0, 0.25)"
      : "0 8px 32px rgba(0, 0, 0, 0.06)",
    backdropFilter: "blur(80px) saturate(1.6)",
    WebkitBackdropFilter: "blur(80px) saturate(1.6)",
  };

  return (
    <div className="min-h-screen text-foreground pt-20">
      <Navbar />
      <div className="w-full px-4 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-[1250px] mx-auto space-y-8 md:space-y-10">
          <div>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors mb-4"
            >
              <MdArrowBack size={20} />
              <span className="text-sm">Înapoi la panou</span>
            </Link>
            <div className="flex items-start gap-3">
              <div
                className="mt-1 p-2 rounded-xl"
                style={{
                  background: isDark
                    ? "rgba(194, 90, 43, 0.15)"
                    : "rgba(194, 90, 43, 0.1)",
                }}
              >
                <MdSettings className="text-[#C25A2B]" size={28} />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-5xl font-bold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Setări
                </h1>
                <p
                  className="text-gray-500 dark:text-gray-400 max-w-3xl"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Platformă (identitate, politici) și securitate (roluri,
                  utilizatori) într-un singur loc.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "platforma" as const, label: "Platformă" },
                { id: "securitate" as const, label: "Securitate" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  fontFamily: "var(--font-galak-regular)",
                  background:
                    tab === id
                      ? "rgba(194, 90, 43, 0.2)"
                      : isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                  border:
                    tab === id
                      ? "1px solid rgba(194, 90, 43, 0.45)"
                      : isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.08)",
                  color: tab === id ? "#C25A2B" : "inherit",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "securitate" && <AdminSecuritatePanel />}

          {tab === "platforma" && error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                color: "#DC2626",
                fontFamily: "var(--font-galak-regular)",
              }}
            >
              {error}
            </div>
          )}

          {tab === "platforma" && savedOk && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(16, 185, 129, 0.12)",
                color: "#059669",
                fontFamily: "var(--font-galak-regular)",
              }}
            >
              Setările au fost salvate.
            </div>
          )}

          {tab === "platforma" && (
          <div
            className="rounded-none md:rounded-3xl p-6 md:p-8 space-y-10"
            style={{ ...glassCard, fontFamily: "var(--font-galak-regular)" }}
          >
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Se încarcă setările…
              </p>
            ) : (
              <>
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MdBusiness size={22} className="text-[#C25A2B]" />
                    Identitate și contact
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Folosite în mesaje către utilizatori și pot fi afișate pe
                    site (ex. pagina de contact, footer — când le legi în UI).
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Nume afișat platformă
                      </span>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/80 dark:bg-[#1B1B21]/90 border border-gray-200 dark:border-white/10"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <MdEmail size={14} /> Email suport
                      </span>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        placeholder="ex: contact@domeniu.ro"
                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/80 dark:bg-[#1B1B21]/90 border border-gray-200 dark:border-white/10"
                      />
                    </label>
                    <label className="block space-y-1.5 md:col-span-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <MdPhone size={14} /> Telefon suport
                      </span>
                      <input
                        type="tel"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        placeholder="ex: +40 …"
                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/80 dark:bg-[#1B1B21]/90 border border-gray-200 dark:border-white/10 max-w-md"
                      />
                    </label>
                  </div>
                </section>

                <div
                  className="h-px"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                  }}
                />

                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MdToggleOn size={22} className="text-[#C25A2B]" />
                    Anunțuri și înregistrări
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Monedă implicită (referință pentru formulare)
                      </span>
                      <select
                        value={defaultCurrency}
                        onChange={(e) =>
                          setDefaultCurrency(
                            e.target.value as (typeof CURRENCIES)[number]
                          )
                        }
                        className="w-full max-w-xs rounded-xl px-3 py-2.5 text-sm bg-white/80 dark:bg-[#1B1B21]/90 border border-gray-200 dark:border-white/10"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="space-y-3">
                      <ToggleRow
                        label="Înregistrări noi permise"
                        description="Dacă oprești, fluxul /inregistrare și /sign-up afișează un mesaj — util la mentenanță sau invitații."
                        checked={registrationsEnabled}
                        onChange={setRegistrationsEnabled}
                        isDark={isDark}
                      />
                      <ToggleRow
                        label="Aprobare automată anunțuri noi"
                        description="Anunțurile publicate din formularul public intră direct ca aprobate. Folosește doar dacă ai încredere în surse."
                        checked={newListingsAutoApprove}
                        onChange={setNewListingsAutoApprove}
                        isDark={isDark}
                      />
                    </div>
                  </div>
                </section>

                <div
                  className="h-px"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                  }}
                />

                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MdInfoOutline size={22} className="text-[#C25A2B]" />
                    Idei pentru viitor
                  </h2>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 list-disc pl-5">
                    <li>
                      <strong className="text-foreground/90 font-medium">
                        Mod mentenanță
                      </strong>{" "}
                      — pagină statică pentru toți vizitatorii (necesită
                      middleware).
                    </li>
                    <li>
                      <strong className="text-foreground/90 font-medium">
                        Limite upload
                      </strong>{" "}
                      — număr maxim imagini / mărime fișier (în Uploadthing sau
                      API).
                    </li>
                    <li>
                      <strong className="text-foreground/90 font-medium">
                        SEO &amp; rețele
                      </strong>{" "}
                      — titluri default, Open Graph, link-uri social media în
                      footer.
                    </li>
                    <li>
                      <strong className="text-foreground/90 font-medium">
                        Notificări push / SMS
                      </strong>{" "}
                      — dacă integrezi furnizori, setările lor aici.
                    </li>
                  </ul>
                </section>

                <div
                  className="h-px"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                  }}
                />

                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Legături rapide
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <QuickLink
                      href="/admin/notificari"
                      icon={MdNotifications}
                      label="Notificări & email"
                      isDark={isDark}
                    />
                    <QuickLink
                      href="/admin/setari?tab=securitate"
                      icon={MdSecurity}
                      label="Securitate"
                      isDark={isDark}
                    />
                    <QuickLink
                      href="/admin/statistici?tab=rapoarte"
                      icon={MdAssessment}
                      label="Statistici și rapoarte"
                      isDark={isDark}
                    />
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                  {updatedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ultima actualizare:{" "}
                      {new Date(updatedAt).toLocaleString("ro-RO")}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-50"
                    style={{ backgroundColor: "#C25A2B" }}
                  >
                    <MdSave size={20} />
                    {saving ? "Se salvează…" : "Salvează setările"}
                  </button>
                </div>
              </>
            )}
          </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  isDark,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  isDark: boolean;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 rounded-2xl p-4"
      style={{
        background: isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.03)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="shrink-0 relative w-12 h-7 rounded-full transition-colors"
        style={{
          background: checked ? "#C25A2B" : isDark ? "#3f3f4a" : "#d1d5db",
        }}
      >
        <span
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ left: checked ? "26px" : "4px" }}
        />
      </button>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  isDark,
}: {
  href: string;
  icon: typeof MdNotifications;
  label: string;
  isDark: boolean;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.08)",
        color: "inherit",
      }}
    >
      <Icon size={18} className="text-[#C25A2B]" />
      {label}
    </Link>
  );
}
