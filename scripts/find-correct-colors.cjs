// Script para encontrar as cores corretas de cada região no SVG
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Extrair todos os grupos com suas cores
const groupRegex = /<g[^>]*((?:fill|stroke)="#([0-9A-Fa-f]{6})")[^>]*>([\s\S]*?)<\/g>/gi;
const groups = [];
let match;

while ((match = groupRegex.exec(svgContent)) !== null) {
  const color = match[2].toUpperCase();
  const content = match[3];
  const pathMatches = content.match(/<path[^>]*d="([^"]+)"[^>]*>/gi) || [];
  
  if (pathMatches.length > 0) {
    groups.push({
      color,
      pathCount: pathMatches.length,
      hasFill: match[1].includes('fill'),
      hasStroke: match[1].includes('stroke')
    });
  }
}

// Agrupar por cor e contar
const colorStats = {};
groups.forEach(g => {
  if (!colorStats[g.color]) {
    colorStats[g.color] = {
      totalPaths: 0,
      groups: 0,
      hasFill: false,
      hasStroke: false
    };
  }
  colorStats[g.color].totalPaths += g.pathCount;
  colorStats[g.color].groups += 1;
  if (g.hasFill) colorStats[g.color].hasFill = true;
  if (g.hasStroke) colorStats[g.color].hasStroke = true;
});

// Ordenar por número de paths (regiões maiores têm mais paths)
console.log('Cores ordenadas por número de paths (maior = região maior):\n');
const sortedColors = Object.keys(colorStats)
  .sort((a, b) => colorStats[b].totalPaths - colorStats[a].totalPaths)
  .slice(0, 20); // Top 20

sortedColors.forEach(color => {
  const stats = colorStats[color];
  console.log(`${color}: ${stats.totalPaths} paths, ${stats.groups} grupos, fill=${stats.hasFill}, stroke=${stats.hasStroke}`);
});

// Tentar identificar cores por padrão
console.log('\n\nTentativa de identificação por padrão de cor:\n');

// Amarelo (D1B2xx, CFB1xx, D2B3xx)
const amarelo = sortedColors.filter(c => c.startsWith('D1B2') || c.startsWith('CFB1') || c.startsWith('D2B3'));
console.log('AMARELO (PANTANAL):', amarelo.join(', '));

// Verde (84A2xx, 83A1xx, 86A1xx)
const verde = sortedColors.filter(c => c.startsWith('84A2') || c.startsWith('83A1') || c.startsWith('86A1'));
console.log('VERDE (ROTA CERRADO PANTANAL):', verde.join(', '));

// Vermelho forte (D846xx, DA42xx, DB42xx, DB41xx, D948xx)
const vermelhoForte = sortedColors.filter(c => c.startsWith('D846') || c.startsWith('DA42') || c.startsWith('DB42') || c.startsWith('DB41') || c.startsWith('D948'));
console.log('VERMELHO FORTE (COSTA LESTE):', vermelhoForte.join(', '));

// Roxo (7644xx, 7542xx, 7744xx)
const roxo = sortedColors.filter(c => c.startsWith('7644') || c.startsWith('7542') || c.startsWith('7744'));
console.log('ROXO (CAMPO GRANDE DOS IPÊS):', roxo.join(', '));

// Azul marinho (118Dxx, 128Exx, 148Dxx, 158Fxx, 168Exx, 1A8Exx, 228Fxx)
const azulMarinho = sortedColors.filter(c => c.startsWith('118D') || c.startsWith('128E') || c.startsWith('148D') || c.startsWith('158F') || c.startsWith('168E') || c.startsWith('1A8E') || c.startsWith('228F'));
console.log('AZUL MARINHO (BONITO-SERRA DA BODOQUENA):', azulMarinho.join(', '));

// Marrom (DA55xx, DB55xx, E04Exx, E050xx, E051xx)
const marrom = sortedColors.filter(c => c.startsWith('DA55') || c.startsWith('DB55') || c.startsWith('E04E') || c.startsWith('E050') || c.startsWith('E051'));
console.log('MARROM (CAMINHOS DA FRONTEIRA):', marrom.join(', '));

// Azul forte/ciano (81C7xx, 82C7xx, 84C7xx, 84C8xx, 8FC4xx, 9CD5xx)
const azulForte = sortedColors.filter(c => c.startsWith('81C7') || c.startsWith('82C7') || c.startsWith('84C7') || c.startsWith('84C8') || c.startsWith('8FC4') || c.startsWith('9CD5'));
console.log('AZUL FORTE (VALE DAS ÁGUAS):', azulForte.join(', '));

// Vermelho fraco (D49Bxx, D69Fxx, D79Exx, D79Fxx, D99Axx)
const vermelhoFraco = sortedColors.filter(c => c.startsWith('D49B') || c.startsWith('D69F') || c.startsWith('D79E') || c.startsWith('D79F') || c.startsWith('D99A'));
console.log('VERMELHO FRACO (CAMINHOS DA NATUREZA-CONE SUL):', vermelhoFraco.join(', '));

// Cinza (C1C1xx, C2CAxx, CCC0xx, C1E2xx, CED1xx)
const cinza = sortedColors.filter(c => c.startsWith('C1C1') || c.startsWith('C2CA') || c.startsWith('CCC0') || c.startsWith('C1E2') || c.startsWith('CED1'));
console.log('CINZA (CELEIRO DO MS):', cinza.join(', '));


