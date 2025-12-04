// Script para verificar paths duplicados entre regiões específicas
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('\n=== VERIFICAÇÃO DE PATHS DUPLICADOS ENTRE REGIÕES ESPECÍFICAS ===\n');

// Regiões problemáticas mencionadas pelo usuário
const problematicRegions = {
  'caminhos-natureza-cone-sul': ['costa-leste'],
  'celeiro-ms': ['rota-cerrado-pantanal', 'campo-grande-ipes', 'caminhos-fronteira', 'bonito-serra-bodoquena', 'pantanal'],
  'bonito-serra-bodoquena': ['vale-das-aguas']
};

// Função para normalizar paths (remover espaços extras)
function normalizePath(pathData) {
  return pathData.replace(/\s+/g, ' ').trim();
}

// Coletar todos os paths normalizados por região
const regionPathsNormalized = {};
Object.entries(jsonData.regions).forEach(([regionId, paths]) => {
  regionPathsNormalized[regionId] = paths.map(p => normalizePath(p));
});

// Verificar overlaps
Object.entries(problematicRegions).forEach(([sourceRegion, targetRegions]) => {
  console.log(`\n🔍 Verificando: ${sourceRegion}`);
  console.log(`   Clica em: ${sourceRegion}`);
  console.log(`   Mas destaca: ${targetRegions.join(', ')}`);
  
  const sourcePaths = regionPathsNormalized[sourceRegion] || [];
  console.log(`   Total de paths em ${sourceRegion}: ${sourcePaths.length}`);
  
  if (sourcePaths.length === 0) {
    console.log(`   ⚠️  ${sourceRegion} não tem paths!`);
    return;
  }
  
  targetRegions.forEach(targetRegion => {
    const targetPaths = regionPathsNormalized[targetRegion] || [];
    console.log(`\n   Comparando com: ${targetRegion} (${targetPaths.length} paths)`);
    
    // Encontrar paths em comum
    const commonPaths = sourcePaths.filter(sp => targetPaths.includes(sp));
    
    if (commonPaths.length > 0) {
      console.log(`   ⚠️  ENCONTRADOS ${commonPaths.length} PATHS DUPLICADOS!`);
      commonPaths.slice(0, 3).forEach((p, idx) => {
        console.log(`      ${idx + 1}. ${p.substring(0, 80)}...`);
      });
    } else {
      console.log(`   ✅ Nenhum path duplicado`);
    }
  });
});

// Verificar também se há paths que aparecem em múltiplas regiões
console.log('\n\n=== VERIFICAÇÃO GERAL DE PATHS DUPLICADOS ===\n');
const pathToRegions = {};
Object.entries(regionPathsNormalized).forEach(([regionId, paths]) => {
  paths.forEach(pathData => {
    if (!pathToRegions[pathData]) {
      pathToRegions[pathData] = [];
    }
    if (!pathToRegions[pathData].includes(regionId)) {
      pathToRegions[pathData].push(regionId);
    }
  });
});

const duplicates = Object.entries(pathToRegions).filter(([path, regions]) => regions.length > 1);

if (duplicates.length > 0) {
  console.log(`⚠️  Encontrados ${duplicates.length} paths que aparecem em múltiplas regiões:\n`);
  
  // Agrupar por combinação de regiões
  const duplicatesByRegions = {};
  duplicates.forEach(([pathData, regions]) => {
    const key = regions.sort().join(' + ');
    if (!duplicatesByRegions[key]) {
      duplicatesByRegions[key] = [];
    }
    duplicatesByRegions[key].push(pathData);
  });
  
  Object.entries(duplicatesByRegions).forEach(([regions, paths]) => {
    console.log(`   ${regions}: ${paths.length} paths duplicados`);
  });
} else {
  console.log('✅ Nenhum path duplicado encontrado');
}


