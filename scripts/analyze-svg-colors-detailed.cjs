// Script detalhado para analisar cores do SVG e identificar problemas
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Extrair todos os grupos com stroke (que define a cor da região)
const groupRegex = /<g[^>]*stroke="#([0-9A-Fa-f]{6})"[^>]*>([\s\S]*?)<\/g>/gi;
const pathsByColor = {};
let match;

// Analisar cada grupo
while ((match = groupRegex.exec(svgContent)) !== null) {
  const strokeColor = match[1].toUpperCase();
  const groupContent = match[2];
  
  // Extrair paths deste grupo
  const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/gi;
  const paths = [];
  let pathMatch;
  
  while ((pathMatch = pathRegex.exec(groupContent)) !== null) {
    const pathData = pathMatch[1].trim();
    if (pathData && pathData.length > 10) { // Filtrar paths muito pequenos
      paths.push(pathData);
    }
  }
  
  if (paths.length > 0) {
    if (!pathsByColor[strokeColor]) {
      pathsByColor[strokeColor] = {
        paths: [],
        groups: 0
      };
    }
    pathsByColor[strokeColor].paths.push(...paths);
    pathsByColor[strokeColor].groups += 1;
  }
}

// Filtrar cores de fundo/borda (preto, branco, etc)
const backgroundColors = ['000000', 'F5F6F5', 'F8F9FB', 'F3F0D3'];
const filteredColors = Object.keys(pathsByColor).filter(color => !backgroundColors.includes(color));

// Estatísticas
console.log('\n=== ANÁLISE DETALHADA DAS CORES DO SVG ===\n');
console.log(`Total de cores únicas encontradas: ${filteredColors.length}\n`);

// Ordenar por número de paths
const sortedColors = filteredColors
  .map(color => ({
    color,
    pathCount: pathsByColor[color].paths.length,
    groupCount: pathsByColor[color].groups
  }))
  .sort((a, b) => b.pathCount - a.pathCount);

console.log('Cores ordenadas por número de paths:\n');
sortedColors.forEach(({ color, pathCount, groupCount }) => {
  console.log(`#${color}: ${pathCount} paths em ${groupCount} grupos`);
});

// Identificar cores por família baseado nas cores esperadas
console.log('\n\n=== IDENTIFICAÇÃO POR REGIÃO (baseado nas cores esperadas) ===\n');

// Cores esperadas baseadas na descrição do usuário
const expectedRegions = {
  'pantanal': {
    name: 'Pantanal',
    expectedColor: '#FFCA28', // Amarelo-mostarda
    foundColors: []
  },
  'rota-cerrado-pantanal': {
    name: 'Rota Cerrado Pantanal',
    expectedColor: '#66BB6A', // Verde
    foundColors: []
  },
  'costa-leste': {
    name: 'Costa Leste',
    expectedColor: '#EF5350', // Vermelho
    foundColors: []
  },
  'campo-grande-ipes': {
    name: 'Campo Grande dos Ipês',
    expectedColor: '#7E57C2', // Roxo
    foundColors: []
  },
  'bonito-serra-bodoquena': {
    name: 'Bonito-Serra da Bodoquena',
    expectedColor: '#4FC3F7', // Azul-claro
    foundColors: []
  },
  'caminhos-fronteira': {
    name: 'Caminhos da Fronteira',
    expectedColor: '#8D6E63', // Marrom
    foundColors: []
  },
  'vale-das-aguas': {
    name: 'Vale das Águas',
    expectedColor: '#42A5F5', // Azul
    foundColors: []
  },
  'caminhos-natureza-cone-sul': {
    name: 'Caminhos da Natureza-Cone Sul',
    expectedColor: '#FF9800', // Laranja
    foundColors: []
  },
  'celeiro-ms': {
    name: 'Celeiro do MS',
    expectedColor: '#CE93D8', // Lilás
    foundColors: []
  }
};

// Função para calcular distância entre cores (RGB)
function colorDistance(color1, color2) {
  const r1 = parseInt(color1.substring(0, 2), 16);
  const g1 = parseInt(color1.substring(2, 4), 16);
  const b1 = parseInt(color1.substring(4, 6), 16);
  
  const r2 = parseInt(color2.substring(0, 2), 16);
  const g2 = parseInt(color2.substring(2, 4), 16);
  const b2 = parseInt(color2.substring(4, 6), 16);
  
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + 
    Math.pow(g1 - g2, 2) + 
    Math.pow(b1 - b2, 2)
  );
}

// Mapear cores encontradas para regiões esperadas
sortedColors.forEach(({ color }) => {
  let bestMatch = null;
  let bestDistance = Infinity;
  let bestRegion = null;
  
  Object.entries(expectedRegions).forEach(([regionId, region]) => {
    const expectedColor = region.expectedColor.replace('#', '');
    const distance = colorDistance(color, expectedColor);
    
    if (distance < bestDistance && distance < 100) { // Threshold de 100
      bestDistance = distance;
      bestMatch = color;
      bestRegion = regionId;
    }
  });
  
  if (bestMatch && bestRegion) {
    expectedRegions[bestRegion].foundColors.push({
      color: bestMatch,
      pathCount: pathsByColor[bestMatch].paths.length,
      distance: bestDistance
    });
  }
});

// Mostrar resultados
Object.entries(expectedRegions).forEach(([regionId, region]) => {
  console.log(`\n${region.name} (esperado: ${region.expectedColor}):`);
  if (region.foundColors.length > 0) {
    region.foundColors
      .sort((a, b) => a.distance - b.distance)
      .forEach(({ color, pathCount, distance }) => {
        console.log(`  #${color}: ${pathCount} paths (distância: ${distance.toFixed(1)})`);
      });
  } else {
    console.log(`  ❌ Nenhuma cor próxima encontrada!`);
  }
});

// Mostrar cores não mapeadas
console.log('\n\n=== CORES NÃO MAPEADAS (podem ser variações ou áreas de fundo) ===\n');
const mappedColors = new Set();
Object.values(expectedRegions).forEach(region => {
  region.foundColors.forEach(({ color }) => mappedColors.add(color));
});

const unmappedColors = sortedColors
  .filter(({ color }) => !mappedColors.has(color))
  .slice(0, 20); // Mostrar apenas as 20 primeiras

unmappedColors.forEach(({ color, pathCount }) => {
  console.log(`#${color}: ${pathCount} paths`);
});

// Salvar resultado para análise
const output = {
  allColors: sortedColors,
  regions: Object.fromEntries(
    Object.entries(expectedRegions).map(([id, region]) => [
      id,
      {
        name: region.name,
        expectedColor: region.expectedColor,
        foundColors: region.foundColors
      }
    ])
  ),
  unmappedColors: unmappedColors.map(({ color, pathCount }) => ({ color, pathCount }))
};

const outputPath = path.join(__dirname, '../scripts/color-analysis-result.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`\n\n✅ Análise salva em: ${outputPath}`);
