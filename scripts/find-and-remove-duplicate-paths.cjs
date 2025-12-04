// Script para encontrar e remover paths duplicados entre regiões
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('\n=== ENCONTRANDO E REMOVENDO PATHS DUPLICADOS ===\n');

// Função para normalizar paths
function normalizePath(pathData) {
  return pathData.replace(/\s+/g, ' ').trim();
}

// Coletar todos os paths normalizados por região
const regionPathsNormalized = {};
const pathToRegions = {};

Object.entries(jsonData.regions).forEach(([regionId, paths]) => {
  regionPathsNormalized[regionId] = paths.map(p => normalizePath(p));
  
  // Rastrear quais regiões têm cada path
  regionPathsNormalized[regionId].forEach(pathData => {
    if (!pathToRegions[pathData]) {
      pathToRegions[pathData] = [];
    }
    if (!pathToRegions[pathData].includes(regionId)) {
      pathToRegions[pathData].push(regionId);
    }
  });
});

// Encontrar paths duplicados
const duplicatePaths = Object.entries(pathToRegions).filter(([path, regions]) => regions.length > 1);

console.log(`Encontrados ${duplicatePaths.length} paths que aparecem em múltiplas regiões\n`);

// Estratégia: remover paths duplicados da região que tem MENOS paths
// (assumindo que a região com mais paths é a "principal")
const regionsPathCounts = {};
Object.entries(regionPathsNormalized).forEach(([regionId, paths]) => {
  regionsPathCounts[regionId] = paths.length;
});

// Para cada path duplicado, decidir de qual região removê-lo
const pathsToRemove = {};
duplicatePaths.forEach(([pathData, regions]) => {
  // Ordenar regiões por número de paths (menor primeiro)
  const sortedRegions = regions.sort((a, b) => regionsPathCounts[a] - regionsPathCounts[b]);
  
  // Remover da(s) região(ões) com menos paths, mantendo apenas na região com mais paths
  const keepInRegion = sortedRegions[sortedRegions.length - 1];
  
  sortedRegions.slice(0, -1).forEach(regionId => {
    if (!pathsToRemove[regionId]) {
      pathsToRemove[regionId] = [];
    }
    pathsToRemove[regionId].push(pathData);
  });
  
  console.log(`Path duplicado encontrado em: ${regions.join(', ')}`);
  console.log(`  Mantendo em: ${keepInRegion}, removendo de: ${sortedRegions.slice(0, -1).join(', ')}`);
});

// Remover paths duplicados
const cleanedRegions = {};
Object.entries(jsonData.regions).forEach(([regionId, paths]) => {
  const pathsToRemoveFromRegion = pathsToRemove[regionId] || [];
  const pathsToRemoveNormalized = pathsToRemoveFromRegion.map(p => normalizePath(p));
  
  cleanedRegions[regionId] = paths.filter(p => {
    const normalized = normalizePath(p);
    return !pathsToRemoveNormalized.includes(normalized);
  });
  
  if (pathsToRemoveFromRegion.length > 0) {
    console.log(`\n${regionId}: removidos ${pathsToRemoveFromRegion.length} paths duplicados`);
    console.log(`  Antes: ${paths.length} paths, Depois: ${cleanedRegions[regionId].length} paths`);
  }
});

// Salvar resultado
const output = {
  regions: cleanedRegions,
  metadata: {
    extractedAt: new Date().toISOString(),
    totalRegions: Object.keys(cleanedRegions).length,
    totalPaths: Object.values(cleanedRegions).reduce((sum, paths) => sum + paths.length, 0),
    removedDuplicates: duplicatePaths.length
  },
  summary: Object.keys(cleanedRegions).map(id => ({
    id,
    pathCount: cleanedRegions[id].length
  }))
};

const outputPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✅ Arquivo atualizado: ${outputPath}`);
console.log(`📊 Total de paths após limpeza: ${output.metadata.totalPaths}`);
console.log(`🗑️  Paths duplicados removidos: ${duplicatePaths.length}`);


