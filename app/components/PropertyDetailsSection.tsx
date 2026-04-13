"use client";

import { useState, useEffect } from "react";
import {
  MdInfo,
  MdHome,
  MdApartment,
  MdLocalParking,
  MdElevator,
  MdBalcony,
  MdThermostat,
  MdCheckCircle,
  MdCancel,
  MdExpandMore,
  MdExpandLess,
  MdTerrain,
  MdStore,
  MdBusiness,
  MdWarehouse,
} from "react-icons/md";

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

type DetailItem = {
  label: string;
  value: string;
  type?: "text" | "boolean" | "chips";
};

type DetailGroup = {
  title: string;
  icon: React.ReactNode;
  items: DetailItem[];
};

function formatBool(v: boolean | null | undefined): string | null {
  if (v === true) return "Da";
  if (v === false) return "Nu";
  return null;
}

function formatValue(v: any): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "boolean") return formatBool(v);
  if (Array.isArray(v)) {
    const filtered = v.filter((x) => x !== null && x !== undefined && x !== "");
    return filtered.length > 0 ? filtered.join(", ") : null;
  }
  return String(v);
}

function buildItem(
  label: string,
  value: any,
  suffix?: string
): DetailItem | null {
  const formatted = formatValue(value);
  if (!formatted) return null;
  return {
    label,
    value: suffix ? `${formatted} ${suffix}` : formatted,
    type:
      typeof value === "boolean"
        ? "boolean"
        : Array.isArray(value)
        ? "chips"
        : "text",
  };
}

function getApartamentGroups(d: any): DetailGroup[] {
  const groups: DetailGroup[] = [];

  const structura = [
    buildItem("Număr camere", d.camere),
    buildItem("Suprafață utilă", d.suprafataUtila, "m²"),
    buildItem("Suprafață construită", d.suprafataConstruita, "m²"),
    buildItem("Compartimentare", d.compartimentare),
    buildItem("Etaj", d.etaj),
    buildItem("Etaj total clădire", d.etajTotal),
    buildItem("An construcție", d.anConstructie),
  ].filter(Boolean) as DetailItem[];
  if (structura.length > 0)
    groups.push({
      title: "Structură",
      icon: <MdApartment size={18} />,
      items: structura,
    });

  const stare = [
    buildItem("Stare", d.stare),
    buildItem("Mobilare", d.mobilare),
    buildItem("Confort", d.confort),
  ].filter(Boolean) as DetailItem[];
  if (stare.length > 0)
    groups.push({
      title: "Stare & Finisaje",
      icon: <MdHome size={18} />,
      items: stare,
    });

  const facilitati = [
    buildItem("Lift", d.lift),
    buildItem("Balcon", d.balcon),
    buildItem("Nr. balcoane", d.nrBalcoane),
    buildItem("Încălzire", d.incalzire),
    buildItem("Loc parcare", d.locParcare),
    buildItem("Tip parcare", d.tipParcare),
    buildItem("Boxă / Debara", d.boxa),
    buildItem("Orientare", d.orientare),
    buildItem("Tip clădire", d.tipCladire),
  ].filter(Boolean) as DetailItem[];
  if (facilitati.length > 0)
    groups.push({
      title: "Facilități",
      icon: <MdElevator size={18} />,
      items: facilitati,
    });

  return groups;
}

function getCasaGroups(d: any): DetailGroup[] {
  const groups: DetailGroup[] = [];

  const structura = [
    buildItem("Suprafață utilă", d.suprafataUtila, "m²"),
    buildItem("Suprafață teren", d.suprafataTeren, "m²"),
    buildItem("Număr camere", d.nrCamere),
    buildItem("Număr dormitoare", d.nrDormitoareCasa ?? d.nrCamere),
    buildItem("Număr băi", d.nrBai),
    buildItem("Regim înălțime", d.regimInaltime),
    buildItem("Tip casă", d.tipCasa),
    buildItem("An construcție", d.anConstructie),
  ].filter(Boolean) as DetailItem[];
  if (structura.length > 0)
    groups.push({
      title: "Structură",
      icon: <MdHome size={18} />,
      items: structura,
    });

  const stare = [
    buildItem("Stare", d.stare),
    buildItem("Mobilare", d.mobilare),
    buildItem("Material construcție", d.materialCasa),
    buildItem("Acoperiș", d.acoperis),
  ].filter(Boolean) as DetailItem[];
  if (stare.length > 0)
    groups.push({
      title: "Stare & Materiale",
      icon: <MdInfo size={18} />,
      items: stare,
    });

  const facilitati = [
    buildItem("Încălzire", d.incalzireCasa),
    buildItem("Utilități", d.utilitati),
    buildItem("Garaj / Parcare", d.garaj),
    buildItem("Deschidere la stradă", d.deschidereStrada, "m"),
    buildItem("Drum de acces", d.drumAcces),
  ].filter(Boolean) as DetailItem[];
  if (facilitati.length > 0)
    groups.push({
      title: "Facilități & Acces",
      icon: <MdLocalParking size={18} />,
      items: facilitati,
    });

  return groups;
}

function getTerenGroups(d: any): DetailGroup[] {
  const groups: DetailGroup[] = [];

  const caracteristici = [
    buildItem("Suprafață", d.suprafata, "m²"),
    buildItem("Clasificare", d.intravilan),
    buildItem("Destinație", d.destinatieTeren),
    buildItem("Deschidere", d.deschidere, "m"),
    buildItem("Tip teren", d.tipTeren),
  ].filter(Boolean) as DetailItem[];
  if (caracteristici.length > 0)
    groups.push({
      title: "Caracteristici teren",
      icon: <MdTerrain size={18} />,
      items: caracteristici,
    });

  const utilitati = [
    buildItem("Utilități disponibile", d.utilitatiTeren),
    buildItem("PUZ / PUD", d.puzPud),
    buildItem("Tip acces", d.tipAccesTeren),
  ].filter(Boolean) as DetailItem[];
  if (utilitati.length > 0)
    groups.push({
      title: "Utilități & Acces",
      icon: <MdInfo size={18} />,
      items: utilitati,
    });

  const imprejurimi = [buildItem("În apropiere", d.inApropriere)].filter(
    Boolean
  ) as DetailItem[];
  if (imprejurimi.length > 0)
    groups.push({
      title: "Împrejurimi",
      icon: <MdTerrain size={18} />,
      items: imprejurimi,
    });

  return groups;
}

function getStradalGroups(d: any): DetailGroup[] {
  const groups: DetailGroup[] = [];

  const spatiu = [
    buildItem("Suprafață utilă", d.suprafataUtila, "m²"),
    buildItem("Compartimentare", d.compartimentareComercial),
    buildItem("Trafic pietonal", d.traficPietonal),
    buildItem("Grup sanitar", d.grupSanitar),
  ].filter(Boolean) as DetailItem[];
  if (spatiu.length > 0)
    groups.push({
      title: "Spațiu comercial",
      icon: <MdStore size={18} />,
      items: spatiu,
    });

  const facilitati = [
    buildItem("Înălțime liberă", d.inaltimeLibera, "m"),
    buildItem("Putere electrică", d.putereElectrica, "kW"),
    buildItem("Ventilație / Hotă", d.ventilatie),
    buildItem("Terasă", d.terasa),
    buildItem("Locuri parcare", d.locuriParcare),
    buildItem("Acces marfă", d.accesMarfa),
  ].filter(Boolean) as DetailItem[];
  if (facilitati.length > 0)
    groups.push({
      title: "Facilități",
      icon: <MdInfo size={18} />,
      items: facilitati,
    });

  return groups;
}

function getBirouriGroups(d: any): DetailGroup[] {
  const groups: DetailGroup[] = [];

  const spatiu = [
    buildItem("Suprafață", d.suprafataUtila, "m²"),
    buildItem("Clasă clădire", d.clasaCladire),
    buildItem("Nr. camere / birouri", d.nrBirouri),
    buildItem("Locuri parcare", d.locuriParcareBirouri),
    buildItem("An construcție", d.anConstructie),
  ].filter(Boolean) as DetailItem[];
  if (spatiu.length > 0)
    groups.push({
      title: "Birouri",
      icon: <MdBusiness size={18} />,
      items: spatiu,
    });

  const facilitati = [
    buildItem("Lift", d.liftBirouri),
    buildItem("Recepție", d.receptie),
    buildItem("Securitate", d.securitate),
    buildItem("Aer condiționat centralizat", d.acCentralizat),
  ].filter(Boolean) as DetailItem[];
  if (facilitati.length > 0)
    groups.push({
      title: "Facilități",
      icon: <MdElevator size={18} />,
      items: facilitati,
    });

  return groups;
}

function getDepozitGroups(d: any): DetailGroup[] {
  const groups: DetailGroup[] = [];

  const hala = [
    buildItem("Suprafață hală", d.suprafataUtila, "m²"),
    buildItem("Suprafață curte", d.suprafataCurte, "m²"),
    buildItem("Înălțime", d.inaltimeHala, "m"),
    buildItem("Nr. rampe / uși", d.nrRampe),
  ].filter(Boolean) as DetailItem[];
  if (hala.length > 0)
    groups.push({
      title: "Hală / Depozit",
      icon: <MdWarehouse size={18} />,
      items: hala,
    });

  const facilitati = [
    buildItem("Acces TIR", d.accesTir),
    buildItem("Sarcină pardoseală", d.sarcinaPardoseala, "t/m²"),
    buildItem("Putere electrică", d.putereElectricaHala, "kW"),
    buildItem("Încălzire", d.incalzireHala),
    buildItem("Birouri incluse", d.birouriIncluse),
    buildItem("Suprafață birouri", d.mpBirouri, "m²"),
  ].filter(Boolean) as DetailItem[];
  if (facilitati.length > 0)
    groups.push({
      title: "Facilități & Dotări",
      icon: <MdInfo size={18} />,
      items: facilitati,
    });

  return groups;
}

function getGroups(details: any): DetailGroup[] {
  if (!details) return [];

  const tip = details.tipProprietate;
  const subtip = details.subtipComercial;

  switch (tip) {
    case "Apartament":
      return getApartamentGroups(details);
    case "Casă/Vilă":
      return getCasaGroups(details);
    case "Teren":
      return getTerenGroups(details);
    case "Comercial":
      if (subtip === "Stradal/Retail") return getStradalGroups(details);
      if (subtip === "Birouri") return getBirouriGroups(details);
      if (subtip === "Depozit/Hala") return getDepozitGroups(details);
      return [];
    default:
      return getApartamentGroups(details);
  }
}

function BooleanBadge({ value }: { value: string }) {
  const isYes = value === "Da";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isYes
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
      }`}
    >
      {isYes ? <MdCheckCircle size={12} /> : <MdCancel size={12} />}
      {value}
    </span>
  );
}

function ChipList({ value }: { value: string }) {
  const items = value.split(", ");
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-[#C25A2B]/10 text-[#C25A2B] dark:bg-[#C25A2B]/20"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function PropertyDetailsSection({
  details,
}: {
  details: any;
}) {
  const isDark = useDarkMode();
  const [expanded, setExpanded] = useState(true);

  const groups = getGroups(details);

  if (groups.length === 0) return null;

  const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
  if (totalItems === 0) return null;

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
          height: "40%",
          background: isDark
            ? "linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)",
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="relative z-1 p-5 md:p-6">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold text-foreground">
            <MdInfo className="text-[#C25A2B]" />
            Detalii proprietate
          </h2>
          <span className="text-gray-400 dark:text-gray-500">
            {expanded ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
          </span>
        </button>

        {expanded && (
          <div className="mt-5 space-y-6">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  <span className="text-[#C25A2B]">{group.icon}</span>
                  {group.title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-2.5 border-b"
                      style={{
                        borderColor: isDark
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium text-foreground ml-4 text-right">
                        {item.type === "boolean" ? (
                          <BooleanBadge value={item.value} />
                        ) : item.type === "chips" ? (
                          <ChipList value={item.value} />
                        ) : (
                          item.value
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
