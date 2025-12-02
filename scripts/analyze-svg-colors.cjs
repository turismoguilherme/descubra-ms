// Script para analisar cores do SVG e identificar quais cores pertencem a cada região
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Extrair todas as cores únicas do SVG
const colorRegex = /(?:fill|stroke)="#([0-9A-Fa-f]{6})"/g;
const colors = new Set();
let match;

while ((match = colorRegex.exec(svgContent)) !== null) {
  colors.add(match[1].toUpperCase());
}

console.log('Cores encontradas no SVG:');
console.log(Array.from(colors).sort().join('\n'));

// Agrupar cores similares (mesma base)
const colorGroups = {};
Array.from(colors).forEach(color => {
  // Agrupar por similaridade (primeiros 4 caracteres)
  const base = color.substring(0, 4);
  if (!colorGroups[base]) {
    colorGroups[base] = [];
  }
  colorGroups[base].push(color);
});

console.log('\n\nGrupos de cores similares:');
Object.keys(colorGroups).sort().forEach(base => {
  if (colorGroups[base].length > 1) {
    console.log(`${base}**: ${colorGroups[base].join(', ')}`);
  }
});

// Contar quantos paths cada cor tem
console.log('\n\nContagem de paths por cor:');
const colorCounts = {};
Array.from(colors).forEach(color => {
  const fillRegex = new RegExp(`fill="#${color}"`, 'gi');
  const strokeRegex = new RegExp(`stroke="#${color}"`, 'gi');
  const fillMatches = svgContent.match(fillRegex) || [];
  const strokeMatches = svgContent.match(strokeRegex) || [];
  colorCounts[color] = fillMatches.length + strokeMatches.length;
});

Object.keys(colorCounts)
  .sort((a, b) => colorCounts[b] - colorCounts[a])
  .forEach(color => {
    if (colorCounts[color] > 0) {
      console.log(`${color}: ${colorCounts[color]} ocorrências`);
    }
  });


