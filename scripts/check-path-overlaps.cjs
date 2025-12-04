// Script para verificar se há paths duplicados ou sobrepostos entre regiões
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('\n=== VERIFICAÇÃO DE PATHS POR REGIÃO ===\n');

const allPaths = {};
const pathToRegions = {};

// Coletar todos os paths e verificar duplicatas
Object.entries(jsonData.regions).forEach(([regionId, paths]) => {
  console.log(`${regionId}: ${paths.length} paths`);
  
  paths.forEach((pathData, index) => {
    // Normalizar path (remover espaços extras e quebras de linha)
    const normalized = pathData.replace(/\s+/g, ' ').trim();
    
    if (!allPaths[normalized]) {
      allPaths[normalized] = [];
    }
    allPaths[normalized].push({ regionId, index });
    
    if (!pathToRegions[normalized]) {
      pathToRegions[normalized] = new Set();
    }
    pathToRegions[normalized].add(regionId);
  });
});

// Verificar paths duplicados (mesmo path em múltiplas regiões)
console.log('\n=== PATHS DUPLICADOS (mesmo path em múltiplas regiões) ===\n');
const duplicates = Object.entries(pathToRegions).filter(([path, regions]) => regions.size > 1);

if (duplicates.length > 0) {
  console.log(`⚠️  Encontrados ${duplicates.length} paths duplicados:\n`);
  duplicates.slice(0, 10).forEach(([pathData, regions]) => {
    console.log(`Path em ${regions.size} regiões: ${Array.from(regions).join(', ')}`);
    console.log(`  Path: ${pathData.substring(0, 100)}...\n`);
  });
} else {
  console.log('✅ Nenhum path duplicado encontrado');
}

// Verificar regiões problemáticas
console.log('\n=== ANÁLISE DE REGIÕES PROBLEMÁTICAS ===\n');
const problematicRegions = ['celeiro-ms', 'caminhos-natureza-cone-sul', 'bonito-serra-bodoquena', 'vale-das-aguas'];

problematicRegions.forEach(regionId => {
  const paths = jsonData.regions[regionId] || [];
  console.log(`\n${regionId}:`);
  console.log(`  Total de paths: ${paths.length}`);
  
  // Verificar se algum path está em outra região
  const sharedPaths = paths.filter(pathData => {
    const normalized = pathData.replace(/\s+/g, ' ').trim();
    return pathToRegions[normalized] && pathToRegions[normalized].size > 1;
  });
  
  if (sharedPaths.length > 0) {
    console.log(`  ⚠️  ${sharedPaths.length} paths compartilhados com outras regiões`);
  } else {
    console.log(`  ✅ Todos os paths são únicos`);
  }
});


