// Script melhorado para extrair paths corretos do SVG baseado nas cores do stroke
// Este script extrai os paths que correspondem exatamente às áreas coloridas do mapa
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Mapeamento de cores HEX (sem #) para regiões
// Baseado nas cores reais do SVG que definem cada região
// CORRIGIDO: Separando corretamente as cores de cada região
const colorMapping = {
  // AMARELO/DOURADO: PANTANAL
  'pantanal': ['D1B21B', 'D1B218', 'CFB11C', 'D2B31C', 'D1B21A', 'DACC7A', 'E2D78E', 'D9CF8F'],
  
  // VERDE: ROTA CERRADO PANTANAL
  'rota-cerrado-pantanal': ['84A24B', '84A148', '83A147', '83A049', '84A147', '86A155', '83A148'],
  
  // VERMELHO FORTE: COSTA LESTE (apenas vermelhos fortes, não laranjas)
  'costa-leste': ['D84642', 'DA4240', 'DA4340', 'DB4240', 'DB423F', 'DB413F', 'D94844'],
  
  // ROXO: CAMPO GRANDE DOS IPÊS
  'campo-grande-ipes': ['76448E', '75428E', '76428D', '76438D', '76448D', '77448E', '77448F', '75428C', '76428E'],
  
  // AZUL CIANO: BONITO-SERRA DA BODOQUENA (no SVG, as cores azul ciano estão no OESTE onde fica o Bonito)
  'bonito-serra-bodoquena': ['81C7CF', '81C7D1', '82C7CE', '82C7D0', '84C7D0', '84C8D0', '8FC4D6', '9CD5E3'],
  
  // MARROM: CAMINHOS DA FRONTEIRA
  'caminhos-fronteira': ['77694D', '786C4F', '76684C', '776A4D', '776D4F', '776B4E', '77694C', '7A6C4F'],
  
  // AZUL MARINHO: VALE DAS ÁGUAS (no SVG, as cores azul-marinho estão no SUDESTE onde fica o Vale das Águas)
  'vale-das-aguas': ['118DC2', '128EC1', '148DC1', '148EBF', '158FC0', '158FC2', '168EC1', '1A8EBE', '228FBC'],
  
  // LARANJA/ROSA: CAMINHOS DA NATUREZA-CONE SUL (laranjas e rosas)
  'caminhos-natureza-cone-sul': [
    // Cores laranja/vermelho-laranja
    'E0501C', 'E04E1A', 'E0511F', 'E39778', 'DA5527', 'DB5523', 'D4A488',
    // Cores rosa (que estavam sendo capturadas pelo Celeiro)
    'D49B9A', 'D69F9D', 'D79E9A', 'D79F9A', 'D99A9C', 'CDABB3', 'C6B2B4', 'CFBABB', 'CAB6B2'
  ],
  
  // LILÁS/CINZA: CELEIRO DO MS (apenas lilás/cinza, removendo rosas e cores do Pantanal)
  'celeiro-ms': [
    // Lilás
    'BFB2C9', 'BEAFC9', 'CAA9B8', 'B5B4D4', 'B3B3D4', 'B3B3D2', 'B1B2D5', 'B1B2D4', 'B0B2D4', 'B2B4D6',
    // Cinza/lilás claro
    'C1C1BF', 'C2CAAF', 'CCC0A9', 'C1E2E3', 'CED1DD', 'D3BCB2', 'CFB9A9', 'D6C7A8',
    // Outros tons neutros (REMOVENDO D9CF8F que pertence ao Pantanal)
    'C6B6BA', 'BDB6BE', 'B5C2CD', 'C0BCB1', 'BFB9AD', 'BFB8AC', 'BCB8AB', 'AAC4CD', 'A7B2A7',
    'C2CDAF', 'D1DAB9', 'D3DBB9', 'E2E9EB', 'E4DE9A', 'CCAF9B', 'DAB8A1'
  ]
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

// Regex para encontrar grupos <g> com stroke OU fill colorido
// Formato: <g ... stroke="#COR" ...> ou <g ... fill="#COR" ...>
const groupRegex = /<g[^>]*>([\s\S]*?)<\/g>/gi;
let match;

while ((match = groupRegex.exec(svgContent)) !== null) {
  const groupTag = match[0];
  const groupContent = match[1];
  
  // Extrair cor do stroke ou fill
  const strokeMatch = groupTag.match(/stroke="#([A-F0-9]{6})"/i);
  const fillMatch = groupTag.match(/fill="#([A-F0-9]{6})"/i);
  
  // Usar stroke se disponível, senão usar fill (mas ignorar "None")
  let color = null;
  if (strokeMatch && strokeMatch[1].toUpperCase() !== 'NONE') {
    color = normalizeColor(strokeMatch[1]);
  } else if (fillMatch && fillMatch[1].toUpperCase() !== 'NONE') {
    color = normalizeColor(fillMatch[1]);
  }
  
  if (!color) continue;
  
  // Extrair todos os paths deste grupo
  const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/gi;
  let pathMatch;
  
  while ((pathMatch = pathRegex.exec(groupContent)) !== null) {
    const pathData = pathMatch[1].trim();
    
    if (pathData && pathData.length > 10) { // Filtrar paths muito pequenos
      if (!pathsByColor[color]) {
        pathsByColor[color] = [];
      }
      
      // Adicionar path se não estiver duplicado
      if (!pathsByColor[color].includes(pathData)) {
        pathsByColor[color].push(pathData);
      }
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

