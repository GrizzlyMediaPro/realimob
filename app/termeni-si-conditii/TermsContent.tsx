import { readFileSync } from "fs";
import path from "path";
import { parseTermsText, type TermsBlock } from "./parseTermsContent";

const SECTION_FILES = [
  "00-intro.txt",
  "02-descriere.txt",
  "03-inregistrare.txt",
  "04-anunturi.txt",
  "05-08.txt",
  "09-12.txt",
  "14-cautare.txt",
  "13-18.txt",
];

const COMPANY = {
  name: "Realimob Real Estate S.R.L.",
  cui: "RO50196931",
  registry: "J40112922024",
  phone: "0729772025",
};

function loadAllBlocks(): TermsBlock[] {
  const dir = path.join(process.cwd(), "app", "termeni-si-conditii", "sections");
  const chunks: TermsBlock[] = [];

  for (const file of SECTION_FILES) {
    const filePath = path.join(dir, file);
    const raw = readFileSync(filePath, "utf8");
    chunks.push(...parseTermsText(raw));
  }

  return chunks;
}

function RenderBlocks({ blocks }: { blocks: TermsBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "part-title":
            return (
              <p
                key={index}
                className="font-semibold text-lg mt-6 first:mt-0"
              >
                {block.text}
              </p>
            );
          case "section-title":
            return (
              <h2
                key={index}
                id={block.id}
                className="text-xl md:text-2xl font-semibold mt-10 mb-4 scroll-mt-28"
              >
                {block.num}. {block.text}
              </h2>
            );
          case "subsection-title":
            return (
              <h3
                key={index}
                id={block.id}
                className="text-lg font-semibold mt-6 mb-3 scroll-mt-28"
              >
                {block.num}. {block.text}
              </h3>
            );
          case "caps":
            return (
              <p
                key={index}
                className="text-xs md:text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400"
              >
                {block.text}
              </p>
            );
          case "list":
            return (
              <ul key={index} className="list-disc pl-6 space-y-2">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
          case "paragraph":
          default:
            return (
              <p key={index} className="text-sm md:text-base leading-7">
                {block.text}
              </p>
            );
        }
      })}
    </>
  );
}

export default function TermsContent() {
  const blocks = loadAllBlocks();

  return (
    <article className="space-y-4">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 text-sm md:text-base space-y-1">
        <p className="font-semibold">{COMPANY.name}</p>
        <p>CUI: {COMPANY.cui}</p>
        <p>Nr. Registrul Comerțului: {COMPANY.registry}</p>
        <p>Tel: {COMPANY.phone}</p>
      </div>
      <RenderBlocks blocks={blocks} />
    </article>
  );
}
