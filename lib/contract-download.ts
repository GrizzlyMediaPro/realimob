/** Nume sigur pentru header Content-Disposition (ASCII). */
export function safeAttachmentFileName(name: string, fallback: string): string {
  const base = (name || fallback).trim() || fallback;
  const cleaned = base.replace(/[/\\?%*:|"<>]/g, "_").slice(0, 180);
  return cleaned || fallback;
}
