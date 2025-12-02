// Verificar se os paths herdam fill do grupo ou têm fill próprio
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Verificar um grupo específico
const testColor = 'D1B21B'; // Pantanal amarelo
const groupRegex = new RegExp(`<g[^>]*fill="#${testColor}"[^>]*>([\\s\\S]*?)</g>`, 'i');
const match = svgContent.match(groupRegex);

if (match) {
  const groupContent = match[1];
  console.log('Grupo com FILL encontrado!');
  console.log('Atributos do grupo:');
  const groupTag = svgContent.substring(match.index, match.index + 200);
  console.log(groupTag);
  console.log('\n');
  
  // Verificar paths dentro
  const paths = groupContent.match(/<path[^>]*>/gi) || [];
  console.log(`Paths encontrados: ${paths.length}`);
  if (paths.length > 0) {
    console.log('\nPrimeiro path:');
    console.log(paths[0]);
    console.log('\nAtributos do path:');
    const pathAttrs = paths[0].match(/(fill|stroke)="[^"]*"/gi) || [];
    console.log(pathAttrs);
  }
} else {
  console.log('Grupo com FILL não encontrado, verificando STROKE...');
  const strokeGroupRegex = new RegExp(`<g[^>]*stroke="#${testColor}"[^>]*>([\\s\\S]*?)</g>`, 'i');
  const strokeMatch = svgContent.match(strokeGroupRegex);
  if (strokeMatch) {
    console.log('Grupo com STROKE encontrado!');
    const groupTag = svgContent.substring(strokeMatch.index, strokeMatch.index + 300);
    console.log('Atributos do grupo:');
    console.log(groupTag);
    
    // Verificar se o grupo tem fill também
    if (groupTag.includes('fill=')) {
      console.log('\n⚠️ O grupo tem TANTO fill QUANTO stroke!');
      const fillMatch = groupTag.match(/fill="([^"]*)"/i);
      if (fillMatch) {
        console.log(`Fill do grupo: ${fillMatch[1]}`);
      }
    }
  }
}

// Verificar se há grupos que têm fill E stroke com a mesma cor
console.log('\n\nVerificando grupos que têm fill E stroke com a mesma cor:\n');
const testColors = ['D1B21B', '84A24B', '76448E', '118DC2'];
testColors.forEach(color => {
  const bothRegex = new RegExp(`<g[^>]*fill="#${color}"[^>]*stroke="#${color}"[^>]*>`, 'gi');
  const matches = svgContent.match(bothRegex) || [];
  console.log(`${color}: ${matches.length} grupos com fill E stroke`);
});


