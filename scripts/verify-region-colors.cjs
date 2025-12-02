// Script para verificar cores reais de cada região no SVG
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Cores que sabemos que existem
const knownColors = {
  'pantanal': ['D1B21B', 'D1B218', 'CFB11C', 'D2B31C', 'D1B21A'], // Amarelo
  'rota-cerrado-pantanal': ['84A24B', '84A148', '83A147', '83A049', '84A147', '86A155'], // Verde
  'costa-leste': ['D84642', 'DA4240', 'DA4340', 'DB4240', 'DB423F', 'DB413F', 'D94844'], // Vermelho forte
  'campo-grande-ipes': ['76448E', '75428E', '76428D', '76438D', '76448D', '77448E', '77448F', '75428C'], // Roxo
  'bonito-serra-bodoquena': ['118DC2', '128EC1', '148DC1', '148EBF', '158FC0', '158FC2', '168EC1', '1A8EBE', '228FBC'], // Azul marinho
  'caminhos-fronteira': ['DA5527', 'DB5523', 'E04E1A', 'E0501C', 'E0511F'], // Marrom
  'vale-das-aguas': ['81C7CF', '81C7D1', '82C7CE', '82C7D0', '84C7D0', '84C8D0', '8FC4D6', '9CD5E3'], // Azul forte/ciano
  'caminhos-natureza-cone-sul': ['D49B9A', 'D69F9D', 'D79E9A', 'D79F9A', 'D99A9C'], // Vermelho fraco
  'celeiro-ms': ['C1C1BF', 'C2CAAF', 'CCC0A9', 'C1E2E3', 'CED1DD'] // Cinza
};

console.log('Verificando quais cores realmente existem no SVG para cada região:\n');

Object.keys(knownColors).forEach(regionId => {
  const colors = knownColors[regionId];
  const foundColors = [];
  const notFoundColors = [];
  
  colors.forEach(color => {
    // Verificar fill
    const fillRegex = new RegExp(`fill="#${color}"`, 'gi');
    const strokeRegex = new RegExp(`stroke="#${color}"`, 'gi');
    const fillMatches = svgContent.match(fillRegex) || [];
    const strokeMatches = svgContent.match(strokeRegex) || [];
    
    if (fillMatches.length > 0 || strokeMatches.length > 0) {
      foundColors.push({
        color,
        fill: fillMatches.length,
        stroke: strokeMatches.length
      });
    } else {
      notFoundColors.push(color);
    }
  });
  
  console.log(`${regionId.toUpperCase()}:`);
  if (foundColors.length > 0) {
    console.log('  Cores encontradas:');
    foundColors.forEach(c => {
      console.log(`    ${c.color}: fill=${c.fill}, stroke=${c.stroke}`);
    });
  }
  if (notFoundColors.length > 0) {
    console.log('  Cores NÃO encontradas:', notFoundColors.join(', '));
  }
  console.log('');
});

// Verificar se há cores que aparecem em múltiplas regiões (sobreposição)
console.log('\n\nVerificando sobreposição de cores entre regiões:');
const allColors = {};
Object.keys(knownColors).forEach(regionId => {
  knownColors[regionId].forEach(color => {
    if (!allColors[color]) {
      allColors[color] = [];
    }
    allColors[color].push(regionId);
  });
});

const overlapping = Object.keys(allColors).filter(color => allColors[color].length > 1);
if (overlapping.length > 0) {
  console.log('Cores que aparecem em múltiplas regiões:');
  overlapping.forEach(color => {
    console.log(`  ${color}: ${allColors[color].join(', ')}`);
  });
} else {
  console.log('Nenhuma sobreposição de cores encontrada no mapeamento.');
}


