"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MdArrowBack, MdClose, MdSchedule } from "react-icons/md";

type Slot = { start: string; end: string };

function dayKeyFromSlotStart(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayLabelFromKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type ViewingBookingModalProps = {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
};

/** Durată aliniată cu transition-duration pe sheet (mobile slide + desktop fade). */
const SHEET_TRANSITION_MS = 320;

export default function ViewingBookingModal({
  open,
  onClose,
  listingId,
  listingTitle,
}: ViewingBookingModalProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "err">("idle");
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  const loadSlots = useCallback(async () => {
    setLoadState("loading");
    setLoadMessage(null);
    setSelected(null);
    setSelectedDayKey(null);
    setSubmitMessage(null);
    try {
      const r = await fetch(
        `/api/public/listings/${listingId}/viewing-slots`,
        { cache: "no-store" },
      );
      const j = await r.json();
      if (!r.ok) {
        setLoadState("err");
        setLoadMessage(j?.error ?? "Nu am putut încărca orele disponibile.");
        setSlots([]);
        return;
      }
      const list = (j.slots ?? []) as Slot[];
      setSlots(list);
      if (j.code === "no_calendar") {
        setLoadState("err");
        setLoadMessage(
          j.message ??
            "Agentul nu are Google Calendar conectat. Poți folosi WhatsApp.",
        );
      } else if (list.length === 0) {
        setLoadState("err");
        setLoadMessage(
          "Nu există intervale libere în următoarele 14 zile (luni–vineri, 9:00–18:00). Încearcă altă dată sau contactează agentul.",
        );
      } else {
        setLoadState("idle");
        setLoadMessage(null);
      }
    } catch {
      setLoadState("err");
      setLoadMessage("Eroare de rețea.");
      setSlots([]);
    }
  }, [listingId]);

  useEffect(() => {
    if (!open) return;
    loadSlots();
  }, [open, loadSlots]);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (open) {
      setShouldRender(true);
      if (reduceMotion) {
        setSheetVisible(true);
        return;
      }
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setSheetVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }

    setSheetVisible(false);
    const ms = reduceMotion ? 0 : SHEET_TRANSITION_MS;
    const t = window.setTimeout(() => setShouldRender(false), ms);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!shouldRender) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [shouldRender]);

  const sortedDays = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = dayKeyFromSlotStart(s.start);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    const keys = [...map.keys()].sort();
    return keys.map((dateKey) => ({
      dateKey,
      label: dayLabelFromKey(dateKey),
      slots: map.get(dateKey)!,
    }));
  }, [slots]);

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDayKey) return [];
    const row = sortedDays.find((d) => d.dateKey === selectedDayKey);
    return row?.slots ?? [];
  }, [selectedDayKey, sortedDays]);

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const r = await fetch(
        `/api/public/listings/${listingId}/viewing-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start: selected.start,
            end: selected.end,
            clientName: clientName.trim(),
            clientEmail: clientEmail.trim(),
            clientPhone: clientPhone.trim() || undefined,
            message: message.trim() || undefined,
          }),
        },
      );
      const j = await r.json();
      if (!r.ok) {
        setSubmitMessage(j?.error ?? "Nu am putut trimite cererea.");
        return;
      }
      setSubmitMessage(j?.message ?? "Cererea a fost trimisă.");
      setSelected(null);
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setMessage("");
      loadSlots();
    } catch {
      setSubmitMessage("Eroare de rețea.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!shouldRender || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewing-booking-title"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out max-sm:motion-reduce:transition-none ${
          sheetVisible ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Închide"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex w-full min-h-0 max-h-[min(100dvh-1rem,100vh-1rem)] max-w-[min(100%,32rem)] flex-col overflow-hidden rounded-t-3xl border border-white/20 bg-white/95 shadow-2xl dark:bg-zinc-900/95 sm:max-h-[min(92dvh,92vh)] sm:rounded-3xl max-sm:motion-reduce:transition-none sm:motion-reduce:transition-none transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:ease-out ${
          sheetVisible
            ? "max-sm:translate-y-0 sm:translate-y-0 sm:scale-100 sm:opacity-100"
            : "max-sm:translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
        }`}
        style={{ WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-gray-200/80 dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <MdSchedule className="text-[#C25A2B] shrink-0" size={22} />
            <div className="min-w-0">
              <h2
                id="viewing-booking-title"
                className="text-base font-semibold text-foreground truncate"
              >
                Programează vizionare
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {listingTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
            aria-label="Închide"
          >
            <MdClose size={22} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
          {loadState === "loading" && (
            <p className="text-sm text-gray-500">Se încarcă disponibilitatea…</p>
          )}
          {loadMessage && (
            <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-500/10 rounded-xl px-3 py-2">
              {loadMessage}
            </p>
          )}

          {slots.length > 0 && !selectedDayKey && (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alege ziua vizionării (Luni–Vineri, 9:00–18:00). În pasul următor
                selectezi ora. Cererea merge la agent; după aprobare apare în
                Google Calendar.
              </p>
              <div className="flex flex-col gap-2">
                {sortedDays.map(({ dateKey, label }) => (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => {
                      setSelectedDayKey(dateKey);
                      setSelected(null);
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-left text-sm font-medium capitalize text-foreground transition-colors hover:border-[#C25A2B]/50 dark:border-white/15 dark:bg-white/10"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {slots.length > 0 && selectedDayKey && (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedDayKey(null);
                  setSelected(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#C25A2B] hover:underline"
              >
                <MdArrowBack size={16} aria-hidden />
                Alege altă zi
              </button>
              <p className="text-xs font-medium capitalize text-gray-600 dark:text-gray-300">
                {dayLabelFromKey(selectedDayKey)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selectează ora.
              </p>
              <div className="flex flex-wrap gap-2">
                {slotsForSelectedDay.map((s) => {
                  const t = new Date(s.start);
                  const label = t.toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  const active = selected?.start === s.start;
                  return (
                    <button
                      key={s.start}
                      type="button"
                      onClick={() => setSelected(s)}
                      className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "border-[#C25A2B] bg-[#C25A2B] text-white"
                          : "border-transparent bg-gray-100 hover:border-[#C25A2B]/40 dark:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {selected && (
            <div className="space-y-3 pt-2 border-t border-gray-200/80 dark:border-white/10">
              <p className="text-sm font-medium text-foreground">
                Date de contact
              </p>
              <input
                type="text"
                placeholder="Nume complet"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              />
              <input
                type="tel"
                placeholder="Telefon (opțional)"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Mesaj pentru agent (opțional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-zinc-950 px-3 py-2 text-sm resize-none"
              />
              {submitMessage && (
                <p
                  className={`text-sm rounded-xl px-3 py-2 ${
                    submitMessage.includes("trimisă") || submitMessage.includes("trimisa")
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                      : "bg-red-500/10 text-red-800 dark:text-red-200"
                  }`}
                >
                  {submitMessage}
                </p>
              )}
              <button
                type="button"
                disabled={submitting || !clientName.trim() || !clientEmail.trim()}
                onClick={submit}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "#C25A2B" }}
              >
                {submitting ? "Se trimite…" : "Trimite cererea de programare"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
