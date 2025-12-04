// Script para debugar problemas com paths das regiões
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('\n=== DEBUG DE PATHS POR REGIÃO ===\n');

const problematicRegions = ['celeiro-ms', 'caminhos-natureza-cone-sul', 'bonito-serra-bodoquena', 'vale-das-aguas'];

problematicRegions.forEach(regionId => {
  const paths = jsonData.regions[regionId] || [];
  console.log(`\n${regionId.toUpperCase()}:`);
  console.log(`  Total de paths: ${paths.length}`);
  
  if (paths.length === 0) {
    console.log(`  ❌ ERRO: Nenhum path encontrado!`);
  } else {
    // Mostrar primeiros 3 paths como exemplo
    console.log(`  Primeiros paths:`);
    paths.slice(0, 3).forEach((p, i) => {
      const cleaned = p.replace(/\s+/g, ' ').trim();
      console.log(`    ${i + 1}. ${cleaned.substring(0, 80)}...`);
    });
    
    // Verificar se há paths com quebras de linha
    const pathsWithNewlines = paths.filter(p => p.includes('\n'));
    if (pathsWithNewlines.length > 0) {
      console.log(`  ⚠️  ${pathsWithNewlines.length} paths têm quebras de linha (serão limpos no componente)`);
    }
  }
});

// Verificar se há paths vazios ou muito pequenos
console.log('\n\n=== VERIFICAÇÃO DE PATHS INVÁLIDOS ===\n');
Object.entries(jsonData.regions).forEach(([regionId, paths]) => {
  const invalidPaths = paths.filter(p => {
    const cleaned = p.replace(/\s+/g, ' ').trim();
    return !cleaned || cleaned.length < 10;
  });
  
  if (invalidPaths.length > 0) {
    console.log(`${regionId}: ${invalidPaths.length} paths inválidos`);
  }
});


