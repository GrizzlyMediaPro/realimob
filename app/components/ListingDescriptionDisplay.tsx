type Props = {
  html: string | null | undefined;
  fallback?: string;
  className?: string;
};

const contentClassName =
  "text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed " +
  "[&_p]:mb-3 [&_p:last-child]:mb-0 " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 " +
  "[&_li]:mb-1 " +
  "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-foreground [&_h2:first-child]:mt-0 " +
  "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-foreground " +
  "[&_a]:text-[#C25A2B] [&_a]:underline " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 " +
  "[&_hr]:my-4 [&_hr]:border-gray-200 dark:[&_hr]:border-gray-600";

export default function ListingDescriptionDisplay({
  html,
  fallback = "",
  className = "",
}: Props) {
  const trimmed = (html ?? "").trim();
  if (!trimmed) {
    return (
      <p className={`${contentClassName} ${className}`.trim()}>{fallback}</p>
    );
  }
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(trimmed);
  if (!looksLikeHtml) {
    return (
      <p
        className={`${contentClassName} whitespace-pre-line ${className}`.trim()}
      >
        {trimmed}
      </p>
    );
  }
  return (
    <div
      className={`${contentClassName} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}
