/** Corta em um limite amigável, preferindo fim de frase ou quebra de linha. */
export function truncateForPreview(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastNl = slice.lastIndexOf("\n");
  const lastSentence = slice.lastIndexOf(". ");
  const cut = Math.max(lastNl, lastSentence);
  if (cut > maxLen * 0.45) {
    return slice.slice(0, cut + (lastSentence === cut ? 2 : 0)).trimEnd();
  }
  return slice.trimEnd();
}
