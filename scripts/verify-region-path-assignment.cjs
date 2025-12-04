// Script para verificar se os paths estão sendo atribuídos às regiões corretas
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');
const jsonPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('\n=== VERIFICAÇÃO DE ATRIBUIÇÃO DE PATHS ===\n');

// Mapeamento de cores
const colorMapping = {
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

// Verificar se há cores sobrepostas entre regiões
console.log('Verificando sobreposição de cores entre regiões:\n');
const colorToRegions = {};

Object.entries(colorMapping).forEach(([regionId, colors]) => {
  colors.forEach(color => {
    const normalizedColor = color.toUpperCase();
    if (!colorToRegions[normalizedColor]) {
      colorToRegions[normalizedColor] = [];
    }
    if (!colorToRegions[normalizedColor].includes(regionId)) {
      colorToRegions[normalizedColor].push(regionId);
    }
  });
});

const overlappingColors = Object.entries(colorToRegions).filter(([color, regions]) => regions.length > 1);

if (overlappingColors.length > 0) {
  console.log(`⚠️  Encontradas ${overlappingColors.length} cores compartilhadas entre múltiplas regiões:\n`);
  overlappingColors.forEach(([color, regions]) => {
    console.log(`  #${color}: ${regions.join(', ')}`);
  });
} else {
  console.log('✅ Nenhuma cor compartilhada entre regiões');
}

// Verificar paths por região
console.log('\n\nPaths por região:');
Object.entries(jsonData.regions).forEach(([regionId, paths]) => {
  console.log(`  ${regionId}: ${paths.length} paths`);
});

// Verificar se há cores de "Caminhos da Natureza" que podem estar sendo capturadas por "Costa Leste"
console.log('\n\nVerificando possível conflito entre Caminhos da Natureza e Costa Leste:');
const caminhosColors = colorMapping['caminhos-natureza-cone-sul'].map(c => c.toUpperCase());
const costaLesteColors = colorMapping['costa-leste'].map(c => c.toUpperCase());

const sharedColors = caminhosColors.filter(c => costaLesteColors.includes(c));
if (sharedColors.length > 0) {
  console.log(`  ⚠️  Cores compartilhadas: ${sharedColors.join(', ')}`);
} else {
  console.log('  ✅ Nenhuma cor compartilhada');
}

// Verificar se há cores de "Celeiro" que podem estar sendo capturadas por outras regiões
console.log('\n\nVerificando possível conflito entre Celeiro e outras regiões:');
const celeiroColors = colorMapping['celeiro-ms'].map(c => c.toUpperCase());

Object.entries(colorMapping).forEach(([regionId, colors]) => {
  if (regionId === 'celeiro-ms') return;
  const regionColors = colors.map(c => c.toUpperCase());
  const shared = celeiroColors.filter(c => regionColors.includes(c));
  if (shared.length > 0) {
    console.log(`  ⚠️  Celeiro compartilha ${shared.length} cores com ${regionId}: ${shared.slice(0, 3).join(', ')}${shared.length > 3 ? '...' : ''}`);
  }
});


