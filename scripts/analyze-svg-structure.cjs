// Script para analisar a estrutura do SVG e entender como as cores são aplicadas
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Analisar um grupo específico (Pantanal - amarelo)
const pantanalColor = 'D1B21B';
const groupRegex = new RegExp(`<g[^>]*stroke="#${pantanalColor}"[^>]*>([\\s\\S]*?)</g>`, 'i');
const match = svgContent.match(groupRegex);

if (match) {
  const groupContent = match[1];
  console.log('Estrutura do grupo Pantanal (amarelo D1B21B):\n');
  console.log('Primeiros 1000 caracteres do conteúdo:');
  console.log(groupContent.substring(0, 1000));
  console.log('\n\n');
  
  // Verificar se há paths com fill
  const pathsWithFill = groupContent.match(/<path[^>]*fill="[^"]*"[^>]*>/gi) || [];
  console.log(`Paths com fill: ${pathsWithFill.length}`);
  
  // Verificar paths com stroke
  const pathsWithStroke = groupContent.match(/<path[^>]*stroke="[^"]*"[^>]*>/gi) || [];
  console.log(`Paths com stroke: ${pathsWithStroke.length}`);
  
  // Verificar todos os paths
  const allPaths = groupContent.match(/<path[^>]*>/gi) || [];
  console.log(`Total de paths: ${allPaths.length}`);
  
  if (allPaths.length > 0) {
    console.log('\nPrimeiro path completo:');
    console.log(allPaths[0]);
  }
} else {
  console.log('Grupo não encontrado!');
}

// Verificar se há grupos com fill em vez de stroke
console.log('\n\nVerificando se há grupos com fill para as cores das regiões:\n');
const testColors = ['D1B21B', '84A24B', 'D84642', '76448E'];
testColors.forEach(color => {
  const fillGroupRegex = new RegExp(`<g[^>]*fill="#${color}"[^>]*>`, 'gi');
  const strokeGroupRegex = new RegExp(`<g[^>]*stroke="#${color}"[^>]*>`, 'gi');
  const fillMatches = svgContent.match(fillGroupRegex) || [];
  const strokeMatches = svgContent.match(strokeGroupRegex) || [];
  console.log(`${color}: fill=${fillMatches.length}, stroke=${strokeMatches.length}`);
});


