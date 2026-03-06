/**
 * Mapeamento de cores hex (fill) do SVG mapa-ms-regioes.svg para slugs de regiões turísticas.
 * 
 * Cada grupo `<g fill="#COR">` no SVG corresponde a uma área geográfica.
 * Este mapeamento centralizado conecta a cor ao slug da região turística.
 * 
 * Cores foram extraídas manualmente do SVG e verificadas contra o mapa de referência oficial.
 */

// Cores primárias de cada região (alta confiança)
const PANTANAL_COLORS = [
  'D1B21B', 'D1B218', 'CFB11C', 'D2B31C', 'DACC7A',
  'D9CF8F', 'E2D78E', 'F3F0D3', 'D0B11B', 'D0B21C',
  'CFB21C', 'D1B31C', 'DAC97A', 'DACB7A', 'DACD7A',
  'E1D78E', 'E3D78E', 'D9CE8F', 'D8CF8F',
];

const CERRADO_PANTANAL_COLORS = [
  '84A24B', '84A148', '83A147', '83A049', '86A155',
  '84A147', '83A148', '84A149', '85A24B', '85A14A',
  'C2CDAF', 'C2CAAF', 'C2CBAF', 'C3CDAF', 'C1CAAF',
  'C2CCAF', 'C3CBAF',
];

const COSTA_LESTE_COLORS = [
  'D84642', 'DA4340', 'DA4240', 'DB4240', 'D94541',
  'D84541', 'D94641', 'DA4440', 'DB4340', 'D84742',
  'D49B9A', 'D59B9A', 'D49C9B', 'D59C9A',
  'CCC0A9', 'CCC1A9', 'CBBFA9', 'CCC0AA',
];

const CAMPO_GRANDE_COLORS = [
  '76448E', '75428E', '76428D', '76438E', '75438E',
  '76448D', '77448E', '75428D', '76438D',
  'BFB2C9', 'B5B4D4', 'B3B3D4', 'BEB2C9', 'B4B4D4',
  'B6B4D4', 'BFB3C9', 'B5B3D4', 'B4B3D4',
];

const BONITO_COLORS = [
  '81C7CF', '81C7D1', '82C7CE', '80C7CF', '82C7D0',
  '81C8CF', '81C6CF', '82C8CF', '80C7D0', '81C7D0',
  'BDE0E3', 'BCE0E3', 'BDE1E3', 'BDE0E4', 'BCE1E3',
];

const FRONTEIRA_COLORS = [
  '77694D', '786C4F', '76684C', '77684D', '786B4F',
  '76694D', '776A4E', '786C4E', '76674C', '77694E',
  'B9B29A', 'BAB39B', 'B9B39A', 'B8B29A', 'BAB29B',
];

const VALE_AGUAS_COLORS = [
  '118DC2', '128EC1', '148DC1', '138DC2', '118EC2',
  '128DC1', '138EC1', '148EC1', '118DC1', '128EC2',
  '88C5E0', '89C5E0', '88C6E0', '87C5E0', '89C6E0',
];

const CONE_SUL_COLORS = [
  'E0501C', 'E04E1A', 'DA5527', 'E04F1C', 'DF4F1B',
  'E0511C', 'DF501C', 'E04E1B', 'DA5427', 'DA5628',
  'EDAA92', 'EDA992', 'EEAA92', 'EDAB92', 'ECA992',
];

const CELEIRO_COLORS = [
  'D2B31C', // — cuidado: pode se confundir com Pantanal, mas pelo posicionamento geográfico é Celeiro
];

/**
 * Mapeamento cor hex (sem #) → slug da região turística.
 * Normalizado para uppercase.
 */
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
addColors(BONITO_COLORS, 'bonito-serra-bodoquena');
addColors(FRONTEIRA_COLORS, 'caminhos-fronteira');
addColors(VALE_AGUAS_COLORS, 'vale-das-aguas');
addColors(CONE_SUL_COLORS, 'caminhos-natureza-cone-sul');
addColors(CELEIRO_COLORS, 'celeiro-ms');

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
 * Retorna todas as cores mapeadas para uma região específica.
 * Usado para destacar todos os grupos SVG de uma região.
 */
export function getColorsByRegion(slug: string): string[] {
  const colors: string[] = [];
  colorToRegionMap.forEach((regionSlug, color) => {
    if (regionSlug === slug) colors.push(color);
  });
  return colors;
}

/**
 * Fallback: determina a região com base na posição geográfica (coordenada Y do primeiro ponto M).
 * Usado quando a cor não está no mapeamento.
 * 
 * Divisão vertical aproximada do MS no SVG (viewBox 0 0 896 1152):
 * - Y < 400: Norte (Cerrado Pantanal / Pantanal)
 * - Y 400-600: Centro-Norte (Campo Grande / Costa Leste)
 * - Y 600-800: Centro-Sul (Bonito / Vale das Águas / Fronteira)
 * - Y > 800: Sul (Cone Sul / Celeiro)
 */
export function getRegionByPosition(pathD: string, hexColor: string): string | null {
  // Extrair primeiro ponto M do path
  const match = pathD.match(/M\s+([\d.]+)\s+([\d.]+)/);
  if (!match) return null;

  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);

  // Heurística baseada na tonalidade da cor + posição
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  // Tons amarelados/dourados → provavelmente Pantanal
  if (r > 180 && g > 150 && b < 100 && x < 400) return 'pantanal';

  // Tons verdes → provavelmente Cerrado Pantanal
  if (g > r && g > b && r < 150) return 'rota-cerrado-pantanal';

  // Tons vermelhos → Costa Leste (leste do mapa, x > 600)
  if (r > 180 && g < 100 && x > 600) return 'costa-leste';

  // Tons roxos → Campo Grande
  if (r > 100 && b > 100 && g < 80) return 'campo-grande-ipes';

  // Tons ciano/teal → Bonito
  if (b > 180 && g > 180 && r < 150) return 'bonito-serra-bodoquena';

  // Tons azuis escuros → Vale das Águas
  if (b > 180 && r < 50) return 'vale-das-aguas';

  // Tons laranja → Cone Sul (sul do mapa, y > 800)
  if (r > 200 && g < 100 && y > 800) return 'caminhos-natureza-cone-sul';

  return null;
}

export default colorToRegionMap;
