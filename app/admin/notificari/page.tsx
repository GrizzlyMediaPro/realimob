"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  MdArrowBack,
  MdNotifications,
  MdSave,
  MdDelete,
  MdAdd,
  MdClose,
  MdSend,
} from "react-icons/md";

function glassOuterStyle(isDark: boolean): CSSProperties {
  return {
    fontFamily: "var(--font-galak-regular)",
    background: isDark ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
    border: isDark
      ? "1px solid rgba(255, 255, 255, 0.12)"
      : "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: isDark
      ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      : "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(80px) saturate(1.6)",
    WebkitBackdropFilter: "blur(80px) saturate(1.6)",
  };
}

function GlassReflection({ isDark }: { isDark: boolean }) {
  return (
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
  );
}

type TopicRow = {
  id: string;
  topicId: string;
  label: string;
  description: string | null;
  sendToAgents: boolean;
  sendToClients: boolean;
  sendToAdmins: boolean;
  sortOrder: number;
};

type TemplateRow = {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  active: boolean;
  updatedAt: string;
};

export default function AdminNotificariPage() {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [emailConfigured, setEmailConfigured] = useState({
    resend: false,
    from: false,
  });
  const [savingTopics, setSavingTopics] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  );
  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testTemplateId, setTestTemplateId] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Nu am putut încărca datele.");
      }
      setTopics(data.topics ?? []);
      setTemplates(data.templates ?? []);
      setEmailConfigured({
        resend: Boolean(data.emailConfigured?.resend),
        from: Boolean(data.emailConfigured?.from),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la încărcare.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateTopic = (
    topicId: string,
    field: "sendToAgents" | "sendToClients" | "sendToAdmins",
    value: boolean
  ) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.topicId === topicId ? { ...t, [field]: value } : t
      )
    );
  };

  const saveTopics = async () => {
    setSavingTopics(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notifications/topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: topics.map((t) => ({
            topicId: t.topicId,
            sendToAgents: t.sendToAgents,
            sendToClients: t.sendToClients,
            sendToAdmins: t.sendToAdmins,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Salvare eșuată.");
      }
      setTopics(data.topics ?? topics);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Salvare eșuată.");
    } finally {
      setSavingTopics(false);
    }
  };

  const resetTemplateForm = () => {
    setFormName("");
    setFormSubject("");
    setFormBody("");
    setFormActive(true);
    setEditingTemplateId(null);
    setShowTemplateForm(false);
  };

  const openEdit = (t: TemplateRow) => {
    setEditingTemplateId(t.id);
    setFormName(t.name);
    setFormSubject(t.subject);
    setFormBody(t.bodyHtml);
    setFormActive(t.active);
    setShowTemplateForm(true);
  };

  const submitTemplate = async () => {
    setSavingTemplate(true);
    setError(null);
    try {
      if (editingTemplateId) {
        const res = await fetch(
          `/api/admin/notifications/templates/${editingTemplateId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formName,
              subject: formSubject,
              bodyHtml: formBody,
              active: formActive,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Nu am putut salva.");
        }
      } else {
        const res = await fetch("/api/admin/notifications/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            subject: formSubject,
            bodyHtml: formBody,
            active: formActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Nu am putut crea șablonul.");
        }
      }
      await load();
      resetTemplateForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Ștergi acest șablon?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/notifications/templates/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Ștergere eșuată.");
      }
      await load();
      if (editingTemplateId === id) resetTemplateForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ștergere eșuată.");
    }
  };

  const sendTest = async () => {
    setTestSending(true);
    setTestMessage(null);
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail.trim(),
          templateId: testTemplateId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Trimitere eșuată.");
      }
    } catch (e) {
      setTestMessage(
        e instanceof Error ? e.message : "Trimitere eșuată."
      );
    } finally {
      setTestSending(false);
    }
  };

  const cfgOk = emailConfigured.resend && emailConfigured.from;

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
                <MdNotifications className="text-[#C25A2B]" size={28} />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-5xl font-bold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Notificări &amp; email
                </h1>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 bg-red-500/10 border border-red-500/20"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <p
              className="text-gray-500"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Se încarcă…
            </p>
          ) : (
            <>
              {/* Cine primește — pe categorii */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <h2
                      className="text-xl md:text-2xl font-bold text-foreground"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Cine primește emailuri
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                      Pentru fiecare categorie poți activa sau dezactiva agenții,
                      clienții sau administratorii. Logica de trimitere din cod va
                      respecta aceste comutatoare.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={saveTopics}
                    disabled={savingTopics}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#C25A2B] hover:opacity-90 disabled:opacity-50 transition-opacity"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    <MdSave size={18} />
                    {savingTopics ? "Se salvează…" : "Salvează preferințe"}
                  </button>
                </div>

                <div
                  className="rounded-2xl overflow-hidden relative overflow-x-auto"
                  style={glassOuterStyle(isDark)}
                >
                  <GlassReflection isDark={isDark} />
                  <table
                    className="relative z-[1] w-full text-sm min-w-[640px]"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    <thead>
                      <tr className="border-b border-black/10 dark:border-white/10">
                        <th className="text-left p-3 md:p-4 font-semibold text-foreground">
                          Categorie
                        </th>
                        <th className="text-center p-3 md:p-4 font-semibold text-foreground w-28">
                          Agenți
                        </th>
                        <th className="text-center p-3 md:p-4 font-semibold text-foreground w-28">
                          Clienți
                        </th>
                        <th className="text-center p-3 md:p-4 font-semibold text-foreground w-28">
                          Admini
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topics.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-black/5 dark:border-white/5 last:border-0"
                        >
                          <td className="p-3 md:p-4 align-top">
                            <div className="font-medium text-foreground">
                              {t.label}
                            </div>
                            {t.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                                {t.description}
                              </div>
                            )}
                          </td>
                          {(
                            [
                              "sendToAgents",
                              "sendToClients",
                              "sendToAdmins",
                            ] as const
                          ).map((field) => (
                            <td key={field} className="p-3 md:p-4 text-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-400 accent-[#C25A2B] cursor-pointer"
                                checked={t[field]}
                                onChange={(e) =>
                                  updateTopic(t.topicId, field, e.target.checked)
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Șabloane */}
              <section className="space-y-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2
                    className="text-xl md:text-2xl font-bold text-foreground"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    Șabloane email
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      resetTemplateForm();
                      setShowTemplateForm(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[#C25A2B]/40 text-[#C25A2B] hover:bg-[#C25A2B]/10 transition-colors"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    <MdAdd size={18} />
                    Șablon nou
                  </button>
                </div>

                {showTemplateForm && (
                  <div
                    className="rounded-2xl p-4 md:p-6 space-y-4 relative overflow-hidden"
                    style={glassOuterStyle(isDark)}
                  >
                    <GlassReflection isDark={isDark} />
                    <div
                      className="relative z-[1] flex justify-between items-start gap-2"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      <h3 className="font-bold text-foreground">
                        {editingTemplateId
                          ? "Editează șablonul"
                          : "Șablon nou"}
                      </h3>
                      <button
                        type="button"
                        onClick={resetTemplateForm}
                        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                        aria-label="Închide"
                      >
                        <MdClose size={22} className="text-gray-500" />
                      </button>
                    </div>
                    <div className="relative z-[1] grid md:grid-cols-2 gap-4">
                      <label className="block space-y-1">
                        <span className="text-xs text-gray-500">Nume intern</span>
                        <input
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20 px-3 py-2 text-sm"
                          placeholder="ex. Bun venit agenți"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs text-gray-500">Subiect</span>
                        <input
                          value={formSubject}
                          onChange={(e) => setFormSubject(e.target.value)}
                          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20 px-3 py-2 text-sm"
                          placeholder="Subiect în inbox"
                        />
                      </label>
                    </div>
                    <label
                      className="relative z-[1] block space-y-1"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      <span className="text-xs text-gray-500">Conținut HTML</span>
                      <textarea
                        value={formBody}
                        onChange={(e) => setFormBody(e.target.value)}
                        rows={10}
                        className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20 px-3 py-2 text-sm font-mono"
                        placeholder="<p>Salut...</p>"
                      />
                    </label>
                    <label className="relative z-[1] flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded accent-[#C25A2B]"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                      />
                      Șablon activ (poate fi folosit la trimiteri)
                    </label>
                    <div className="relative z-[1]">
                      <button
                        type="button"
                        onClick={submitTemplate}
                        disabled={
                          savingTemplate || !formName.trim() || !formSubject.trim()
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#C25A2B] hover:opacity-90 disabled:opacity-50"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        {savingTemplate
                          ? "Se salvează…"
                          : editingTemplateId
                            ? "Actualizează"
                            : "Creează șablonul"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {templates.length === 0 && !showTemplateForm ? (
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Niciun șablon încă. Creează unul pentru mesaje reutilizabile.
                    </p>
                  ) : (
                    templates.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative overflow-hidden"
                        style={glassOuterStyle(isDark)}
                      >
                        <GlassReflection isDark={isDark} />
                        <div
                          className="relative z-[1] min-w-0"
                          style={{ fontFamily: "var(--font-galak-regular)" }}
                        >
                          <div className="font-semibold text-foreground truncate">
                            {t.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {t.subject}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {t.active ? "Activ" : "Inactiv"} ·{" "}
                            {new Date(t.updatedAt).toLocaleString("ro-RO")}
                          </div>
                        </div>
                        <div className="relative z-[1] flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEdit(t)}
                            className="px-3 py-1.5 rounded-lg text-sm border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                            style={{ fontFamily: "var(--font-galak-regular)" }}
                          >
                            Editează
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTemplate(t.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-500/10"
                            aria-label="Șterge"
                          >
                            <MdDelete size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Test */}
              <section
                className="rounded-2xl md:rounded-3xl overflow-hidden relative p-5 md:p-6 space-y-4 pb-12"
                style={glassOuterStyle(isDark)}
              >
                <GlassReflection isDark={isDark} />
                <h2
                  className="relative z-[1] text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Trimite email de test
                </h2>
                <div
                  className="relative z-[1] flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  <label className="flex-1 min-w-[200px] space-y-1">
                    <span className="text-xs text-gray-500">Către</span>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20 px-3 py-2 text-sm"
                      placeholder="tu@exemplu.ro"
                    />
                  </label>
                  <label className="w-full sm:w-56 space-y-1">
                    <span className="text-xs text-gray-500">Șablon (opțional)</span>
                    <select
                      value={testTemplateId}
                      onChange={(e) => setTestTemplateId(e.target.value)}
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20 px-3 py-2 text-sm"
                    >
                      <option value="">— Mesaj simplu de test —</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={sendTest}
                    disabled={
                      testSending || !testEmail.trim().includes("@") || !cfgOk
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-slate-800 dark:bg-slate-200 dark:text-slate-900 hover:opacity-90 disabled:opacity-50"
                  >
                    <MdSend size={18} />
                    {testSending ? "Se trimite…" : "Trimite"}
                  </button>
                </div>
                {testMessage && (
                  <p
                    className="relative z-[1] text-sm text-red-700 dark:text-red-300"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    {testMessage}
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
