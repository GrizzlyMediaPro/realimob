import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "blockquote",
    "a",
    "hr",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
  },
};

export function sanitizeListingDescription(html: unknown): string {
  const raw = typeof html === "string" ? html : "";
  return sanitizeHtml(raw, SANITIZE_OPTIONS).trim();
}

/** Consideră gol conținutul doar din tag-uri goale / spații. */
export function isListingDescriptionEmpty(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0;
}
