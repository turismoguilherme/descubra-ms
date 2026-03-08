/**
 * Mapeamento de cores hex (fill) do SVG mapa-ms-regioes.svg para slugs de regiões turísticas.
 * 
 * Cada grupo `<g fill="#COR">` no SVG corresponde a uma área geográfica.
 * Cores foram extraídas manualmente do SVG e verificadas contra o mapa de referência oficial.
 * 
 * IMPORTANTE: Cores de transição/borda (tons neutros, quase-brancos) foram excluídas
 * intencionalmente para evitar que cliques em bordas ativem regiões erradas.
 */

// ═══════════════════════════════════════════════════════
// PANTANAL (tons dourados/amarelos) - Lado Oeste do mapa
// ═══════════════════════════════════════════════════════
const PANTANAL_COLORS = [
  'D1B21B', 'D1B218', 'D1B21A', 'D2B31C',
  'DACC7A', 'D9CF8F', 'E2D78E', 'F3F0D3',
];

// ═══════════════════════════════════════════════════════
// ROTA CERRADO PANTANAL (tons verdes) - Norte do mapa
// ═══════════════════════════════════════════════════════
const CERRADO_PANTANAL_COLORS = [
  '84A24B', '83A148', '84A148', '83A147', '84A147',
  '83A049', '86A155',
  'C2CDAF', 'C2CAAF', // versões claras
  // Cor de borda/transição (bege, Y < 500)
  'CCC0A9',
];

// ═══════════════════════════════════════════════════════
// COSTA LESTE (tons vermelhos) - Lado Leste do mapa
// ═══════════════════════════════════════════════════════
const COSTA_LESTE_COLORS = [
  'D84642', 'DA4340', 'DA4240', 'DB413F', 'DB423F',
  'DB4240', 'D94844',
  'D99A9C', 'D69F9D', 'D79E9A', 'D79F9A', // versões claras
];

// ═══════════════════════════════════════════════════════
// CAMPO GRANDE DOS IPÊS (tons roxos escuros) - Centro do mapa
// Nota: cores roxas escuras (76xxxx) também aparecem na região Celeiro
// ao sul. A distinção é feita por posição geográfica (Y > 650 = Celeiro).
// ═══════════════════════════════════════════════════════
const CAMPO_GRANDE_COLORS = [
  // Roxos escuros (primários) - podem ser Campo Grande OU Celeiro
  // Resolvidos por coordenada Y do clique real (AMBIGUOUS_PURPLE_SET)
  '76448E', '76438D', '76428E', '76428D',
  '75428C', '75428E', '77448E', '77448F',
  // Roxos claros que CRUZAM ambas as regiões - também ambíguos
  'BFB2C9', 'BEAFC9',
];

// ═══════════════════════════════════════════════════════
// CELEIRO DO MS (tons lilás/roxo-azulado claros) - Sul do mapa
// Estes tons mais azulados (~D4, ~D5, ~D6) são EXCLUSIVOS do Celeiro
// ═══════════════════════════════════════════════════════
const CELEIRO_COLORS = [
  'B1B2D4', 'B0B2D4', 'B5B4D4', 'B3B3D4',
  'B3B3D2', 'B2B4D6', 'B1B2D5',
  // Cores de borda/transição (cinza-azulado, Y > 700)
  'B5C2CD', 'BDB6BE',
  // Cinza-lilás de borda sul
  'CED1DD',
];

// ═══════════════════════════════════════════════════════
// BONITO SERRA DA BODOQUENA (tons ciano/teal) - Centro-oeste
// ═══════════════════════════════════════════════════════
const BONITO_COLORS = [
  '81C7D1', '82C7CE', '81C7CF', '84C7D0',
  '84C8D0', '82C7D0',
  'C1E2E3', // versão clara
];

// ═══════════════════════════════════════════════════════
// CAMINHOS DA FRONTEIRA (tons marrom/oliva) - Sul-centro
// ═══════════════════════════════════════════════════════
const FRONTEIRA_COLORS = [
  '77694D', '786C4F', '76684C', '776A4D',
  '776D4F', '776B4E', '77694C', '7A6C4F',
  // Cores de borda/transição (bege-cinza, Y > 850)
  'BCB8AB', 'BFB9AD', 'BFB8AC',
];

// ═══════════════════════════════════════════════════════
// VALE DAS ÁGUAS (tons azuis) - Leste-centro a sudeste
// ═══════════════════════════════════════════════════════
const VALE_AGUAS_COLORS = [
  '118DC2', '148DC1', '168EC1', '128EC1',
  '158FC2', '158FC0', '1A8EBE', '148EBF', '228FBC',
];

// ═══════════════════════════════════════════════════════
// CAMINHOS DA NATUREZA / CONE SUL (tons laranja) - Sul
// ═══════════════════════════════════════════════════════
const CONE_SUL_COLORS = [
  'E0511F', 'E0501C', 'E04E1A', 'DB5523', 'DA5527',
];

// ═══════════════════════════════════════════════════════
// Construção do mapa cor → região
// ═══════════════════════════════════════════════════════
const colorToRegionMap = new Map<string, string>();

const addColors = (colors: string[], slug: string) => {
  colors.forEach(c => {
    const normalized = c.replace(/\s/g, '').toUpperCase();
    if (normalized.length === 6) {
      colorToRegionMap.set(normalized, slug);
    }
  });
};

addColors(PANTANAL_COLORS, 'pantanal');
addColors(CERRADO_PANTANAL_COLORS, 'rota-cerrado-pantanal');
addColors(COSTA_LESTE_COLORS, 'costa-leste');
addColors(CAMPO_GRANDE_COLORS, 'campo-grande-ipes');
addColors(CELEIRO_COLORS, 'celeiro-ms');
addColors(BONITO_COLORS, 'bonito-serra-bodoquena');
addColors(FRONTEIRA_COLORS, 'caminhos-fronteira');
addColors(VALE_AGUAS_COLORS, 'vale-das-aguas');
addColors(CONE_SUL_COLORS, 'caminhos-natureza-cone-sul');

/**
 * Set de cores roxas escuras que são ambíguas (Campo Grande vs Celeiro).
 * Para estas cores, a região correta depende da posição Y do path.
 */
const AMBIGUOUS_PURPLE_SET = new Set([
  // Roxos escuros que aparecem em ambas as regiões
  '76448E', '76438D', '76428E', '76428D',
  '75428C', '75428E', '77448E', '77448F',
  // Roxos/lilás claros cujos paths cruzam ambas as regiões
  'BEAFC9', 'BFB2C9',
]);

/** Limiar Y para separar Campo Grande (centro) de Celeiro (sul) no SVG (viewBox 0 0 896 1152) */
const CAMPO_GRANDE_CELEIRO_Y_THRESHOLD = 650;

/**
 * Retorna o slug da região turística com base na cor hex do fill.
 * @param hexColor Cor hex sem # (ex: "D1B21B")
 * @returns slug da região ou null se não mapeada
 */
export function getRegionByColor(hexColor: string): string | null {
  const normalized = hexColor.replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
  return colorToRegionMap.get(normalized) || null;
}

/**
 * Verifica se uma cor roxa é ambígua (pode ser Campo Grande ou Celeiro).
 */
export function isAmbiguousPurple(hexColor: string): boolean {
  const normalized = hexColor.replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
  return AMBIGUOUS_PURPLE_SET.has(normalized);
}

/**
 * Para cores roxas ambíguas, determina se é Campo Grande ou Celeiro
 * com base na posição Y do primeiro ponto M do path.
 */
export function resolveAmbiguousPurple(pathD: string): string {
  const match = pathD.match(/M\s+([\d.]+)\s+([\d.]+)/);
  if (!match) return 'campo-grande-ipes';

  const y = parseFloat(match[2]);
  return y > CAMPO_GRANDE_CELEIRO_Y_THRESHOLD ? 'celeiro-ms' : 'campo-grande-ipes';
}

/**
 * Retorna todas as cores mapeadas para uma região específica.
 */
export function getColorsByRegion(slug: string): string[] {
  const colors: string[] = [];
  colorToRegionMap.forEach((regionSlug, color) => {
    if (regionSlug === slug) colors.push(color);
  });
  return colors;
}

export default colorToRegionMap;
