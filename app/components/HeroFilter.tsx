"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CiSettings } from "react-icons/ci";
import { MdArrowBack, MdTune, MdExpandMore, MdExpandLess } from "react-icons/md";

// ─── Tipuri ──────────────────────────────────────────────────────────────
type TipProprietate = "Apartament" | "Casă/Vilă" | "Teren" | "Comercial";
type SubtipComercial = "" | "Stradal/Retail" | "Birouri" | "Depozit/Hala";

// ─── Componente helper reutilizabile ─────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  style,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  style: React.CSSProperties;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
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
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function RangeFields({
  label,
  labelMin,
  labelMax,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  style,
  type = "text",
}: {
  label?: string;
  labelMin: string;
  labelMax: string;
  valueMin: string;
  valueMax: string;
  onChangeMin: (v: string) => void;
  onChangeMax: (v: string) => void;
  style: React.CSSProperties;
  type?: string;
}) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type={type}
          placeholder={labelMin}
          value={valueMin}
          onChange={(e) => onChangeMin(e.target.value)}
          className="w-1/2 px-3 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300 text-sm"
          style={style}
        />
        <input
          type={type}
          placeholder={labelMax}
          value={valueMax}
          onChange={(e) => onChangeMax(e.target.value)}
          className="w-1/2 px-3 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300 text-sm"
          style={style}
        />
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  placeholder,
  value,
  onChange,
  style,
  type = "text",
  className = "",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  style: React.CSSProperties;
  type?: string;
  className?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder || label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300 text-sm ${className}`}
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
}: {
  label: string;
  options: string[];
  selected: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
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
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
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

// ─── Componenta principală ───────────────────────────────────────────────

export default function HeroFilter() {
  const [filtrareAvansata, setFiltrareAvansata] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [tipProprietate, setTipProprietate] = useState<TipProprietate>("Apartament");
  const [subtipComercial, setSubtipComercial] = useState<SubtipComercial>("");
  const [tipTranzactie, setTipTranzactie] = useState("Vânzare");
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  // ── Filtre comune ──
  const [pretMax, setPretMax] = useState("");
  const [pretMin, setPretMin] = useState("");
  const [suprafataMin, setSuprafataMin] = useState("");
  const [suprafataMax, setSuprafataMax] = useState("");
  const [anConstructieMin, setAnConstructieMin] = useState("");
  const [anConstructieMax, setAnConstructieMax] = useState("");
  const [locatie, setLocatie] = useState("");

  // ── Apartament essentials ──
  const [camere, setCamere] = useState("");
  const [etajMin, setEtajMin] = useState("");
  const [etajMax, setEtajMax] = useState("");
  const [compartimentare, setCompartimentare] = useState("");
  const [stare, setStare] = useState("");
  const [mobilare, setMobilare] = useState("");

  // ── Apartament avansate ──
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
  const [suprafataTerenMin, setSuprafataTerenMin] = useState("");
  const [suprafataTerenMax, setSuprafataTerenMax] = useState("");
  const [nrCamereMin, setNrCamereMin] = useState("");
  const [nrCamereMax, setNrCamereMax] = useState("");
  const [nrBaiMin, setNrBaiMin] = useState("");
  const [nrBaiMax, setNrBaiMax] = useState("");
  const [regimInaltime, setRegimInaltime] = useState("");
  const [tipCasa, setTipCasa] = useState("");
  const [incalzireCasa, setIncalzireCasa] = useState("");
  const [utilitati, setUtilitati] = useState<string[]>([]);
  const [garaj, setGaraj] = useState<boolean | null>(null);
  const [materialCasa, setMaterialCasa] = useState("");
  const [acoperis, setAcoperis] = useState("");
  const [deschidereStrMin, setDeschidereStrMin] = useState("");
  const [deschidereStrMax, setDeschidereStrMax] = useState("");
  const [drumAcces, setDrumAcces] = useState("");

  // ── Teren ──
  const [intravilan, setIntravilan] = useState("");
  const [destinatieTeren, setDestinatieTeren] = useState("");
  const [deschidereMin, setDeschidereMin] = useState("");
  const [deschidereMax, setDeschidereMax] = useState("");
  const [utilitatiTeren, setUtilitatiTeren] = useState<string[]>([]);
  const [puzPud, setPuzPud] = useState("");
  const [tipAccesTeren, setTipAccesTeren] = useState("");
  const [tipTeren, setTipTeren] = useState("");
  const [inApropriere, setInApropriere] = useState<string[]>([]);

  // ── Comercial ──
  const [suprafataCurteMin, setSuprafataCurteMin] = useState("");
  const [suprafataCurteMax, setSuprafataCurteMax] = useState("");
  const [traficPietonal, setTraficPietonal] = useState("");
  const [compartimentareComercial, setCompartimentareComercial] = useState("");
  const [grupSanitar, setGrupSanitar] = useState<boolean | null>(null);
  const [inaltimeLibera, setInaltimeLibera] = useState("");
  const [putereElectrica, setPutereElectrica] = useState("");
  const [ventilatie, setVentilatie] = useState<boolean | null>(null);
  const [terasa, setTerasa] = useState<boolean | null>(null);
  const [locuriParcare, setLocuriParcare] = useState("");
  const [accesMarfa, setAccesMarfa] = useState<boolean | null>(null);
  const [clasaCladire, setClasaCladire] = useState("");
  const [nrBirouri, setNrBirouri] = useState("");
  const [locuriParcareBirouri, setLocuriParcareBirouri] = useState("");
  const [liftBirouri, setLiftBirouri] = useState<boolean | null>(null);
  const [receptie, setReceptie] = useState<boolean | null>(null);
  const [securitate, setSecuritate] = useState<boolean | null>(null);
  const [acCentralizat, setAcCentralizat] = useState<boolean | null>(null);
  const [inaltimeHala, setInaltimeHala] = useState("");
  const [accesTir, setAccesTir] = useState<boolean | null>(null);
  const [nrRampe, setNrRampe] = useState("");
  const [sarcinaPardoseala, setSarcinaPardoseala] = useState("");
  const [putereElectricaHala, setPutereElectricaHala] = useState("");
  const [incalzireHala, setIncalzireHala] = useState<boolean | null>(null);
  const [birouriIncluse, setBirouriIncluse] = useState<boolean | null>(null);
  const [mpBirouri, setMpBirouri] = useState("");

  // Reset more filters la schimbarea tipului
  const resetMoreFilters = useCallback(() => {
    setShowMoreFilters(false);
  }, []);

  useEffect(() => {
    resetMoreFilters();
  }, [tipProprietate, subtipComercial, resetMoreFilters]);

  useEffect(() => {
    if (tipProprietate !== "Comercial") {
      setSubtipComercial("");
    }
  }, [tipProprietate]);

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

  const controlStyle: React.CSSProperties = {
    background: isDark ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
    borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.5)",
    boxShadow: isDark
      ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(60px) saturate(1.6)",
    WebkitBackdropFilter: "blur(60px) saturate(1.6)",
  };

  const inputStyle = controlStyle;
  const selectStyle = controlStyle;

  const handleSearch = () => {
    const route = tipTranzactie === "Închiriere" ? "/inchiriere" : "/vanzare";
    router.push(route);
  };

  // ─── Filtre esențiale per tip proprietate ──────────────────────────────

  const renderApartamentEssentials = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <ChipGroup
        label="Camere"
        options={["Studio", "1", "2", "3", "4+"]}
        selected={camere}
        onChange={(v) => setCamere(v as string)}
      />
      <RangeFields
        label="Suprafață utilă (m²)"
        labelMin="Min"
        labelMax="Max"
        valueMin={suprafataMin}
        valueMax={suprafataMax}
        onChangeMin={setSuprafataMin}
        onChangeMax={setSuprafataMax}
        style={controlStyle}
        type="number"
      />
      <RangeFields
        label="Preț (€)"
        labelMin="Min"
        labelMax="Max"
        valueMin={pretMin}
        valueMax={pretMax}
        onChangeMin={setPretMin}
        onChangeMax={setPretMax}
        style={controlStyle}
      />
      <RangeFields
        label="Etaj"
        labelMin="Min"
        labelMax="Max"
        valueMin={etajMin}
        valueMax={etajMax}
        onChangeMin={setEtajMin}
        onChangeMax={setEtajMax}
        style={controlStyle}
        type="number"
      />
      <SelectField
        label="Compartimentare"
        value={compartimentare}
        onChange={setCompartimentare}
        options={["Decomandat", "Semidecomandat", "Nedecomandat", "Circular"]}
        style={controlStyle}
      />
      <RangeFields
        label="An construcție"
        labelMin="Min"
        labelMax="Max"
        valueMin={anConstructieMin}
        valueMax={anConstructieMax}
        onChangeMin={setAnConstructieMin}
        onChangeMax={setAnConstructieMax}
        style={controlStyle}
        type="number"
      />
      <SelectField
        label="Stare"
        value={stare}
        onChange={setStare}
        options={["Nou", "Renovat", "De renovat"]}
        style={controlStyle}
      />
      <SelectField
        label="Mobilat"
        value={mobilare}
        onChange={setMobilare}
        options={["Nemobilat", "Parțial mobilat", "Complet mobilat"]}
        style={controlStyle}
      />
    </div>
  );

  const renderApartamentAdvanced = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <SelectField
        label="Confort"
        value={confort}
        onChange={setConfort}
        options={["Confort I", "Confort II", "Confort III"]}
        style={controlStyle}
      />
      <ToggleField label="Lift" value={lift} onChange={setLift} />
      <div className="space-y-2">
        <ToggleField label="Balcon" value={balcon} onChange={setBalcon} />
        {balcon && (
          <LabeledInput
            label="Nr. balcoane"
            placeholder="Ex: 2"
            value={nrBalcoane}
            onChange={setNrBalcoane}
            style={controlStyle}
            type="number"
          />
        )}
      </div>
      <SelectField
        label="Încălzire"
        value={incalzire}
        onChange={setIncalzire}
        options={["Centrală proprie", "Termoficare", "Încălzire în pardoseală"]}
        style={controlStyle}
      />
      <div className="space-y-2">
        <ToggleField label="Loc parcare" value={locParcare} onChange={setLocParcare} />
        {locParcare && (
          <SelectField
            label="Tip parcare"
            value={tipParcare}
            onChange={setTipParcare}
            options={["Subteran", "Suprateran"]}
            style={controlStyle}
          />
        )}
      </div>
      <ToggleField label="Boxă / Debara" value={boxa} onChange={setBoxa} />
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
      />
    </div>
  );

  const renderCasaEssentials = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <RangeFields
        label="Suprafață utilă (m²)"
        labelMin="Min"
        labelMax="Max"
        valueMin={suprafataMin}
        valueMax={suprafataMax}
        onChangeMin={setSuprafataMin}
        onChangeMax={setSuprafataMax}
        style={controlStyle}
        type="number"
      />
      <RangeFields
        label="Suprafață teren (m²)"
        labelMin="Min"
        labelMax="Max"
        valueMin={suprafataTerenMin}
        valueMax={suprafataTerenMax}
        onChangeMin={setSuprafataTerenMin}
        onChangeMax={setSuprafataTerenMax}
        style={controlStyle}
        type="number"
      />
      <RangeFields
        label="Nr. camere"
        labelMin="Min"
        labelMax="Max"
        valueMin={nrCamereMin}
        valueMax={nrCamereMax}
        onChangeMin={setNrCamereMin}
        onChangeMax={setNrCamereMax}
        style={controlStyle}
        type="number"
      />
      <RangeFields
        label="Nr. băi"
        labelMin="Min"
        labelMax="Max"
        valueMin={nrBaiMin}
        valueMax={nrBaiMax}
        onChangeMin={setNrBaiMin}
        onChangeMax={setNrBaiMax}
        style={controlStyle}
        type="number"
      />
      <RangeFields
        label="Preț (€)"
        labelMin="Min"
        labelMax="Max"
        valueMin={pretMin}
        valueMax={pretMax}
        onChangeMin={setPretMin}
        onChangeMax={setPretMax}
        style={controlStyle}
      />
      <SelectField
        label="Regim înălțime"
        value={regimInaltime}
        onChange={setRegimInaltime}
        options={["P", "P+1", "P+2", "P+3", "P+M", "P+1+M"]}
        style={controlStyle}
      />
      <SelectField
        label="Stare"
        value={stare}
        onChange={setStare}
        options={["Nou", "Renovat", "De renovat"]}
        style={controlStyle}
      />
      <SelectField
        label="Tip casă"
        value={tipCasa}
        onChange={setTipCasa}
        options={["Individuală", "Duplex", "Înșiruită"]}
        style={controlStyle}
      />
      <RangeFields
        label="An construcție"
        labelMin="Min"
        labelMax="Max"
        valueMin={anConstructieMin}
        valueMax={anConstructieMax}
        onChangeMin={setAnConstructieMin}
        onChangeMax={setAnConstructieMax}
        style={controlStyle}
        type="number"
      />
    </div>
  );

  const renderCasaAdvanced = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <SelectField
        label="Încălzire"
        value={incalzireCasa}
        onChange={setIncalzireCasa}
        options={["Centrală termică", "Pompă de căldură", "Sobă", "Electrică"]}
        style={controlStyle}
      />
      <ChipGroup
        label="Utilități"
        options={["Apă", "Canal", "Gaz", "Curent"]}
        selected={utilitati}
        onChange={(v) => setUtilitati(v as string[])}
        multi
      />
      <ToggleField label="Garaj / Parcare" value={garaj} onChange={setGaraj} />
      <SelectField
        label="Material construcție"
        value={materialCasa}
        onChange={setMaterialCasa}
        options={["Cărămidă", "BCA", "Lemn", "Beton"]}
        style={controlStyle}
      />
      <SelectField
        label="Acoperiș"
        value={acoperis}
        onChange={setAcoperis}
        options={["Țiglă", "Tablă", "Terasă"]}
        style={controlStyle}
      />
      <RangeFields
        label="Deschidere stradă (m)"
        labelMin="Min"
        labelMax="Max"
        valueMin={deschidereStrMin}
        valueMax={deschidereStrMax}
        onChangeMin={setDeschidereStrMin}
        onChangeMax={setDeschidereStrMax}
        style={controlStyle}
        type="number"
      />
      <SelectField
        label="Drum de acces"
        value={drumAcces}
        onChange={setDrumAcces}
        options={["Asfalt", "Pietruit", "Pământ"]}
        style={controlStyle}
      />
    </div>
  );

  const renderTerenEssentials = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <RangeFields
        label="Suprafață (m²)"
        labelMin="Min"
        labelMax="Max"
        valueMin={suprafataMin}
        valueMax={suprafataMax}
        onChangeMin={setSuprafataMin}
        onChangeMax={setSuprafataMax}
        style={controlStyle}
        type="number"
      />
      <RangeFields
        label="Preț (€)"
        labelMin="Min"
        labelMax="Max"
        valueMin={pretMin}
        valueMax={pretMax}
        onChangeMin={setPretMin}
        onChangeMax={setPretMax}
        style={controlStyle}
      />
      <ChipGroup
        label="Clasificare"
        options={["Intravilan", "Extravilan"]}
        selected={intravilan}
        onChange={(v) => setIntravilan(v as string)}
      />
      <SelectField
        label="Destinație"
        value={destinatieTeren}
        onChange={setDestinatieTeren}
        options={["Construcții", "Agricol", "Pășune", "Livadă", "Forestier"]}
        style={controlStyle}
      />
      <RangeFields
        label="Deschidere (m)"
        labelMin="Min"
        labelMax="Max"
        valueMin={deschidereMin}
        valueMax={deschidereMax}
        onChangeMin={setDeschidereMin}
        onChangeMax={setDeschidereMax}
        style={controlStyle}
        type="number"
      />
      <ChipGroup
        label="Utilități disponibile"
        options={["Curent", "Gaz", "Apă", "Canalizare"]}
        selected={utilitatiTeren}
        onChange={(v) => setUtilitatiTeren(v as string[])}
        multi
      />
    </div>
  );

  const renderTerenAdvanced = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <SelectField
        label="PUZ / PUD"
        value={puzPud}
        onChange={setPuzPud}
        options={["Da", "Nu", "În lucru"]}
        style={controlStyle}
      />
      <SelectField
        label="Tip acces"
        value={tipAccesTeren}
        onChange={setTipAccesTeren}
        options={["Asfalt", "Pietruit", "Pământ"]}
        style={controlStyle}
      />
      <SelectField
        label="Tip teren"
        value={tipTeren}
        onChange={setTipTeren}
        options={["Plat", "În pantă"]}
        style={controlStyle}
      />
      <ChipGroup
        label="În apropiere"
        options={["Pădure", "Lac", "Parc"]}
        selected={inApropriere}
        onChange={(v) => setInApropriere(v as string[])}
        multi
      />
    </div>
  );

  // ── Comercial ──────────────────────────────────────────────────────────

  const renderComercialSubtipSelector = () => (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        Subtip spațiu comercial
      </label>
      <div className="flex flex-wrap gap-2">
        {(["Stradal/Retail", "Birouri", "Depozit/Hala"] as SubtipComercial[]).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSubtipComercial(subtipComercial === st ? "" : st)}
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <RangeFields label="Suprafață utilă (m²)" labelMin="Min" labelMax="Max" valueMin={suprafataMin} valueMax={suprafataMax} onChangeMin={setSuprafataMin} onChangeMax={setSuprafataMax} style={controlStyle} type="number" />
      <RangeFields label="Preț (€)" labelMin="Min" labelMax="Max" valueMin={pretMin} valueMax={pretMax} onChangeMin={setPretMin} onChangeMax={setPretMax} style={controlStyle} />
      <SelectField label="Trafic pietonal" value={traficPietonal} onChange={setTraficPietonal} options={["Mic", "Mediu", "Mare"]} style={controlStyle} />
      <SelectField label="Compartimentare" value={compartimentareComercial} onChange={setCompartimentareComercial} options={["Open space", "Compartimentat"]} style={controlStyle} />
      <ToggleField label="Grup sanitar" value={grupSanitar} onChange={setGrupSanitar} />
    </div>
  );

  const renderStradalAdvanced = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <LabeledInput label="Înălțime liberă (m)" placeholder="Ex: 3.5" value={inaltimeLibera} onChange={setInaltimeLibera} style={controlStyle} type="number" />
      <LabeledInput label="Putere electrică (kW)" placeholder="Ex: 50" value={putereElectrica} onChange={setPutereElectrica} style={controlStyle} type="number" />
      <ToggleField label="Ventilație / Hotă" value={ventilatie} onChange={setVentilatie} />
      <ToggleField label="Terasă" value={terasa} onChange={setTerasa} />
      <LabeledInput label="Locuri parcare" placeholder="Ex: 5" value={locuriParcare} onChange={setLocuriParcare} style={controlStyle} type="number" />
      <ToggleField label="Acces marfă" value={accesMarfa} onChange={setAccesMarfa} />
    </div>
  );

  const renderBirouriEssentials = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <RangeFields label="Suprafață (m²)" labelMin="Min" labelMax="Max" valueMin={suprafataMin} valueMax={suprafataMax} onChangeMin={setSuprafataMin} onChangeMax={setSuprafataMax} style={controlStyle} type="number" />
      <RangeFields label="Preț (€)" labelMin="Min" labelMax="Max" valueMin={pretMin} valueMax={pretMax} onChangeMin={setPretMin} onChangeMax={setPretMax} style={controlStyle} />
      <SelectField label="Clasă clădire" value={clasaCladire} onChange={setClasaCladire} options={["A", "B", "C"]} style={controlStyle} />
      <LabeledInput label="Nr. camere / birouri" placeholder="Ex: 5" value={nrBirouri} onChange={setNrBirouri} style={controlStyle} />
      <LabeledInput label="Locuri parcare" placeholder="Ex: 10" value={locuriParcareBirouri} onChange={setLocuriParcareBirouri} style={controlStyle} type="number" />
    </div>
  );

  const renderBirouriAdvanced = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <ToggleField label="Lift" value={liftBirouri} onChange={setLiftBirouri} />
      <ToggleField label="Recepție" value={receptie} onChange={setReceptie} />
      <ToggleField label="Securitate" value={securitate} onChange={setSecuritate} />
      <ToggleField label="Aer condiționat centralizat" value={acCentralizat} onChange={setAcCentralizat} />
      <RangeFields label="An construcție / renovare" labelMin="Min" labelMax="Max" valueMin={anConstructieMin} valueMax={anConstructieMax} onChangeMin={setAnConstructieMin} onChangeMax={setAnConstructieMax} style={controlStyle} type="number" />
    </div>
  );

  const renderDepozitEssentials = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <RangeFields label="Suprafață hală (m²)" labelMin="Min" labelMax="Max" valueMin={suprafataMin} valueMax={suprafataMax} onChangeMin={setSuprafataMin} onChangeMax={setSuprafataMax} style={controlStyle} type="number" />
      <RangeFields label="Suprafață curte (m²)" labelMin="Min" labelMax="Max" valueMin={suprafataCurteMin} valueMax={suprafataCurteMax} onChangeMin={setSuprafataCurteMin} onChangeMax={setSuprafataCurteMax} style={controlStyle} type="number" />
      <RangeFields label="Preț (€)" labelMin="Min" labelMax="Max" valueMin={pretMin} valueMax={pretMax} onChangeMin={setPretMin} onChangeMax={setPretMax} style={controlStyle} />
      <LabeledInput label="Înălțime (m)" placeholder="Ex: 8" value={inaltimeHala} onChange={setInaltimeHala} style={controlStyle} type="number" />
      <ToggleField label="Acces TIR" value={accesTir} onChange={setAccesTir} />
      <LabeledInput label="Nr. rampe / uși" placeholder="Ex: 4" value={nrRampe} onChange={setNrRampe} style={controlStyle} type="number" />
    </div>
  );

  const renderDepozitAdvanced = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <LabeledInput label="Sarcină pardoseală (t/m²)" placeholder="Ex: 5" value={sarcinaPardoseala} onChange={setSarcinaPardoseala} style={controlStyle} />
      <LabeledInput label="Putere electrică (kW)" placeholder="Ex: 100" value={putereElectricaHala} onChange={setPutereElectricaHala} style={controlStyle} type="number" />
      <ToggleField label="Încălzire" value={incalzireHala} onChange={setIncalzireHala} />
      <div className="space-y-2">
        <ToggleField label="Birouri incluse" value={birouriIncluse} onChange={setBirouriIncluse} />
        {birouriIncluse && (
          <LabeledInput label="Suprafață birouri (m²)" placeholder="Ex: 50" value={mpBirouri} onChange={setMpBirouri} style={controlStyle} type="number" />
        )}
      </div>
    </div>
  );

  // ── Dispatch ──
  const renderComercialEssentials = () => {
    if (!subtipComercial) return null;
    switch (subtipComercial) {
      case "Stradal/Retail": return renderStradalEssentials();
      case "Birouri": return renderBirouriEssentials();
      case "Depozit/Hala": return renderDepozitEssentials();
      default: return null;
    }
  };

  const renderComercialAdvanced = () => {
    if (!subtipComercial) return null;
    switch (subtipComercial) {
      case "Stradal/Retail": return renderStradalAdvanced();
      case "Birouri": return renderBirouriAdvanced();
      case "Depozit/Hala": return renderDepozitAdvanced();
      default: return null;
    }
  };

  const renderEssentials = () => {
    switch (tipProprietate) {
      case "Apartament": return renderApartamentEssentials();
      case "Casă/Vilă": return renderCasaEssentials();
      case "Teren": return renderTerenEssentials();
      case "Comercial":
        return (
          <>
            {renderComercialSubtipSelector()}
            {renderComercialEssentials()}
          </>
        );
      default: return null;
    }
  };

  const renderAdvanced = () => {
    switch (tipProprietate) {
      case "Apartament": return renderApartamentAdvanced();
      case "Casă/Vilă": return renderCasaAdvanced();
      case "Teren": return renderTerenAdvanced();
      case "Comercial": return renderComercialAdvanced();
      default: return null;
    }
  };

  const hasAdvancedFilters = tipProprietate !== "Comercial" || subtipComercial !== "";

  return (
    <div className="md:absolute md:left-0 md:right-0 flex justify-center z-10 px-0 md:px-8 md:mt-0" style={{ top: 'calc(100% - 48px)' }}>
      <div className="w-full md:max-w-[1250px]">
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

          {/* Buton Filtrare avansată / Înapoi */}
          <div
            className="flex justify-start px-6 pt-4 pb-0"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            <button
              onClick={() => {
                setFiltrareAvansata((prev) => !prev);
                setShowMoreFilters(false);
              }}
              className="flex items-center gap-2 text-sm md:text-base text-black dark:text-foreground hover:opacity-80 transition-opacity"
              style={{ background: "transparent", border: "none" }}
            >
              {filtrareAvansata ? (
                <>
                  <MdArrowBack size={18} />
                  <span>Înapoi la filtrare standard</span>
                </>
              ) : (
                <>
                  <CiSettings size={18} />
                  <span>Filtrare avansată</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 pt-4 relative z-[1]">
            <div className="flex flex-col gap-4">
              {!filtrareAvansata ? (
                /* ═══════════════ Filtrare standard ═══════════════ */
                <>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Tip tranzacție */}
                    <div className="flex flex-col gap-1 w-full md:w-auto">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Tip tranzacție
                      </span>
                      <div className="relative">
                        <select
                          value={tipTranzactie}
                          onChange={(e) => setTipTranzactie(e.target.value)}
                          className="w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300"
                          style={selectStyle}
                        >
                          <option>Vânzare</option>
                          <option>Închiriere</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Locație */}
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Locație
                      </span>
                      <input
                        type="text"
                        placeholder="Ex: Aviatorilor"
                        value={locatie}
                        onChange={(e) => setLocatie(e.target.value)}
                        className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                        style={inputStyle}
                      />
                    </div>

                    {/* Tip proprietate */}
                    <div className="flex flex-col gap-1 w-full md:w-auto">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Tip proprietate
                      </span>
                      <div className="relative">
                        <select
                          value={tipProprietate}
                          onChange={(e) => setTipProprietate(e.target.value as TipProprietate)}
                          className="w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300"
                          style={selectStyle}
                        >
                          <option value="Apartament">Apartament</option>
                          <option value="Casă/Vilă">Casă / Vilă</option>
                          <option value="Teren">Teren</option>
                          <option value="Comercial">Spațiu comercial</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Preț maxim */}
                    <div className="flex flex-col gap-1 w-full md:w-auto">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Preț maxim
                      </span>
                      <input
                        type="text"
                        placeholder="Ex: 150.000 €"
                        value={pretMax}
                        onChange={(e) => setPretMax(e.target.value)}
                        className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                        style={inputStyle}
                      />
                    </div>

                    {/* Buton căutare */}
                    <div className="flex items-end w-full md:w-auto">
                      <button
                        onClick={handleSearch}
                        className="mt-2 md:mt-5 w-full md:w-auto px-6 py-3 rounded-3xl text-white font-medium hover:opacity-90 transition-all duration-300 backdrop-blur-xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          boxShadow: "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                        }}
                      >
                        Caută
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* ═══════════════ Filtrare avansată ═══════════════ */
                <>
                  {/* Rândul de bază (identic cu standardul) */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Tip tranzacție */} 
                    <div className="flex flex-col gap-1 w-full md:w-auto">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Tip tranzacție
                      </span>
                      <div className="relative">
                        <select
                          value={tipTranzactie}
                          onChange={(e) => setTipTranzactie(e.target.value)}
                          className="w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300"
                          style={selectStyle}
                        >
                          <option>Vânzare</option>
                          <option>Închiriere</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Locație */}
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Locație
                      </span>
                      <input
                        type="text"
                        placeholder="Ex: Aviatorilor"
                        value={locatie}
                        onChange={(e) => setLocatie(e.target.value)}
                        className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                        style={inputStyle}
                      />
                    </div>

                    {/* Tip proprietate */}
                    <div className="flex flex-col gap-1 w-full md:w-auto">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Tip proprietate
                      </span>
                      <div className="relative">
                        <select
                          value={tipProprietate}
                          onChange={(e) => setTipProprietate(e.target.value as TipProprietate)}
                          className="w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300"
                          style={selectStyle}
                        >
                          <option value="Apartament">Apartament</option>
                          <option value="Casă/Vilă">Casă / Vilă</option>
                          <option value="Teren">Teren</option>
                          <option value="Comercial">Spațiu comercial</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filtre esențiale — dinamice în funcție de tipul de proprietate */}
                  <div>{renderEssentials()}</div>

                  {/* Buton „Mai multe filtre" / „Mai puține filtre" */}
                  {hasAdvancedFilters && (
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setShowMoreFilters((p) => !p)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-[#C25A2B] dark:hover:text-[#C25A2B] transition-colors"
                      >
                        {showMoreFilters ? (
                          <>
                            <MdExpandLess size={18} />
                            <span>Mai puține filtre</span>
                          </>
                        ) : (
                          <>
                            <MdTune size={16} />
                            <span>Mai multe filtre</span>
                            <MdExpandMore size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Filtre avansate (more filters) */}
                  {showMoreFilters && renderAdvanced()}

                  {/* Buton căutare - la final */}
                  <div className="flex justify-center md:justify-end">
                    <button
                      onClick={handleSearch}
                      className="px-8 py-3 rounded-3xl text-white font-medium hover:opacity-90 transition-all duration-300 backdrop-blur-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        boxShadow: "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                      }}
                    >
                      Caută
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
