// Script para listar todas as cores do SVG com contagens
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Extrair todas as cores com fill
const fillRegex = /fill="#([0-9A-Fa-f]{6})"/gi;
const colors = new Map();
let match;

while ((match = fillRegex.exec(svgContent)) !== null) {
  const color = match[1].toUpperCase();
  colors.set(color, (colors.get(color) || 0) + 1);
}

// Ordenar por frequência (mais paths = provavelmente região maior)
const sortedColors = Array.from(colors.entries())
  .sort((a, b) => b[1] - a[1])
  .filter(([color, count]) => color !== '000000' && color !== 'F5F6F5' && color !== 'F8F9FB' && color !== 'F3F0D3');

console.log('Todas as cores do SVG ordenadas por número de ocorrências:\n');
console.log('(Cores com mais paths são provavelmente as regiões principais)\n');

sortedColors.forEach(([color, count], index) => {
  // Tentar identificar a cor
  let colorName = '';
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Classificação básica de cor
  if (r > 200 && g > 150 && b < 100) colorName = ' (Amarelo?)';
  else if (r < 150 && g > 150 && b < 150) colorName = ' (Verde?)';
  else if (r > 200 && g < 100 && b < 100) colorName = ' (Vermelho?)';
  else if (r < 150 && g < 150 && b > 150) colorName = ' (Azul?)';
  else if (r > 150 && g < 150 && b > 150) colorName = ' (Roxo?)';
  else if (r > 200 && g > 100 && b < 100) colorName = ' (Laranja?)';
  else if (r > 150 && g > 100 && b < 100) colorName = ' (Marrom?)';
  else if (r > 100 && r < 200 && g > 100 && g < 200 && b > 100 && b < 200) colorName = ' (Cinza?)';
  
  console.log(`${(index + 1).toString().padStart(3)}. #${color}: ${count} ocorrências${colorName}`);
});

console.log('\n\nTotal de cores únicas:', sortedColors.length);


