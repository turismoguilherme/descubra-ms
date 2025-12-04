// Script para remover definitivamente o path duplicado
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Path duplicado (normalizado)
const duplicatePathStart = "M 178.00 606.00";

// Remover do Celeiro do MS (deve ficar apenas no Pantanal)
if (jsonData.regions['celeiro-ms']) {
  const originalCount = jsonData.regions['celeiro-ms'].length;
  
  jsonData.regions['celeiro-ms'] = jsonData.regions['celeiro-ms'].filter(pathData => {
    const normalized = pathData.replace(/\s+/g, ' ').trim();
    return !normalized.startsWith(duplicatePathStart);
  });
  
  const removed = originalCount - jsonData.regions['celeiro-ms'].length;
  console.log(`✅ Removido ${removed} path(s) duplicado(s) do Celeiro do MS`);
  console.log(`   Paths restantes no Celeiro: ${jsonData.regions['celeiro-ms'].length}`);
}

// Atualizar metadata
jsonData.metadata.extractedAt = new Date().toISOString();
jsonData.metadata.totalPaths = Object.values(jsonData.regions).reduce((sum, paths) => sum + paths.length, 0);

// Atualizar summary
jsonData.summary = Object.keys(jsonData.regions).map(id => ({
  id,
  pathCount: jsonData.regions[id].length
}));

// Salvar
fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
console.log(`\n✅ JSON atualizado e salvo!`);
console.log(`📊 Total de paths: ${jsonData.metadata.totalPaths}`);

// Verificar se ainda há duplicatas
console.log(`\n🔍 Verificando duplicatas...`);
const pantanalPaths = new Set(jsonData.regions['pantanal'].map(p => p.replace(/\s+/g, ' ').trim()));
const celeiroPaths = new Set(jsonData.regions['celeiro-ms'].map(p => p.replace(/\s+/g, ' ').trim()));

const stillDuplicated = [...pantanalPaths].filter(p => celeiroPaths.has(p));
if (stillDuplicated.length > 0) {
  console.log(`⚠️  Ainda há ${stillDuplicated.length} path(s) duplicado(s)!`);
  stillDuplicated.forEach(p => console.log(`   ${p.substring(0, 60)}...`));
} else {
  console.log(`✅ Nenhuma duplicata encontrada!`);
}


