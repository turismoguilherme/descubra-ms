// Script para limpar paths do JSON (remover quebras de linha e espaços extras)
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Limpar todos os paths
Object.keys(data.regions).forEach(regionId => {
  data.regions[regionId] = data.regions[regionId].map(pathStr => {
    // Remover quebras de linha, tabs e espaços múltiplos
    // Manter apenas espaços simples entre comandos
    return pathStr
      .replace(/\n/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  });
});

// Salvar JSON limpo
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

console.log('✅ Paths limpos e salvos!');
console.log(`📊 Total de regiões: ${Object.keys(data.regions).length}`);
Object.keys(data.regions).forEach(regionId => {
  console.log(`  - ${regionId}: ${data.regions[regionId].length} paths`);
});

