// Script melhorado para extrair paths corretos do SVG baseado nas cores do stroke
// Este script extrai os paths que correspondem exatamente às áreas coloridas do mapa
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Mapeamento de cores HEX (sem #) para regiões
// Baseado nas cores reais do SVG que definem cada região
const colorMapping = {
  // AMARELO/DOURADO: PANTANAL
  'pantanal': ['D1B21B', 'D1B218', 'CFB11C', 'D2B31C', 'D1B21A', 'DACC7A', 'E2D78E', 'D9CF8F'],
  
  // VERDE: ROTA CERRADO PANTANAL
  'rota-cerrado-pantanal': ['84A24B', '84A148', '83A147', '83A049', '84A147', '86A155', '83A148'],
  
  // VERMELHO FORTE: COSTA LESTE
  'costa-leste': ['D84642', 'DA4240', 'DA4340', 'DB4240', 'DB423F', 'DB413F', 'D94844'],
  
  // ROXO: CAMPO GRANDE DOS IPÊS
  'campo-grande-ipes': ['76448E', '75428E', '76428D', '76438D', '76448D', '77448E', '77448F', '75428C', '76428E'],
  
  // AZUL MARINHO: BONITO-SERRA DA BODOQUENA
  'bonito-serra-bodoquena': ['118DC2', '128EC1', '148DC1', '148EBF', '158FC0', '158FC2', '168EC1', '1A8EBE', '228FBC'],
  
  // MARROM: CAMINHOS DA FRONTEIRA
  'caminhos-fronteira': ['77694D', '786C4F', '76684C', '776A4D', '776D4F', '776B4E', '77694C', '7A6C4F'],
  
  // AZUL CIANO: VALE DAS ÁGUAS
  'vale-das-aguas': ['81C7CF', '81C7D1', '82C7CE', '82C7D0', '84C7D0', '84C8D0', '8FC4D6', '9CD5E3'],
  
  // ROSA/VERMELHO FRACO: CAMINHOS DA NATUREZA-CONE SUL
  'caminhos-natureza-cone-sul': ['D49B9A', 'D69F9D', 'D79E9A', 'D79F9A', 'D99A9C', 'CDABB3', 'C6B2B4'],
  
  // CINZA/LILÁS: CELEIRO DO MS
  'celeiro-ms': ['C1C1BF', 'C2CAAF', 'CCC0A9', 'C1E2E3', 'CED1DD', 'D3BCB2', 'CFB9A9', 'D6C7A8', 'BFB2C9', 'BEAFC9', 'CAA9B8']
};

// Função para normalizar cores (remover # e converter para maiúsculas)
function normalizeColor(color) {
  return color.replace('#', '').toUpperCase();
}

// Extrair todos os paths do SVG agrupados por cor do stroke
const pathsByColor = {};
const regionPaths = {};

// Inicializar arrays para cada região
Object.keys(colorMapping).forEach(regionId => {
  regionPaths[regionId] = [];
});

// Regex para encontrar grupos <g> com stroke colorido
// Formato: <g fill="None" ... stroke="#COR" ...><path d="..."/></g>
const groupRegex = /<g[^>]*stroke="#([A-F0-9]{6})"[^>]*>([\s\S]*?)<\/g>/gi;
let match;

while ((match = groupRegex.exec(svgContent)) !== null) {
  const strokeColor = normalizeColor(match[1]);
  const groupContent = match[2];
  
  // Extrair todos os paths deste grupo
  const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/gi;
  let pathMatch;
  
  while ((pathMatch = pathRegex.exec(groupContent)) !== null) {
    const pathData = pathMatch[1].trim();
    
    if (!pathsByColor[strokeColor]) {
      pathsByColor[strokeColor] = [];
    }
    
    // Adicionar path se não estiver duplicado
    if (!pathsByColor[strokeColor].includes(pathData)) {
      pathsByColor[strokeColor].push(pathData);
    }
  }
}

// Mapear paths para regiões baseado nas cores
Object.keys(colorMapping).forEach(regionId => {
  const colors = colorMapping[regionId];
  const usedPaths = new Set();
  
  colors.forEach(color => {
    const normalizedColor = normalizeColor(color);
    if (pathsByColor[normalizedColor]) {
      pathsByColor[normalizedColor].forEach(pathData => {
        if (!usedPaths.has(pathData)) {
          regionPaths[regionId].push(pathData);
          usedPaths.add(pathData);
        }
      });
    }
  });
});

// Estatísticas
console.log('\n=== EXTRAÇÃO DE PATHS POR REGIÃO ===\n');
Object.keys(regionPaths).forEach(regionId => {
  console.log(`${regionId}: ${regionPaths[regionId].length} paths`);
});

// Verificar cores encontradas no SVG
console.log('\n=== CORES ENCONTRADAS NO SVG ===\n');
const foundColors = Object.keys(pathsByColor).sort();
foundColors.forEach(color => {
  console.log(`#${color}: ${pathsByColor[color].length} paths`);
});

// Salvar resultado
const output = {
  regions: regionPaths,
  metadata: {
    extractedAt: new Date().toISOString(),
    totalRegions: Object.keys(regionPaths).length,
    totalPaths: Object.values(regionPaths).reduce((sum, paths) => sum + paths.length, 0)
  },
  summary: Object.keys(regionPaths).map(id => ({
    id,
    pathCount: regionPaths[id].length
  }))
};

const outputPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✅ Arquivo salvo em: ${outputPath}`);
console.log(`📊 Total de paths extraídos: ${output.metadata.totalPaths}`);

