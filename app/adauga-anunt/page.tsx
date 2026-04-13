"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MdClose,
  MdAddPhotoAlternate,
  MdAdd,
  MdDelete,
  MdCheckCircle,
  MdDragIndicator,
  MdHome,
  MdApartment,
  MdTerrain,
  MdStore,
  MdArrowForward,
  MdArrowBack,
  MdCameraAlt,
  MdLocationOn,
  MdMyLocation,
} from "react-icons/md";
import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import { useUploadThing } from "../components/Uploadthing";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Încarcă harta doar pe client
const LocationPickerMap = dynamic(
  () => import("../components/LocationPickerMap"),
  { ssr: false, loading: () => <div className="h-[350px] rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-400">Se încarcă harta...</div> }
);

// ─── Tipuri ──────────────────────────────────────────────────────────────
type TipProprietate = "Apartament" | "Casă/Vilă" | "Teren" | "Comercial";
type SubtipComercial = "" | "Stradal/Retail" | "Birouri" | "Depozit/Hala";

interface Camera {
  id: string;
  nume: string;
  imagini: { id: string; url: string }[];
}

// ─── Componente helper reutilizabile ─────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  style,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  style: React.CSSProperties;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
        {required && <span className="text-[#C25A2B] ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-10 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300 text-sm"
          style={style}
        >
          <option value="">Selectează</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  style,
  type = "text",
  required = false,
  suffix,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  style: React.CSSProperties;
  type?: string;
  required?: boolean;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
        {required && <span className="text-[#C25A2B] ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder || label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300 text-sm ${suffix ? "pr-12" : ""}`}
          style={style}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
  style,
  required = false,
  rows = 4,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  style: React.CSSProperties;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
        {required && <span className="text-[#C25A2B] ml-0.5">*</span>}
      </label>
      <textarea
        placeholder={placeholder || label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300 text-sm resize-none"
        style={style}
      />
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onChange,
  multi = false,
  required = false,
}: {
  label: string;
  options: string[];
  selected: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
  required?: boolean;
}) {
  const isSelected = (o: string) =>
    multi ? (selected as string[]).includes(o) : selected === o;

  const handleClick = (o: string) => {
    if (multi) {
      const arr = selected as string[];
      if (arr.includes(o)) {
        onChange(arr.filter((x) => x !== o));
      } else {
        onChange([...arr, o]);
      }
    } else {
      onChange(selected === o ? "" : o);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
        {required && <span className="text-[#C25A2B] ml-0.5">*</span>}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => handleClick(o)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
              isSelected(o)
                ? "bg-[#C25A2B] text-white border-[#C25A2B]"
                : "bg-white/40 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  required?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-[#C25A2B] ml-0.5">*</span>}
      </span>
      <div className="flex gap-1">
        {(["Da", "Nu"] as const).map((opt) => {
          const boolVal = opt === "Da";
          const isActive = value === boolVal;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(isActive ? null : boolVal)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 border ${
                isActive
                  ? "bg-[#C25A2B] text-white border-[#C25A2B]"
                  : "bg-white/40 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Secțiune Glass Card ─────────────────────────────────────────────────
function GlassSection({
  title,
  icon,
  children,
  isDark,
  step,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isDark: boolean;
  step?: number;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: isDark
          ? "rgba(35, 35, 48, 0.45)"
          : "rgba(255, 255, 255, 0.55)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(255, 255, 255, 0.45)",
        boxShadow: isDark
          ? "0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
          : "0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(60px) saturate(1.6)",
        WebkitBackdropFilter: "blur(60px) saturate(1.6)",
      }}
    >
      {/* Reflexie subtilă */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: isDark
            ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div className="relative z-[1] p-5 md:p-6">
        <div className="flex items-center gap-3 mb-5">
          {step && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
              }}
            >
              {step}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[#C25A2B]">{icon}</span>
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              {title}
            </h2>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Predefined room names ───────────────────────────────────────────────
const CAMERE_PREDEFINITE = [
  "Living",
  "Dormitor",
  "Bucătărie",
  "Baie",
  "Hol",
  "Balcon",
  "Terasă",
  "Birou",
  "Dressing",
  "Debara",
  "Garaj",
  "Grădină",
  "Curte",
  "Fațadă",
];

// ─── Componenta principală ───────────────────────────────────────────────

export default function AdaugaAnuntPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Info de bază ──
  const [titlu, setTitlu] = useState("");
  const [descriere, setDescriere] = useState("");
  const [tipTranzactie, setTipTranzactie] = useState("Vânzare");
  const [tipProprietate, setTipProprietate] = useState<TipProprietate>("Apartament");
  const [subtipComercial, setSubtipComercial] = useState<SubtipComercial>("");
  const [pret, setPret] = useState("");
  const [moneda, setMoneda] = useState("RON");
  /** true = TVA inclus în preț; false = TVA nu e inclus */
  const [tvaInclus, setTvaInclus] = useState<boolean | null>(null);
  const [locatie, setLocatie] = useState("");
  const [adresa, setAdresa] = useState("");
  const [sector, setSector] = useState("");

  // ── Apartament ──
  const [camere, setCamere] = useState("");
  const [suprafataUtila, setSuprafataUtila] = useState("");
  const [suprafataConstruita, setSuprafataConstruita] = useState("");
  const [etaj, setEtaj] = useState("");
  const [etajTotal, setEtajTotal] = useState("");
  const [compartimentare, setCompartimentare] = useState("");
  const [anConstructie, setAnConstructie] = useState("");
  const [stare, setStare] = useState("");
  const [mobilare, setMobilare] = useState("");
  // Apartament avansate
  const [confort, setConfort] = useState("");
  const [lift, setLift] = useState<boolean | null>(null);
  const [balcon, setBalcon] = useState<boolean | null>(null);
  const [nrBalcoane, setNrBalcoane] = useState("");
  const [incalzire, setIncalzire] = useState("");
  const [locParcare, setLocParcare] = useState<boolean | null>(null);
  const [tipParcare, setTipParcare] = useState("");
  const [boxa, setBoxa] = useState<boolean | null>(null);
  const [orientare, setOrientare] = useState<string[]>([]);
  const [tipCladire, setTipCladire] = useState("");

  // ── Casă/Vilă ──
  const [suprafataTeren, setSuprafataTeren] = useState("");
  const [nrCamere, setNrCamere] = useState("");
  const [nrDormitoareCasa, setNrDormitoareCasa] = useState("");
  const [nrBai, setNrBai] = useState("");
  const [regimInaltime, setRegimInaltime] = useState("");
  const [tipCasa, setTipCasa] = useState("");
  const [incalzireCasa, setIncalzireCasa] = useState("");
  const [utilitati, setUtilitati] = useState<string[]>([]);
  const [garaj, setGaraj] = useState<boolean | null>(null);
  const [materialCasa, setMaterialCasa] = useState("");
  const [acoperis, setAcoperis] = useState("");
  const [deschidereStrada, setDeschidereStrada] = useState("");
  const [drumAcces, setDrumAcces] = useState("");

  // ── Teren ──
  const [suprafata, setSuprafata] = useState("");
  const [intravilan, setIntravilan] = useState("");
  const [destinatieTeren, setDestinatieTeren] = useState("");
  const [deschidere, setDeschidere] = useState("");
  const [utilitatiTeren, setUtilitatiTeren] = useState<string[]>([]);
  const [puzPud, setPuzPud] = useState("");
  const [tipAccesTeren, setTipAccesTeren] = useState("");
  const [tipTeren, setTipTeren] = useState("");
  const [inApropriere, setInApropriere] = useState<string[]>([]);

  // ── Comercial (Stradal) ──
  const [traficPietonal, setTraficPietonal] = useState("");
  const [compartimentareComercial, setCompartimentareComercial] = useState("");
  const [grupSanitar, setGrupSanitar] = useState<boolean | null>(null);
  const [inaltimeLibera, setInaltimeLibera] = useState("");
  const [putereElectrica, setPutereElectrica] = useState("");
  const [ventilatie, setVentilatie] = useState<boolean | null>(null);
  const [terasa, setTerasa] = useState<boolean | null>(null);
  const [locuriParcare, setLocuriParcare] = useState("");
  const [accesMarfa, setAccesMarfa] = useState<boolean | null>(null);

  // ── Comercial (Birouri) ──
  const [clasaCladire, setClasaCladire] = useState("");
  const [nrBirouri, setNrBirouri] = useState("");
  const [locuriParcareBirouri, setLocuriParcareBirouri] = useState("");
  const [liftBirouri, setLiftBirouri] = useState<boolean | null>(null);
  const [receptie, setReceptie] = useState<boolean | null>(null);
  const [securitate, setSecuritate] = useState<boolean | null>(null);
  const [acCentralizat, setAcCentralizat] = useState<boolean | null>(null);

  // ── Comercial (Depozit/Hala) ──
  const [suprafataCurte, setSuprafataCurte] = useState("");
  const [inaltimeHala, setInaltimeHala] = useState("");
  const [accesTir, setAccesTir] = useState<boolean | null>(null);
  const [nrRampe, setNrRampe] = useState("");
  const [sarcinaPardoseala, setSarcinaPardoseala] = useState("");
  const [putereElectricaHala, setPutereElectricaHala] = useState("");
  const [incalzireHala, setIncalzireHala] = useState<boolean | null>(null);
  const [birouriIncluse, setBirouriIncluse] = useState<boolean | null>(null);
  const [mpBirouri, setMpBirouri] = useState("");

  // ── Coordonate hartă ──
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);

  // ── Imagini per cameră ──
  const [camereImagini, setCamereImagini] = useState<Camera[]>([]);
  const [numeCamera, setNumeCamera] = useState("");
  const [showCamerePresets, setShowCamerePresets] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [uploadingCameraId, setUploadingCameraId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const handleFileSelect = async (cameraId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingCameraId(cameraId);
    setUploadProgress(0);
    try {
      const fileArray = Array.from(files);
      const res = await startUpload(fileArray);
      if (res) {
        const urls = res.map((f) => f.url);
        addImaginiToCamera(cameraId, urls);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setSubmitError("Eroare la încărcarea imaginilor. Încearcă din nou.");
    } finally {
      setUploadingCameraId(null);
      setUploadProgress(0);
    }
  };

  // ── Dark mode ──
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
    const loadDefaultCurrency = async () => {
      try {
        const res = await fetch("/api/settings/public", { cache: "no-store" });
        const data = await res.json();
        const c = String(data.defaultCurrency || "RON").toUpperCase();
        if (c === "EUR") setMoneda("€");
        else if (c === "USD") setMoneda("RON");
        else setMoneda("RON");
      } catch {
        // păstrează implicitul din useState
      }
    };
    loadDefaultCurrency();
  }, []);

  useEffect(() => {
    if (tipProprietate !== "Comercial") {
      setSubtipComercial("");
    }
  }, [tipProprietate]);

  const controlStyle: React.CSSProperties = {
    background: isDark ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
    borderColor: isDark
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(255, 255, 255, 0.5)",
    boxShadow: isDark
      ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(60px) saturate(1.6)",
    WebkitBackdropFilter: "blur(60px) saturate(1.6)",
  };

  // ── Room management ──
  const addCamera = (nume: string) => {
    if (!nume.trim()) return;
    const id = `camera-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setCamereImagini((prev) => [...prev, { id, nume: nume.trim(), imagini: [] }]);
    setNumeCamera("");
    setShowCamerePresets(false);
  };

  const removeCamera = (cameraId: string) => {
    setCamereImagini((prev) => prev.filter((c) => c.id !== cameraId));
  };

  const addImaginiToCamera = (cameraId: string, urls: string[]) => {
    setCamereImagini((prev) =>
      prev.map((camera) => {
        if (camera.id !== cameraId) return camera;
        const newImages = urls.map((url) => ({
          id: `img-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          url,
        }));
        return { ...camera, imagini: [...camera.imagini, ...newImages] };
      })
    );
  };

  const removeImagine = (cameraId: string, imagineId: string) => {
    setCamereImagini((prev) =>
      prev.map((camera) => {
        if (camera.id !== cameraId) return camera;
        return {
          ...camera,
          imagini: camera.imagini.filter((i) => i.id !== imagineId),
        };
      })
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (!isSignedIn) {
        setSubmitError(
          "Trebuie să fii autentificat pentru a publica un anunț. Intră în cont și încearcă din nou.",
        );
        return;
      }

      if (!descriere.trim()) {
        setSubmitError("Completează descrierea anunțului.");
        return;
      }
      if (!locatie.trim()) {
        setSubmitError("Completează locația / zona.");
        return;
      }
      if (!sector) {
        setSubmitError("Selectează sectorul sau localitatea.");
        return;
      }
      if (tvaInclus === null) {
        setSubmitError(
          "Indică dacă prețul afișat include TVA sau nu (secțiunea Preț).",
        );
        return;
      }

      const detailsErr = validatePropertyDetails();
      if (detailsErr) {
        setSubmitError(detailsErr);
        return;
      }

      const details = {
        tipProprietate,
        subtipComercial,
        tipTranzactie,
        camere,
        suprafataUtila,
        suprafataConstruita,
        etaj,
        etajTotal,
        compartimentare,
        anConstructie,
        stare,
        mobilare,
        confort,
        lift,
        balcon,
        nrBalcoane,
        incalzire,
        locParcare,
        tipParcare,
        boxa,
        orientare,
        tipCladire,
        suprafataTeren,
        nrCamere,
        nrDormitoareCasa,
        nrBai,
        regimInaltime,
        tipCasa,
        incalzireCasa,
        utilitati,
        garaj,
        materialCasa,
        acoperis,
        deschidereStrada,
        drumAcces,
        suprafata,
        intravilan,
        destinatieTeren,
        deschidere,
        utilitatiTeren,
        puzPud,
        tipAccesTeren,
        tipTeren,
        inApropriere,
        traficPietonal,
        compartimentareComercial,
        grupSanitar,
        inaltimeLibera,
        putereElectrica,
        ventilatie,
        terasa,
        locuriParcare,
        accesMarfa,
        clasaCladire,
        nrBirouri,
        locuriParcareBirouri,
        liftBirouri,
        receptie,
        securitate,
        acCentralizat,
        suprafataCurte,
        inaltimeHala,
        accesTir,
        nrRampe,
        sarcinaPardoseala,
        putereElectricaHala,
        incalzireHala,
        birouriIncluse,
        mpBirouri,
        tvaInclus,
      };

      const images = camereImagini.map((camera) => ({
        cameraId: camera.id,
        cameraName: camera.nume,
        urls: camera.imagini.map((img) => img.url),
      }));

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          titlu,
          descriere,
          tipTranzactie,
          tipProprietate,
          subtipComercial,
          pret: pret.replace(/[^0-9]/g, ""),
          moneda,
          locatie,
          adresa,
          sector,
          latitude: pinLat,
          longitude: pinLng,
          details,
          images,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Nu am putut salva anunțul");
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error: any) {
      console.error(error);
      setSubmitError(error.message || "A apărut o eroare neașteptată");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalImagini = camereImagini.reduce(
    (acc, c) => acc + c.imagini.length,
    0
  );

  // ─── Property Type Icon ───────────────────────────────────────────────
  const getPropertyIcon = (tip: TipProprietate) => {
    switch (tip) {
      case "Apartament":
        return <MdApartment size={20} />;
      case "Casă/Vilă":
        return <MdHome size={20} />;
      case "Teren":
        return <MdTerrain size={20} />;
      case "Comercial":
        return <MdStore size={20} />;
    }
  };

  // ─── Render detalii proprietate (Essentials) ───────────────────────────

  const renderApartamentEssentials = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ChipGroup
        label="Număr camere"
        options={["Studio", "1", "2", "3", "4+"]}
        selected={camere}
        onChange={(v) => setCamere(v as string)}
        required
      />
      <InputField
        label="Suprafață utilă"
        placeholder="Ex: 65"
        value={suprafataUtila}
        onChange={setSuprafataUtila}
        style={controlStyle}
        type="number"
        suffix="m²"
        required
      />
      <InputField
        label="Suprafață construită"
        placeholder="Ex: 75"
        value={suprafataConstruita}
        onChange={setSuprafataConstruita}
        style={controlStyle}
        type="number"
        suffix="m²"
        required
      />
      <InputField
        label="Etaj"
        placeholder="Ex: 3 sau Parter"
        value={etaj}
        onChange={setEtaj}
        style={controlStyle}
        required
      />
      <InputField
        label="Etaj total clădire"
        placeholder="Ex: 10"
        value={etajTotal}
        onChange={setEtajTotal}
        style={controlStyle}
        type="number"
        required
      />
      <SelectField
        label="Compartimentare"
        value={compartimentare}
        onChange={setCompartimentare}
        options={["Decomandat", "Semidecomandat", "Nedecomandat", "Circular"]}
        style={controlStyle}
        required
      />
      <InputField
        label="An construcție"
        placeholder="Ex: 2020"
        value={anConstructie}
        onChange={setAnConstructie}
        style={controlStyle}
        type="number"
        required
      />
      <SelectField
        label="Stare"
        value={stare}
        onChange={setStare}
        options={["Nou", "Renovat", "De renovat"]}
        style={controlStyle}
        required
      />
      <SelectField
        label="Mobilat"
        value={mobilare}
        onChange={setMobilare}
        options={["Nemobilat", "Parțial mobilat", "Complet mobilat"]}
        style={controlStyle}
        required
      />
    </div>
  );

  const renderApartamentAdvanced = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <SelectField
        label="Confort"
        value={confort}
        onChange={setConfort}
        options={["Confort I", "Confort II", "Confort III"]}
        style={controlStyle}
      />
      <ToggleField
        label="Lift"
        value={lift}
        onChange={setLift}
        required
      />
      <div className="space-y-3">
        <ToggleField
          label="Balcon"
          value={balcon}
          onChange={setBalcon}
          required
        />
        {balcon && (
          <InputField
            label="Număr balcoane"
            placeholder="Ex: 2"
            value={nrBalcoane}
            onChange={setNrBalcoane}
            style={controlStyle}
            type="number"
            required
          />
        )}
      </div>
      <SelectField
        label="Încălzire"
        value={incalzire}
        onChange={setIncalzire}
        options={[
          "Centrală proprie",
          "Termoficare",
          "Încălzire în pardoseală",
        ]}
        style={controlStyle}
        required
      />
      <div className="space-y-3">
        <ToggleField
          label="Loc parcare"
          value={locParcare}
          onChange={setLocParcare}
          required
        />
        {locParcare && (
          <SelectField
            label="Tip parcare"
            value={tipParcare}
            onChange={setTipParcare}
            options={["Subteran", "Suprateran"]}
            style={controlStyle}
            required
          />
        )}
      </div>
      <ToggleField
        label="Boxă / Debara"
        value={boxa}
        onChange={setBoxa}
        required
      />
      <ChipGroup
        label="Orientare"
        options={["N", "S", "E", "V"]}
        selected={orientare}
        onChange={(v) => setOrientare(v as string[])}
        multi
      />
      <SelectField
        label="Tip clădire"
        value={tipCladire}
        onChange={setTipCladire}
        options={["Bloc", "Vilă", "Ansamblu rezidențial"]}
        style={controlStyle}
        required
      />
    </div>
  );

  const renderCasaEssentials = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <InputField
        label="Suprafață utilă"
        placeholder="Ex: 150"
        value={suprafataUtila}
        onChange={setSuprafataUtila}
        style={controlStyle}
        type="number"
        suffix="m²"
        required
      />
      <InputField
        label="Suprafață teren"
        placeholder="Ex: 500"
        value={suprafataTeren}
        onChange={setSuprafataTeren}
        style={controlStyle}
        type="number"
        suffix="m²"
        required
      />
      <InputField
        label="Număr camere"
        placeholder="Ex: 5"
        value={nrCamere}
        onChange={setNrCamere}
        style={controlStyle}
        type="number"
        required
      />
      <InputField
        label="Număr dormitoare"
        placeholder="Ex: 3"
        value={nrDormitoareCasa}
        onChange={setNrDormitoareCasa}
        style={controlStyle}
        type="number"
        required
      />
      <InputField
        label="Număr băi"
        placeholder="Ex: 2"
        value={nrBai}
        onChange={setNrBai}
        style={controlStyle}
        type="number"
        required
      />
      <SelectField
        label="Regim înălțime"
        value={regimInaltime}
        onChange={setRegimInaltime}
        options={["P", "P+1", "P+2", "P+3", "P+M", "P+1+M"]}
        style={controlStyle}
        required
      />
      <SelectField
        label="Stare"
        value={stare}
        onChange={setStare}
        options={["Nou", "Renovat", "De renovat"]}
        style={controlStyle}
        required
      />
      <SelectField
        label="Tip casă"
        value={tipCasa}
        onChange={setTipCasa}
        options={["Individuală", "Duplex", "Înșiruită"]}
        style={controlStyle}
        required
      />
      <InputField
        label="An construcție"
        placeholder="Ex: 2020"
        value={anConstructie}
        onChange={setAnConstructie}
        style={controlStyle}
        type="number"
        required
      />
    </div>
  );

  const renderCasaAdvanced = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <SelectField
        label="Încălzire"
        value={incalzireCasa}
        onChange={setIncalzireCasa}
        options={["Centrală termică", "Pompă de căldură", "Sobă", "Electrică"]}
        style={controlStyle}
        required
      />
      <ChipGroup
        label="Utilități"
        options={["Apă", "Canal", "Gaz", "Curent"]}
        selected={utilitati}
        onChange={(v) => setUtilitati(v as string[])}
        multi
        required
      />
      <ToggleField
        label="Garaj / Parcare"
        value={garaj}
        onChange={setGaraj}
        required
      />
      <SelectField
        label="Material construcție"
        value={materialCasa}
        onChange={setMaterialCasa}
        options={["Cărămidă", "BCA", "Lemn", "Beton"]}
        style={controlStyle}
        required
      />
      <SelectField
        label="Acoperiș"
        value={acoperis}
        onChange={setAcoperis}
        options={["Țiglă", "Tablă", "Terasă"]}
        style={controlStyle}
        required
      />
      <InputField
        label="Deschidere la stradă"
        placeholder="Ex: 15"
        value={deschidereStrada}
        onChange={setDeschidereStrada}
        style={controlStyle}
        type="number"
        suffix="m"
        required
      />
      <SelectField
        label="Drum de acces"
        value={drumAcces}
        onChange={setDrumAcces}
        options={["Asfalt", "Pietruit", "Pământ"]}
        style={controlStyle}
        required
      />
    </div>
  );

  const renderTerenEssentials = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <InputField
        label="Suprafață"
        placeholder="Ex: 1000"
        value={suprafata}
        onChange={setSuprafata}
        style={controlStyle}
        type="number"
        suffix="m²"
        required
      />
      <ChipGroup
        label="Clasificare"
        options={["Intravilan", "Extravilan"]}
        selected={intravilan}
        onChange={(v) => setIntravilan(v as string)}
        required
      />
      <SelectField
        label="Destinație"
        value={destinatieTeren}
        onChange={setDestinatieTeren}
        options={["Construcții", "Agricol", "Pășune", "Livadă", "Forestier"]}
        style={controlStyle}
        required
      />
      <InputField
        label="Deschidere"
        placeholder="Ex: 25"
        value={deschidere}
        onChange={setDeschidere}
        style={controlStyle}
        type="number"
        suffix="m"
        required
      />
      <ChipGroup
        label="Utilități disponibile"
        options={["Curent", "Gaz", "Apă", "Canalizare"]}
        selected={utilitatiTeren}
        onChange={(v) => setUtilitatiTeren(v as string[])}
        multi
        required
      />
    </div>
  );

  const renderTerenAdvanced = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <SelectField
        label="PUZ / PUD"
        value={puzPud}
        onChange={setPuzPud}
        options={["Da", "Nu", "În lucru"]}
        style={controlStyle}
        required
      />
      <SelectField
        label="Tip acces"
        value={tipAccesTeren}
        onChange={setTipAccesTeren}
        options={["Asfalt", "Pietruit", "Pământ"]}
        style={controlStyle}
        required
      />
      <SelectField
        label="Tip teren"
        value={tipTeren}
        onChange={setTipTeren}
        options={["Plat", "În pantă"]}
        style={controlStyle}
        required
      />
      <ChipGroup
        label="În apropiere"
        options={["Pădure", "Lac", "Parc"]}
        selected={inApropriere}
        onChange={(v) => setInApropriere(v as string[])}
        multi
        required
      />
    </div>
  );

  // ── Comercial subtip selector ──
  const renderComercialSubtipSelector = () => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Subtip spațiu comercial
        <span className="text-[#C25A2B] ml-0.5">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {(
          ["Stradal/Retail", "Birouri", "Depozit/Hala"] as SubtipComercial[]
        ).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() =>
              setSubtipComercial(subtipComercial === st ? "" : st)
            }
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              subtipComercial === st
                ? "bg-[#C25A2B] text-white border-[#C25A2B]"
                : "bg-white/40 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStradalEssentials = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <InputField
        label="Suprafață utilă"
        placeholder="Ex: 100"
        value={suprafataUtila}
        onChange={setSuprafataUtila}
        style={controlStyle}
        type="number"
        suffix="m²"
        required
      />
      <SelectField
        label="Trafic pietonal"
        value={traficPietonal}
        onChange={setTraficPietonal}
        options={["Mic", "Mediu", "Mare"]}
        style={controlStyle}
        required
      />
      <SelectField
        label="Compartimentare"
        value={compartimentareComercial}
        onChange={setCompartimentareComercial}
        options={["Open space", "Compartimentat"]}
        style={controlStyle}
        required
      />
      <ToggleField
        label="Grup sanitar"
        value={grupSanitar}
        onChange={setGrupSanitar}
        required
      />
    </div>
  );

  const renderStradalAdvanced = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <InputField
        label="Înălțime liberă"
        placeholder="Ex: 3.5"
        value={inaltimeLibera}
        onChange={setInaltimeLibera}
        style={controlStyle}
        type="number"
        suffix="m"
        required
      />
      <InputField
        label="Putere electrică"
        placeholder="Ex: 50"
        value={putereElectrica}
        onChange={setPutereElectrica}
        style={controlStyle}
        type="number"
        suffix="kW"
        required
      />
      <ToggleField
        label="Ventilație / Hotă"
        value={ventilatie}
        onChange={setVentilatie}
        required
      />
      <ToggleField
        label="Terasă"
        value={terasa}
        onChange={setTerasa}
        required
      />
      <InputField
        label="Locuri parcare"
        placeholder="Ex: 5"
        value={locuriParcare}
        onChange={setLocuriParcare}
        style={controlStyle}
        type="number"
        required
      />
      <ToggleField
        label="Acces marfă"
        value={accesMarfa}
        onChange={setAccesMarfa}
        required
      />
    </div>
  );

  const renderBirouriEssentials = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <InputField
        label="Suprafață"
        placeholder="Ex: 200"
        value={suprafataUtila}
        onChange={setSuprafataUtila}
        style={controlStyle}
        type="number"
        suffix="m²"
        required
      />
      <SelectField
        label="Clasă clădire"
        value={clasaCladire}
        onChange={setClasaCladire}
        options={["A", "B", "C"]}
        style={controlStyle}
        required
      />
      <InputField
        label="Nr. camere / birouri"
        placeholder="Ex: 5"
        value={nrBirouri}
        onChange={setNrBirouri}
        style={controlStyle}
        required
      />
      <InputField
        label="Locuri parcare"
        placeholder="Ex: 10"
        value={locuriParcareBirouri}
        onChange={setLocuriParcareBirouri}
        style={controlStyle}
        type="number"
        required
      />
    </div>
  );

  const renderBirouriAdvanced = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <ToggleField
        label="Lift"
        value={liftBirouri}
        onChange={setLiftBirouri}
        required
      />
      <ToggleField
        label="Recepție"
        value={receptie}
        onChange={setReceptie}
        required
      />
      <ToggleField
        label="Securitate"
        value={securitate}
        onChange={setSecuritate}
        required
      />
      <ToggleField
        label="Aer condiționat centralizat"
        value={acCentralizat}
        onChange={setAcCentralizat}
        required
      />
      <InputField
        label="An construcție / renovare"
        placeholder="Ex: 2020"
        value={anConstructie}
        onChange={setAnConstructie}
        style={controlStyle}
        type="number"
        required
      />
    </div>
  );

  const renderDepozitEssentials = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <InputField
        label="Suprafață hală"
        placeholder="Ex: 500"
        value={suprafataUtila}
        onChange={setSuprafataUtila}
        style={controlStyle}
        type="number"
        suffix="m²"
        required
      />
      <InputField
        label="Suprafață curte / platformă"
        placeholder="Ex: 1000"
        value={suprafataCurte}
        onChange={setSuprafataCurte}
        style={controlStyle}
        type="number"
        suffix="m²"
        required
      />
      <InputField
        label="Înălțime"
        placeholder="Ex: 8"
        value={inaltimeHala}
        onChange={setInaltimeHala}
        style={controlStyle}
        type="number"
        suffix="m"
        required
      />
      <ToggleField
        label="Acces TIR"
        value={accesTir}
        onChange={setAccesTir}
        required
      />
      <InputField
        label="Nr. rampe / uși"
        placeholder="Ex: 4"
        value={nrRampe}
        onChange={setNrRampe}
        style={controlStyle}
        type="number"
        required
      />
    </div>
  );

  const renderDepozitAdvanced = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <InputField
        label="Sarcină pardoseală"
        placeholder="Ex: 5"
        value={sarcinaPardoseala}
        onChange={setSarcinaPardoseala}
        style={controlStyle}
        suffix="t/m²"
        required
      />
      <InputField
        label="Putere electrică"
        placeholder="Ex: 100"
        value={putereElectricaHala}
        onChange={setPutereElectricaHala}
        style={controlStyle}
        type="number"
        suffix="kW"
        required
      />
      <ToggleField
        label="Încălzire"
        value={incalzireHala}
        onChange={setIncalzireHala}
        required
      />
      <div className="space-y-3">
        <ToggleField
          label="Birouri incluse"
          value={birouriIncluse}
          onChange={setBirouriIncluse}
          required
        />
        {birouriIncluse && (
          <InputField
            label="Suprafață birouri"
            placeholder="Ex: 50"
            value={mpBirouri}
            onChange={setMpBirouri}
            style={controlStyle}
            type="number"
            suffix="m²"
            required
          />
        )}
      </div>
    </div>
  );

  // ── Dispatch ──
  const renderEssentials = () => {
    switch (tipProprietate) {
      case "Apartament":
        return renderApartamentEssentials();
      case "Casă/Vilă":
        return renderCasaEssentials();
      case "Teren":
        return renderTerenEssentials();
      case "Comercial":
        return (
          <>
            {renderComercialSubtipSelector()}
            {subtipComercial === "Stradal/Retail" &&
              renderStradalEssentials()}
            {subtipComercial === "Birouri" && renderBirouriEssentials()}
            {subtipComercial === "Depozit/Hala" &&
              renderDepozitEssentials()}
          </>
        );
      default:
        return null;
    }
  };

  const renderAdvanced = () => {
    switch (tipProprietate) {
      case "Apartament":
        return renderApartamentAdvanced();
      case "Casă/Vilă":
        return renderCasaAdvanced();
      case "Teren":
        return renderTerenAdvanced();
      case "Comercial":
        if (subtipComercial === "Stradal/Retail")
          return renderStradalAdvanced();
        if (subtipComercial === "Birouri") return renderBirouriAdvanced();
        if (subtipComercial === "Depozit/Hala")
          return renderDepozitAdvanced();
        return null;
      default:
        return null;
    }
  };

  const validatePropertyDetails = (): string | null => {
    if (tipProprietate === "Comercial" && !subtipComercial) {
      return "Selectează subtipul spațiului comercial.";
    }

    if (tipProprietate === "Apartament") {
      if (!camere) return "Selectează numărul de camere.";
      if (!suprafataUtila.trim()) return "Completează suprafața utilă.";
      if (!suprafataConstruita.trim()) return "Completează suprafața construită.";
      if (!etaj.trim()) return "Completează etajul.";
      if (!etajTotal.trim()) return "Completează etajul total al clădirii.";
      if (!compartimentare) return "Selectează compartimentarea.";
      if (!anConstructie.trim()) return "Completează anul construcției.";
      if (!stare) return "Selectează starea proprietății.";
      if (!mobilare) return "Selectează mobilarea.";
      if (lift === null) return "Indică dacă există lift.";
      if (balcon === null) return "Indică dacă există balcon.";
      if (balcon === true && !nrBalcoane.trim()) {
        return "Completează numărul de balcoane.";
      }
      if (!incalzire) return "Selectează tipul de încălzire.";
      if (locParcare === null) return "Indică dacă există loc de parcare.";
      if (locParcare === true && !tipParcare) {
        return "Selectează tipul de parcare.";
      }
      if (boxa === null) return "Indică dacă există boxă / debară.";
      if (!tipCladire) return "Selectează tipul clădirii.";
      return null;
    }

    if (tipProprietate === "Casă/Vilă") {
      if (!suprafataUtila.trim()) return "Completează suprafața utilă.";
      if (!suprafataTeren.trim()) return "Completează suprafața terenului.";
      if (!nrCamere.trim()) return "Completează numărul de camere.";
      if (!nrDormitoareCasa.trim()) {
        return "Completează numărul de dormitoare.";
      }
      if (!nrBai.trim()) return "Completează numărul de băi.";
      if (!regimInaltime) return "Selectează regimul de înălțime.";
      if (!stare) return "Selectează starea proprietății.";
      if (!tipCasa) return "Selectează tipul casei.";
      if (!anConstructie.trim()) return "Completează anul construcției.";
      if (!incalzireCasa) return "Selectează tipul de încălzire.";
      if (utilitati.length === 0) {
        return "Selectează cel puțin o utilitate disponibilă.";
      }
      if (garaj === null) return "Indică dacă există garaj / parcare.";
      if (!materialCasa) return "Selectează materialul de construcție.";
      if (!acoperis) return "Selectează tipul de acoperiș.";
      if (!deschidereStrada.trim()) {
        return "Completează deschiderea la stradă.";
      }
      if (!drumAcces) return "Selectează drumul de acces.";
      return null;
    }

    if (tipProprietate === "Teren") {
      if (!suprafata.trim()) return "Completează suprafața terenului.";
      if (!intravilan) {
        return "Selectează clasificarea (intravilan / extravilan).";
      }
      if (!destinatieTeren) return "Selectează destinația terenului.";
      if (!deschidere.trim()) return "Completează deschiderea.";
      if (utilitatiTeren.length === 0) {
        return "Selectează cel puțin o utilitate disponibilă.";
      }
      if (!puzPud) return "Selectează situația PUZ / PUD.";
      if (!tipAccesTeren) return "Selectează tipul de acces.";
      if (!tipTeren) return "Selectează tipul terenului.";
      if (inApropriere.length === 0) {
        return 'Selectează cel puțin o opțiune la „În apropiere”.';
      }
      return null;
    }

    if (tipProprietate === "Comercial") {
      if (subtipComercial === "Stradal/Retail") {
        if (!suprafataUtila.trim()) return "Completează suprafața utilă.";
        if (!traficPietonal) return "Selectează traficul pietonal.";
        if (!compartimentareComercial) return "Selectează compartimentarea.";
        if (grupSanitar === null) return "Indică dacă există grup sanitar.";
        if (!inaltimeLibera.trim()) return "Completează înălțimea liberă.";
        if (!putereElectrica.trim()) return "Completează puterea electrică.";
        if (ventilatie === null) return "Indică dacă există ventilație / hotă.";
        if (terasa === null) return "Indică dacă există terasă.";
        if (!locuriParcare.trim()) {
          return "Completează numărul de locuri de parcare.";
        }
        if (accesMarfa === null) return "Indică dacă există acces marfă.";
        return null;
      }
      if (subtipComercial === "Birouri") {
        if (!suprafataUtila.trim()) return "Completează suprafața.";
        if (!clasaCladire) return "Selectează clasa clădirii.";
        if (!nrBirouri.trim()) return "Completează numărul de birouri.";
        if (!locuriParcareBirouri.trim()) {
          return "Completează locurile de parcare.";
        }
        if (liftBirouri === null) return "Indică dacă există lift.";
        if (receptie === null) return "Indică dacă există recepție.";
        if (securitate === null) return "Indică dacă există securitate.";
        if (acCentralizat === null) {
          return "Indică dacă există aer condiționat centralizat.";
        }
        if (!anConstructie.trim()) {
          return "Completează anul construcției / renovării.";
        }
        return null;
      }
      if (subtipComercial === "Depozit/Hala") {
        if (!suprafataUtila.trim()) return "Completează suprafața halei.";
        if (!suprafataCurte.trim()) {
          return "Completează suprafața curții / platformei.";
        }
        if (!inaltimeHala.trim()) return "Completează înălțimea.";
        if (accesTir === null) return "Indică dacă există acces TIR.";
        if (!nrRampe.trim()) return "Completează numărul de rampe / uși.";
        if (!sarcinaPardoseala.trim()) {
          return "Completează sarcina admisă pe pardoseală.";
        }
        if (!putereElectricaHala.trim()) {
          return "Completează puterea electrică.";
        }
        if (incalzireHala === null) return "Indică dacă există încălzire.";
        if (birouriIncluse === null) {
          return "Indică dacă există birouri incluse.";
        }
        if (birouriIncluse === true && !mpBirouri.trim()) {
          return "Completează suprafața birourilor.";
        }
        return null;
      }
    }

    return null;
  };

  // ── Success screen ──
  if (submitSuccess) {
    return (
      <div className="min-h-screen text-foreground">
        <Navbar />
        <main className="pt-20 md:pt-24 px-4 pb-12">
          <div className="w-full max-w-[800px] mx-auto mt-12">
            <div
              className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
              style={{
                fontFamily: "var(--font-galak-regular)",
                background: isDark
                  ? "rgba(35, 35, 48, 0.45)"
                  : "rgba(255, 255, 255, 0.55)",
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(255, 255, 255, 0.45)",
                boxShadow: isDark
                  ? "0 4px 20px rgba(0, 0, 0, 0.25)"
                  : "0 4px 20px rgba(0, 0, 0, 0.05)",
                backdropFilter: "blur(60px) saturate(1.6)",
                WebkitBackdropFilter: "blur(60px) saturate(1.6)",
              }}
            >
              <MdCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <h1 className="text-2xl md:text-3xl font-bold mb-3">
                Anunțul a fost trimis!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Anunțul tău va fi verificat și publicat în cel mai scurt timp
                posibil. Vei fi redirecționat către pagina principală.
              </p>
              <div className="flex justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                  }}
                >
                  Înapoi acasă
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <Navbar />

      <main className="pt-20 md:pt-24 px-4 pb-12">
        <div
          className="w-full max-w-[900px] mx-auto"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          {/* Breadcrumbs */}
          <nav
            className="text-sm text-gray-600 dark:text-gray-400 mb-4 mt-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:underline">
              Acasă
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">Adaugă anunț</span>
          </nav>

          {isLoaded && !isSignedIn && (
            <div
              className="mb-6 rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: isDark
                  ? "rgba(245, 158, 11, 0.35)"
                  : "rgba(245, 158, 11, 0.45)",
                background: isDark
                  ? "rgba(245, 158, 11, 0.08)"
                  : "rgba(245, 158, 11, 0.1)",
              }}
              role="status"
            >
              <span className="text-foreground">
                Pentru a publica un anunț trebuie să fii autentificat.{" "}
              </span>
              <Link
                href={`/sign-in?redirect_url=${encodeURIComponent("/adauga-anunt")}`}
                className="font-medium text-[#C25A2B] hover:underline"
              >
                Intră în cont
              </Link>
              {" · "}
              <Link
                href={`/inregistrare?redirect_url=${encodeURIComponent("/adauga-anunt")}`}
                className="font-medium text-[#C25A2B] hover:underline"
              >
                Cont nou
              </Link>
            </div>
          )}

          {/* Titlu pagină */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Adaugă un anunț nou
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Completează detaliile proprietății tale pentru a o publica pe
              platformă.
            </p>
          </div>

          <div className="space-y-6">
            {/* ═══ SECȚIUNEA 1: Informații de bază ═══ */}
            <GlassSection
              title="Informații de bază"
              icon={<MdHome size={22} />}
              isDark={isDark}
              step={1}
            >
              <div className="space-y-5">
                {/* Tip tranzacție + Tip proprietate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Tip tranzacție
                      <span className="text-[#C25A2B] ml-0.5">*</span>
                    </label>
                    <div className="flex gap-2">
                      {["Vânzare", "Închiriere"].map((tip) => (
                        <button
                          key={tip}
                          type="button"
                          onClick={() => setTipTranzactie(tip)}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            tipTranzactie === tip
                              ? "bg-[#C25A2B] text-white border-[#C25A2B]"
                              : "bg-white/40 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50"
                          }`}
                        >
                          {tip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Tip proprietate
                      <span className="text-[#C25A2B] ml-0.5">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          "Apartament",
                          "Casă/Vilă",
                          "Teren",
                          "Comercial",
                        ] as TipProprietate[]
                      ).map((tip) => (
                        <button
                          key={tip}
                          type="button"
                          onClick={() => setTipProprietate(tip)}
                          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                            tipProprietate === tip
                              ? "bg-[#C25A2B] text-white border-[#C25A2B]"
                              : "bg-white/40 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50"
                          }`}
                        >
                          {getPropertyIcon(tip)}
                          <span>{tip === "Comercial" ? "Comercial" : tip}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Titlu */}
                <InputField
                  label="Titlu anunț"
                  placeholder="Ex: Apartament 2 camere, zona Aviatorilor, renovat complet"
                  value={titlu}
                  onChange={setTitlu}
                  style={controlStyle}
                  required
                />

                {/* Descriere */}
                <TextAreaField
                  label="Descriere"
                  placeholder="Descrie proprietatea ta în detaliu: compartimentare, finisaje, vecinătăți, avantaje..."
                  value={descriere}
                  onChange={setDescriere}
                  style={controlStyle}
                  required
                  rows={5}
                />

                {/* Locație */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField
                    label="Locație / Zonă"
                    placeholder="Ex: Aviatorilor"
                    value={locatie}
                    onChange={setLocatie}
                    style={controlStyle}
                    required
                  />
                  <InputField
                    label="Adresă"
                    placeholder="Ex: Bd. Aviatorilor nr. 10"
                    value={adresa}
                    onChange={setAdresa}
                    style={controlStyle}
                  />
                  <SelectField
                    label="Sector / Localitate"
                    value={sector}
                    onChange={setSector}
                    options={[
                      "Sector 1",
                      "Sector 2",
                      "Sector 3",
                      "Sector 4",
                      "Sector 5",
                      "Sector 6",
                      "Ilfov",
                    ]}
                    style={controlStyle}
                    required
                  />
                </div>

                {/* Preț */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField
                    label={
                      tipTranzactie === "Închiriere"
                        ? "Preț / lună"
                        : "Preț"
                    }
                    placeholder={
                      tipTranzactie === "Închiriere"
                        ? "Ex: 500"
                        : "Ex: 85000"
                    }
                    value={pret}
                    onChange={(v) => setPret(v.replace(/[^0-9]/g, ""))}
                    style={controlStyle}
                    type="text"
                    required
                    suffix={moneda}
                  />
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Monedă
                    </label>
                    <div className="flex gap-2">
                      {["€", "RON"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMoneda(m)}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            moneda === m
                              ? "bg-[#C25A2B] text-white border-[#C25A2B]"
                              : "bg-white/40 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <ToggleField
                  label="Prețul afișat include TVA"
                  value={tvaInclus}
                  onChange={setTvaInclus}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                  Alege „Da” dacă suma introdusă la preț este deja cu TVA; „Nu”
                  dacă prețul este fără TVA (se va afișa clar pe anunț).
                </p>
              </div>
            </GlassSection>

            {/* ═══ SECȚIUNEA 2: Detalii proprietate ═══ */}
            <GlassSection
              title="Detalii proprietate"
              icon={getPropertyIcon(tipProprietate)}
              isDark={isDark}
              step={2}
            >
              <div className="space-y-4">
                {renderEssentials()}
                {renderAdvanced()}
              </div>
            </GlassSection>

            {/* ═══ SECȚIUNEA 3: Imagini per cameră ═══ */}
            <GlassSection
              title="Imagini"
              icon={<MdCameraAlt size={22} />}
              isDark={isDark}
              step={3}
            >
              <div className="space-y-5">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Adaugă imagini organizate pe camere / zone. Poți adăuga
                  câte camere dorești și încărca mai multe imagini pentru
                  fiecare.
                </p>

                {/* Camerele existente */}
                {camereImagini.map((camera) => (
                  <div
                    key={camera.id}
                    className="rounded-xl border p-4 space-y-3"
                    style={{
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.08)",
                      background: isDark
                        ? "rgba(35, 35, 48, 0.3)"
                        : "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    {/* Header cameră */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MdDragIndicator className="text-gray-400" />
                        <span className="font-medium text-sm text-foreground">
                          {camera.nume}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({camera.imagini.length}{" "}
                          {camera.imagini.length === 1
                            ? "imagine"
                            : "imagini"}
                          )
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCamera(camera.id)}
                        className="text-red-400 hover:text-red-500 transition-colors p-1"
                        title="Șterge camera"
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>

                    {/* Grid imagini */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {camera.imagini.map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square rounded-lg overflow-hidden group bg-gray-200 dark:bg-gray-800"
                        >
                          <Image
                            src={img.url}
                            alt={`${camera.nume}`}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                          <button
                            type="button"
                            onClick={() =>
                              removeImagine(camera.id, img.id)
                            }
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                          >
                            <MdClose size={14} />
                          </button>
                        </div>
                      ))}

                      {/* Upload imagini — buton custom cu file input ascuns */}
                      <div
                        className="aspect-square rounded-lg border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all duration-200 hover:border-[#C25A2B]/50 cursor-pointer"
                        style={{
                          borderColor: isDark
                            ? "rgba(255, 255, 255, 0.15)"
                            : "rgba(0, 0, 0, 0.12)",
                        }}
                        onClick={() => {
                          if (!isUploading) {
                            fileInputRefs.current[camera.id]?.click();
                          }
                        }}
                      >
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[camera.id] = el; }}
                          onChange={(e) => {
                            handleFileSelect(camera.id, e.target.files);
                            e.target.value = "";
                          }}
                        />
                        {uploadingCameraId === camera.id ? (
                          <div className="flex flex-col items-center gap-1 px-2">
                            <svg
                              className="animate-spin h-5 w-5 text-[#C25A2B]"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{uploadProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <MdAddPhotoAlternate className="text-gray-400 dark:text-gray-500" size={22} />
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Adaugă</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Adaugă cameră nouă */}
                <div
                  className="rounded-xl border-2 border-dashed p-4"
                  style={{
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Numele camerei (ex: Living, Dormitor 1...)"
                        value={numeCamera}
                        onChange={(e) => setNumeCamera(e.target.value)}
                        onFocus={() => setShowCamerePresets(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCamera(numeCamera);
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300 text-sm"
                        style={controlStyle}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addCamera(numeCamera)}
                      disabled={!numeCamera.trim()}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        boxShadow:
                          "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                      }}
                    >
                      <MdAdd size={18} />
                      <span>Adaugă cameră</span>
                    </button>
                  </div>

                  {/* Preset-uri de camere */}
                  {showCamerePresets && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {CAMERE_PREDEFINITE.filter(
                        (c) =>
                          !camereImagini.some(
                            (ci) =>
                              ci.nume.toLowerCase() === c.toLowerCase()
                          )
                      ).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => addCamera(preset)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border bg-white/40 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50 hover:text-[#C25A2B]"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mesaj eroare submit */}
                {submitError && (
                  <div className="text-xs text-red-500 text-center">
                    {submitError}
                  </div>
                )}

                {/* Contor total imagini */}
                {totalImagini > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Total: {totalImagini}{" "}
                    {totalImagini === 1 ? "imagine" : "imagini"} în{" "}
                    {camereImagini.length}{" "}
                    {camereImagini.length === 1 ? "cameră" : "camere"}
                  </div>
                )}
              </div>
            </GlassSection>

            {/* ═══ SECȚIUNEA 4: Locație pe hartă ═══ */}
            <GlassSection
              title="Locație pe hartă"
              icon={<MdLocationOn size={22} />}
              isDark={isDark}
              step={4}
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Apasă pe hartă pentru a fixa locația proprietății. Poți da zoom și trage harta pentru a găsi locația exactă.
                </p>

                <div className="rounded-xl overflow-hidden border" style={{
                  borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
                }}>
                  <LocationPickerMap
                    lat={pinLat}
                    lng={pinLng}
                    onLocationSelect={(lat, lng) => {
                      setPinLat(lat);
                      setPinLng(lng);
                    }}
                  />
                </div>

                {pinLat !== null && pinLng !== null ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <MdCheckCircle size={16} />
                      <span>Locație selectată: {pinLat.toFixed(5)}, {pinLng.toFixed(5)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPinLat(null); setPinLng(null); }}
                      className="text-xs text-red-400 hover:text-red-500 transition-colors"
                    >
                      Șterge pin
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <MdMyLocation size={16} />
                    <span>Apasă pe hartă pentru a selecta locația</span>
                  </div>
                )}
              </div>
            </GlassSection>

            {/* ═══ Buton submit ═══ */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Link
                href="/"
                className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 border text-center bg-white/40 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C25A2B]/50"
              >
                Anulează
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !titlu.trim() || !pret.trim()}
                className="px-8 py-3 rounded-xl text-white font-medium text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow:
                    "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Se trimite...</span>
                  </>
                ) : (
                  <>
                    <span>Publică anunțul</span>
                    <MdArrowForward size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
