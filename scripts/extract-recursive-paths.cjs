// Script para extrair paths recursivamente de todos os níveis de grupos
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Função recursiva para extrair paths de grupos aninhados
function extractPathsFromGroup(groupContent, color) {
  const paths = [];
  
  // Extrair paths diretos no grupo
  const directPathRegex = /<path[^>]*d="([^"]+)"[^>]*>/gi;
  let match;
  while ((match = directPathRegex.exec(groupContent)) !== null) {
    paths.push(match[1].trim());
  }
  
  // Extrair paths de sub-grupos recursivamente
  const subGroupRegex = /<g[^>]*>([\s\S]*?)<\/g>/gi;
  let subMatch;
  while ((subMatch = subGroupRegex.exec(groupContent)) !== null) {
    const subPaths = extractPathsFromGroup(subMatch[1], color);
    paths.push(...subPaths);
  }
  
  return paths;
}

// Mapeamento de cores
const colorMapping = {
  'pantanal': ['D1B21B', 'D1B218', 'CFB11C', 'D2B31C', 'D1B21A'],
  'rota-cerrado-pantanal': ['84A24B', '84A148', '83A147', '83A049', '84A147', '86A155'],
  'costa-leste': ['D84642', 'DA4240', 'DA4340', 'DB4240', 'DB423F', 'DB413F', 'D94844'],
  'campo-grande-ipes': ['76448E', '75428E', '76428D', '76438D', '76448D', '77448E', '77448F', '75428C'],
  'bonito-serra-bodoquena': ['118DC2', '128EC1', '148DC1', '148EBF', '158FC0', '158FC2', '168EC1', '1A8EBE', '228FBC'],
  'caminhos-fronteira': ['DA5527', 'DB5523', 'E04E1A', 'E0501C', 'E0511F'],
  'vale-das-aguas': ['81C7CF', '81C7D1', '82C7CE', '82C7D0', '84C7D0', '84C8D0', '8FC4D6', '9CD5E3'],
  'caminhos-natureza-cone-sul': ['D49B9A', 'D69F9D', 'D79E9A', 'D79F9A', 'D99A9C'],
  'celeiro-ms': ['C1C1BF', 'C2CAAF', 'CCC0A9', 'C1E2E3', 'CED1DD']
};

// Extrair paths por cor de forma recursiva
const regionPaths = {};
const colorStats = {};

Object.keys(colorMapping).forEach(regionId => {
  const colors = colorMapping[regionId];
  const allPaths = [];
  const usedPaths = new Set();
  const foundColors = [];
  
  colors.forEach(color => {
    // EXTRAIR APENAS de grupos com FILL (áreas coloridas)
    // Ignorar grupos com stroke (são apenas contornos/bordas)
    const groupRegex = new RegExp(`<g[^>]*fill="#${color}"[^>]*>([\\s\\S]*?)</g>`, 'gi');
    let match;
    let colorPathCount = 0;
    
    while ((match = groupRegex.exec(svgContent)) !== null) {
      const groupContent = match[1];
      const paths = extractPathsFromGroup(groupContent, color);
      
      paths.forEach(pathData => {
        if (!usedPaths.has(pathData)) {
          allPaths.push(pathData);
          usedPaths.add(pathData);
          colorPathCount++;
        }
      });
    }
    
    if (colorPathCount > 0) {
      foundColors.push({ color, count: colorPathCount, method: 'fill' });
    }
  });
  
  regionPaths[regionId] = allPaths;
  colorStats[regionId] = {
    totalPaths: allPaths.length,
    foundColors: foundColors
  };
});

// Mostrar estatísticas
console.log('Estatísticas de extração recursiva por região:\n');
Object.keys(regionPaths).forEach(regionId => {
  const stats = colorStats[regionId];
  console.log(`${regionId.toUpperCase()}:`);
  console.log(`  Total de paths: ${stats.totalPaths}`);
  if (stats.foundColors.length > 0) {
    console.log(`  Cores encontradas:`);
    stats.foundColors.forEach(c => {
      console.log(`    ${c.color}: ${c.count} paths`);
    });
  }
  console.log('');
});

// Salvar resultado
const output = {
  regions: regionPaths,
  summary: Object.keys(regionPaths).map(id => ({
    id,
    pathCount: regionPaths[id].length,
    colors: colorStats[id].foundColors.map(c => c.color)
  }))
};

fs.writeFileSync(
  path.join(__dirname, '../src/data/svg-regions-paths.json'),
  JSON.stringify(output, null, 2)
);

console.log('Arquivo salvo em: src/data/svg-regions-paths.json');

