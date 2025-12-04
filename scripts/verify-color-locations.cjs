// Script para verificar onde cada cor aparece no SVG e qual região deveria ser
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Cores problemáticas
const problemColors = {
  'bonito': ['118DC2', '128EC1', '148DC1', '148EBF', '158FC0', '158FC2', '168EC1', '1A8EBE', '228FBC'],
  'vale-das-aguas': ['81C7CF', '81C7D1', '82C7CE', '82C7D0', '84C7D0', '84C8D0', '8FC4D6', '9CD5E3'],
  'caminhos-natureza': ['E0501C', 'E04E1A', 'E0511F', 'E39778', 'DA5527', 'DB5523', 'D49B9A', 'D69F9D', 'D79E9A']
};

console.log('\n=== VERIFICAÇÃO DE CORES NO SVG ===\n');

Object.entries(problemColors).forEach(([region, colors]) => {
  console.log(`\n${region.toUpperCase()}:`);
  colors.forEach(color => {
    const regex = new RegExp(`(?:stroke|fill)="#${color}"`, 'gi');
    const matches = svgContent.match(regex);
    const count = matches ? matches.length : 0;
    console.log(`  #${color}: ${count} ocorrências`);
  });
});

// Verificar se há grupos com fill que não estão sendo capturados
console.log('\n\n=== GRUPOS COM FILL (não stroke) ===\n');
const fillGroups = svgContent.match(/<g[^>]*fill="#([A-F0-9]{6})"[^>]*stroke="None"[^>]*>/gi);
if (fillGroups) {
  const fillColors = new Set();
  fillGroups.forEach(g => {
    const match = g.match(/fill="#([A-F0-9]{6})"/i);
    if (match) {
      fillColors.add(match[1].toUpperCase());
    }
  });
  console.log(`Cores encontradas apenas em fill: ${Array.from(fillColors).join(', ')}`);
} else {
  console.log('Nenhum grupo com apenas fill encontrado');
}


