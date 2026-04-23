"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
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
  MdLocationOn,
  MdGroups,
  MdImage,
  MdDeleteOutline,
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";
import { useUploadThing } from "@/app/components/Uploadthing";
import { ListingDescriptionEditor } from "@/app/components/ListingDescriptionEditor";

type CollaboratorDto = {
  name: string;
  imageUrl: string;
  description: string;
};

type PlatformSettingsDto = {
  id: string;
  key: string;
  siteName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  defaultCurrency: string;
  registrationsEnabled: boolean;
  newListingsAutoApprove: boolean;
  cityCenterLatitude?: number | null;
  cityCenterLongitude?: number | null;
  collaboratorsTitle?: string | null;
  collaboratorsImageUrl?: string | null;
  collaboratorsDescription?: string | null;
  collaborators?: CollaboratorDto[];
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
  const [cityCenterLatitude, setCityCenterLatitude] = useState("");
  const [cityCenterLongitude, setCityCenterLongitude] = useState("");
  const [collaborators, setCollaborators] = useState<CollaboratorDto[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const updateCollaboratorAt = (
    index: number,
    patch: Partial<CollaboratorDto>,
  ) => {
    setCollaborators((current) =>
      current.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  };

  const addCollaborator = () => {
    setCollaborators((current) => [
      ...current,
      { name: "", imageUrl: "", description: "" },
    ]);
  };

  const removeCollaboratorAt = (index: number) => {
    setCollaborators((current) => current.filter((_, i) => i !== index));
  };

  const moveCollaborator = (index: number, direction: -1 | 1) => {
    setCollaborators((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

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
        setCityCenterLatitude(
          s.cityCenterLatitude != null && Number.isFinite(s.cityCenterLatitude)
            ? String(s.cityCenterLatitude)
            : "",
        );
        setCityCenterLongitude(
          s.cityCenterLongitude != null && Number.isFinite(s.cityCenterLongitude)
            ? String(s.cityCenterLongitude)
            : "",
        );
        const incoming = Array.isArray(s.collaborators) ? s.collaborators : [];
        if (incoming.length > 0) {
          setCollaborators(
            incoming.map((c) => ({
              name: c.name ?? "",
              imageUrl: c.imageUrl ?? "",
              description: c.description ?? "",
            })),
          );
        } else if (
          s.collaboratorsTitle ||
          s.collaboratorsImageUrl ||
          s.collaboratorsDescription
        ) {
          setCollaborators([
            {
              name: s.collaboratorsTitle ?? "",
              imageUrl: s.collaboratorsImageUrl ?? "",
              description: s.collaboratorsDescription ?? "",
            },
          ]);
        } else {
          setCollaborators([]);
        }
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
          cityCenterLatitude: cityCenterLatitude.trim() || null,
          cityCenterLongitude: cityCenterLongitude.trim() || null,
          collaborators: collaborators
            .map((c) => ({
              name: c.name.trim(),
              imageUrl: c.imageUrl.trim(),
              description: c.description.trim(),
            }))
            .filter((c) => c.name || c.imageUrl || c.description),
          collaboratorsTitle: null,
          collaboratorsImageUrl: null,
          collaboratorsDescription: null,
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

                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MdLocationOn size={22} className="text-[#C25A2B]" />
                    Centru oraș (scor performanță agenți)
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Coordonate WGS84 pentru „Punctul 0” folosit la calculul
                    distanței (Haversine) în modulul de scoring. Dacă lași gol,
                    se folosesc variabilele de mediu{" "}
                    <code className="text-xs">CITY_CENTER_LATITUDE</code> /{" "}
                    <code className="text-xs">CITY_CENTER_LONGITUDE</code> sau
                    implicit centrul Bucureștiului.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Latitudine
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={cityCenterLatitude}
                        onChange={(e) => setCityCenterLatitude(e.target.value)}
                        placeholder="ex: 44.4358"
                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/80 dark:bg-[#1B1B21]/90 border border-gray-200 dark:border-white/10"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Longitudine
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={cityCenterLongitude}
                        onChange={(e) => setCityCenterLongitude(e.target.value)}
                        placeholder="ex: 26.1025"
                        className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/80 dark:bg-[#1B1B21]/90 border border-gray-200 dark:border-white/10"
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
                    <MdGroups size={22} className="text-[#C25A2B]" />
                    Colaboratori (homepage)
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lista colaboratorilor este afișată pe pagina principală sub
                    titlul „Colaboratori”. Dacă adaugi mai mulți, sunt arătați
                    într-un carusel.
                  </p>
                  <div className="space-y-4">
                    {collaborators.length === 0 ? (
                      <p
                        className="text-sm text-gray-500 dark:text-gray-400 italic rounded-xl px-4 py-3"
                        style={{
                          background: isDark
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(0,0,0,0.03)",
                          border: isDark
                            ? "1px dashed rgba(255,255,255,0.12)"
                            : "1px dashed rgba(0,0,0,0.12)",
                        }}
                      >
                        Niciun colaborator adăugat. Apasă „Adaugă colaborator”
                        pentru a începe.
                      </p>
                    ) : (
                      collaborators.map((entry, index) => (
                        <CollaboratorRowEditor
                          key={index}
                          index={index}
                          total={collaborators.length}
                          entry={entry}
                          isDark={isDark}
                          onChange={(patch) =>
                            updateCollaboratorAt(index, patch)
                          }
                          onMove={(direction) =>
                            moveCollaborator(index, direction)
                          }
                          onRemove={() => removeCollaboratorAt(index)}
                          onUploadError={(message) => setError(message)}
                        />
                      ))
                    )}
                    <button
                      type="button"
                      onClick={addCollaborator}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#C25A2B] hover:opacity-90"
                    >
                      <MdGroups size={18} /> Adaugă colaborator
                    </button>
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

function CollaboratorRowEditor({
  index,
  total,
  entry,
  isDark,
  onChange,
  onMove,
  onRemove,
  onUploadError,
}: {
  index: number;
  total: number;
  entry: CollaboratorDto;
  isDark: boolean;
  onChange: (patch: Partial<CollaboratorDto>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onUploadError: (message: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { startUpload, isUploading } = useUploadThing("imageUploader");

  const handleSelect = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const uploaded = await startUpload(Array.from(files));
      const uploadedUrl = uploaded?.[0]?.url;
      if (uploadedUrl) {
        onChange({ imageUrl: uploadedUrl });
      }
    } catch (uploadError) {
      onUploadError(
        uploadError instanceof Error
          ? uploadError.message
          : "Eroare la încărcarea imaginii.",
      );
    }
  };

  return (
    <div
      className="rounded-2xl p-4 md:p-5 space-y-4"
      style={{
        background: isDark ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.03)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Colaborator #{index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="p-2 rounded-lg text-gray-500 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Mută mai sus"
            title="Mută mai sus"
          >
            <MdArrowUpward size={18} />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="p-2 rounded-lg text-gray-500 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Mută mai jos"
            title="Mută mai jos"
          >
            <MdArrowDownward size={18} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
            aria-label="Șterge colaboratorul"
            title="Șterge colaboratorul"
          >
            <MdDeleteOutline size={18} />
          </button>
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          Nume colaborator
        </span>
        <input
          type="text"
          value={entry.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="ex: Banca X"
          className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/80 dark:bg-[#1B1B21]/90 border border-gray-200 dark:border-white/10"
        />
      </label>

      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
          <MdImage size={14} /> Imagine colaborator
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              void handleSelect(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#C25A2B] hover:opacity-90 disabled:opacity-50"
          >
            {isUploading ? "Se încarcă..." : "Încarcă imaginea"}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            PNG / JPG / WEBP
          </span>
        </div>
        {entry.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.imageUrl}
            alt={entry.name || `Colaborator ${index + 1}`}
            className="w-full max-w-md rounded-xl border border-gray-200 dark:border-white/10 object-cover max-h-56"
          />
        ) : null}
      </div>

      <ListingDescriptionEditor
        value={entry.description}
        onChange={(html) => onChange({ description: html })}
        placeholder="Descrierea colaboratorului (rich text)"
        controlStyle={{
          background: isDark
            ? "rgba(0,0,0,0.2)"
            : "rgba(255,255,255,0.75)",
          borderColor: isDark
            ? "rgba(255,255,255,0.12)"
            : "rgba(0,0,0,0.08)",
        }}
        label="Descriere"
        required={false}
        helperText="Poți formata textul (titluri, liste, link-uri). Se afișează pe homepage."
      />
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
