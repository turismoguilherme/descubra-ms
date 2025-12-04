// Script para verificar quais cores foram extraídas e quais paths cada região tem
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const jsonPath = path.join(__dirname, '../src/data/svg-regions-paths.json');

const svgContent = fs.readFileSync(svgPath, 'utf-8');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Verificar cores esperadas vs cores encontradas
const expectedColors = {
  'caminhos-natureza-cone-sul': ['E0501C', 'E04E1A', 'E0511F', 'E39778', 'DA5527', 'DB5523', 'D4A488', 'D49B9A', 'D69F9D', 'D79E9A', 'D79F9A', 'D99A9C'],
  'bonito-serra-bodoquena': ['118DC2', '128EC1', '148DC1', '148EBF', '158FC0', '158FC2', '168EC1', '1A8EBE', '228FBC'],
  'vale-das-aguas': ['81C7CF', '81C7D1', '82C7CE', '82C7D0', '84C7D0', '84C8D0', '8FC4D6', '9CD5E3'],
  'celeiro-ms': ['BFB2C9', 'BEAFC9', 'CAA9B8', 'B5B4D4', 'B3B3D4', 'B3B3D2', 'B1B2D5', 'B1B2D4', 'B0B2D4', 'B2B4D6', 'C1C1BF', 'C2CAAF', 'CCC0A9']
};

console.log('\n=== VERIFICAÇÃO DE CORES NO SVG ===\n');

// Verificar quais cores esperadas existem no SVG
Object.entries(expectedColors).forEach(([regionId, colors]) => {
  console.log(`\n${regionId.toUpperCase()}:`);
  const foundInSvg = [];
  const notFound = [];
  
  colors.forEach(color => {
    const regex = new RegExp(`stroke="#${color}"`, 'i');
    if (regex.test(svgContent)) {
      foundInSvg.push(color);
    } else {
      notFound.push(color);
    }
  });
  
  console.log(`  ✅ Encontradas no SVG: ${foundInSvg.length}/${colors.length}`);
  if (foundInSvg.length > 0) {
    console.log(`     ${foundInSvg.join(', ')}`);
  }
  
  if (notFound.length > 0) {
    console.log(`  ❌ NÃO encontradas: ${notFound.join(', ')}`);
  }
  
  // Verificar quantos paths foram extraídos
  const extractedPaths = jsonData.regions[regionId] || [];
  console.log(`  📊 Paths extraídos: ${extractedPaths.length}`);
});

// Verificar todas as cores laranja/vermelho-laranja no SVG (começam com D ou E)
console.log('\n\n=== CORES LARANJA/VERMELHO-LARANJA NO SVG ===\n');
const orangeColors = svgContent.match(/stroke="#[DE][0-9A-F]{5}"/gi);
if (orangeColors) {
  const unique = [...new Set(orangeColors.map(c => c.match(/#([0-9A-F]{6})/i)[1].toUpperCase()))];
  const filtered = unique.filter(c => {
    const r = parseInt(c.substring(0, 2), 16);
    return r >= 208 && r <= 228; // Cores laranja/vermelho-laranja
  });
  console.log('Cores encontradas:', filtered.join(', '));
} else {
  console.log('Nenhuma cor laranja encontrada!');
}

// Verificar todas as cores rosa no SVG (começam com D4-D9)
console.log('\n\n=== CORES ROSA NO SVG ===\n');
const pinkColors = svgContent.match(/stroke="#D[4-9][0-9A-F]{4}"/gi);
if (pinkColors) {
  const unique = [...new Set(pinkColors.map(c => c.match(/#([0-9A-F]{6})/i)[1].toUpperCase()))];
  console.log('Cores encontradas:', unique.join(', '));
} else {
  console.log('Nenhuma cor rosa encontrada!');
}

// Verificar todas as cores azul no SVG
console.log('\n\n=== CORES AZUL NO SVG ===\n');
const blueColors = svgContent.match(/stroke="#[0-2][0-9A-F][0-9A-F][8-9A-C][C-E][0-3]"/gi);
if (blueColors) {
  const unique = [...new Set(blueColors.map(c => c.match(/#([0-9A-F]{6})/i)[1].toUpperCase()))];
  console.log('Cores encontradas:', unique.join(', '));
} else {
  console.log('Nenhuma cor azul encontrada!');
}

