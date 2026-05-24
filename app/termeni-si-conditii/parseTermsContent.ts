export type TermsBlock =
  | { type: "part-title"; text: string }
  | { type: "section-title"; id: string; num: string; text: string }
  | { type: "subsection-title"; id: string; num: string; text: string }
  | { type: "paragraph"; text: string }
  | { type: "caps"; text: string }
  | { type: "list"; items: string[] };

function slugFromNum(num: string) {
  return `s-${num.replace(/\./g, "-")}`;
}

export function parseTermsText(raw: string): TermsBlock[] {
  const blocks: TermsBlock[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({ type: "list", items: [...listBuffer] });
      listBuffer = [];
    }
  };

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    if (/^I\.\s/i.test(line)) {
      flushList();
      blocks.push({ type: "part-title", text: line });
      continue;
    }

    const sectionMatch = line.match(/^(\d+(?:\.\d+)?)\.\s+(.+)$/);
    if (sectionMatch && !/^[a-z]\)/i.test(line) && !/^\d+\)/.test(line)) {
      const num = sectionMatch[1];
      const text = sectionMatch[2];
      const isSubsection = num.includes(".");
      const sectionNum = parseInt(num.split(".")[0], 10);
      const isMainSection =
        !isSubsection &&
        sectionNum >= 1 &&
        sectionNum <= 18 &&
        text.length <= 120;

      if (isMainSection || isSubsection) {
        flushList();
        const id = slugFromNum(num);
        if (isSubsection) {
          blocks.push({ type: "subsection-title", id, num, text });
        } else {
          blocks.push({ type: "section-title", id, num, text });
        }
        continue;
      }

      listBuffer.push(line);
      continue;
    }

    if (/^[a-z]\)/i.test(line) || /^\d+\)/.test(line) || /^[•\u2003•]/.test(line)) {
      listBuffer.push(line.replace(/^[\s•\u2003]+/, "").replace(/^•\s*/, ""));
      continue;
    }

    flushList();

    if (line === line.toUpperCase() && line.length > 50 && /[A-ZĂÂÎȘȚ]/.test(line)) {
      blocks.push({ type: "caps", text: line });
    } else {
      blocks.push({ type: "paragraph", text: line });
    }
  }

  flushList();
  return blocks;
}
