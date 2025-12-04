// Script para analisar quais cores estão realmente no SVG e verificar o mapeamento
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

console.log('\n=== ANÁLISE DE CORES NO SVG ===\n');

// Extrair todas as cores únicas do SVG (stroke e fill)
const strokeColors = new Set();
const fillColors = new Set();

// Regex para encontrar cores em stroke
const strokeRegex = /stroke="#([A-F0-9]{6})"/gi;
let match;
while ((match = strokeRegex.exec(svgContent)) !== null) {
  const color = match[1].toUpperCase();
  if (color !== 'NONE' && color !== 'FFFFFF') {
    strokeColors.add(color);
  }
}

// Regex para encontrar cores em fill
const fillRegex = /fill="#([A-F0-9]{6})"/gi;
while ((match = fillRegex.exec(svgContent)) !== null) {
  const color = match[1].toUpperCase();
  if (color !== 'NONE' && color !== 'FFFFFF') {
    fillColors.add(color);
  }
}

console.log(`Cores encontradas no SVG:`);
console.log(`  Stroke: ${strokeColors.size} cores únicas`);
console.log(`  Fill: ${fillColors.size} cores únicas\n`);

// Mapeamento atual
const currentMapping = {
  'pantanal': ['D1B21B', 'D1B218', 'CFB11C', 'D2B31C', 'D1B21A', 'DACC7A', 'E2D78E', 'D9CF8F'],
  'rota-cerrado-pantanal': ['84A24B', '84A148', '83A147', '83A049', '84A147', '86A155', '83A148'],
  'costa-leste': ['D84642', 'DA4240', 'DA4340', 'DB4240', 'DB423F', 'DB413F', 'D94844'],
  'campo-grande-ipes': ['76448E', '75428E', '76428D', '76438D', '76448D', '77448E', '77448F', '75428C', '76428E'],
  'bonito-serra-bodoquena': ['81C7CF', '81C7D1', '82C7CE', '82C7D0', '84C7D0', '84C8D0', '8FC4D6', '9CD5E3'],
  'caminhos-fronteira': ['77694D', '786C4F', '76684C', '776A4D', '776D4F', '776B4E', '77694C', '7A6C4F'],
  'vale-das-aguas': ['118DC2', '128EC1', '148DC1', '148EBF', '158FC0', '158FC2', '168EC1', '1A8EBE', '228FBC'],
  'caminhos-natureza-cone-sul': [
    'E0501C', 'E04E1A', 'E0511F', 'E39778', 'DA5527', 'DB5523', 'D4A488',
    'D49B9A', 'D69F9D', 'D79E9A', 'D79F9A', 'D99A9C', 'CDABB3', 'C6B2B4', 'CFBABB', 'CAB6B2'
  ],
  'celeiro-ms': [
    'BFB2C9', 'BEAFC9', 'CAA9B8', 'B5B4D4', 'B3B3D4', 'B3B3D2', 'B1B2D5', 'B1B2D4', 'B0B2D4', 'B2B4D6',
    'C1C1BF', 'C2CAAF', 'CCC0A9', 'C1E2E3', 'CED1DD', 'D3BCB2', 'CFB9A9', 'D6C7A8',
    'C6B6BA', 'BDB6BE', 'B5C2CD', 'C0BCB1', 'BFB9AD', 'BFB8AC', 'BCB8AB', 'AAC4CD', 'A7B2A7',
    'C2CDAF', 'D1DAB9', 'D3DBB9', 'E2E9EB', 'D9CF8F', 'E4DE9A', 'CCAF9B', 'DAB8A1'
  ]
};

// Verificar quais cores do mapeamento existem no SVG
console.log('Verificando quais cores do mapeamento existem no SVG:\n');
const allColors = new Set([...strokeColors, ...fillColors]);

Object.entries(currentMapping).forEach(([regionId, colors]) => {
  const foundColors = colors.filter(c => allColors.has(c.toUpperCase()));
  const missingColors = colors.filter(c => !allColors.has(c.toUpperCase()));
  
  console.log(`${regionId}:`);
  console.log(`  ✅ Encontradas: ${foundColors.length}/${colors.length} cores`);
  if (missingColors.length > 0) {
    console.log(`  ⚠️  Não encontradas: ${missingColors.slice(0, 5).join(', ')}${missingColors.length > 5 ? '...' : ''}`);
  }
});

// Verificar cores no SVG que não estão no mapeamento
console.log('\n\nCores no SVG que não estão mapeadas para nenhuma região:');
const mappedColors = new Set();
Object.values(currentMapping).forEach(colors => {
  colors.forEach(c => mappedColors.add(c.toUpperCase()));
});

const unmappedColors = Array.from(allColors).filter(c => !mappedColors.has(c));
if (unmappedColors.length > 0) {
  console.log(`  ${unmappedColors.length} cores não mapeadas:`);
  unmappedColors.slice(0, 20).forEach(c => console.log(`    #${c}`));
  if (unmappedColors.length > 20) {
    console.log(`    ... e mais ${unmappedColors.length - 20} cores`);
  }
} else {
  console.log('  ✅ Todas as cores estão mapeadas');
}


