// Script para remover paths duplicados e ajustar o JSON
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Path duplicado encontrado
const duplicatePath = "M 178.00 606.00";

// Remover do Celeiro do MS (deve ficar apenas no Pantanal)
if (jsonData.regions['celeiro-ms']) {
  jsonData.regions['celeiro-ms'] = jsonData.regions['celeiro-ms'].filter(pathData => {
    const normalized = pathData.replace(/\s+/g, ' ').trim();
    return !normalized.startsWith(duplicatePath);
  });
  
  console.log(`✅ Removido path duplicado do Celeiro do MS`);
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


