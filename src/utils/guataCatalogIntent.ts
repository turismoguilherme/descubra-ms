/** Consulta de agenda/eventos (dados ao vivo via search_events — não exige login). */
export type GuataCatalogAction = "consultar_eventos";

export function detectGuataCatalogAction(prompt: string): GuataCatalogAction | null {
  const p = prompt.toLowerCase();
  if (/(cadastrar|criar|registrar).{0,20}evento/.test(p)) return null;
  if (
    /(evento|eventos|agenda|festival|show|shows|feira|acontecendo|programa[çc][aã]o|o que tem|o que rola)/.test(p)
  ) {
    return "consultar_eventos";
  }
  return null;
}
