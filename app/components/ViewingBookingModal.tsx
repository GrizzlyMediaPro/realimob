"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdSchedule } from "react-icons/md";

type Slot = { start: string; end: string };

type ViewingBookingModalProps = {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
};

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

  const loadSlots = useCallback(async () => {
    setLoadState("loading");
    setLoadMessage(null);
    setSelected(null);
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

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const d = new Date(s.start);
      const key = d.toLocaleDateString("ro-RO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [slots]);

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

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewing-booking-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Închide"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/20 bg-white/95 dark:bg-zinc-900/95 shadow-2xl flex flex-col"
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

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loadState === "loading" && (
            <p className="text-sm text-gray-500">Se încarcă disponibilitatea…</p>
          )}
          {loadMessage && (
            <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-500/10 rounded-xl px-3 py-2">
              {loadMessage}
            </p>
          )}

          {slots.length > 0 && (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alege o oră (Luni–Vineri, 9:00–18:00). Cererea este trimisă
                agentului; după aprobare, evenimentul apare în Google Calendar.
              </p>
              {Array.from(slotsByDay.entries()).map(([dayLabel, daySlots]) => (
                <div key={dayLabel}>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize mb-2">
                    {dayLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((s) => {
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
                          className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                            active
                              ? "bg-[#C25A2B] text-white border-[#C25A2B]"
                              : "bg-gray-100 dark:bg-white/10 border-transparent hover:border-[#C25A2B]/40"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
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
