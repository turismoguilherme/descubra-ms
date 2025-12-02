// Script para criar um SVG de teste visualizando os paths extraídos
const fs = require('fs');
const path = require('path');

const svgRegionsPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
const regionsData = JSON.parse(fs.readFileSync(svgRegionsPath, 'utf-8'));

// Criar SVG de teste
let testSvg = `<svg viewBox="0 0 896 1152" xmlns="http://www.w3.org/2000/svg">
  <title>Paths Extraídos - Teste Visual</title>
`;

// Cores para cada região (para visualização)
const regionColors = {
  'pantanal': '#FFD700',
  'rota-cerrado-pantanal': '#90EE90',
  'costa-leste': '#FF4500',
  'campo-grande-ipes': '#9370DB',
  'bonito-serra-bodoquena': '#1E90FF',
  'caminhos-fronteira': '#8B4513',
  'vale-das-aguas': '#00CED1',
  'caminhos-natureza-cone-sul': '#FF69B4',
  'celeiro-ms': '#808080'
};

Object.keys(regionsData.regions).forEach(regionId => {
  const paths = regionsData.regions[regionId];
  const color = regionColors[regionId] || '#000000';
  
  testSvg += `  <!-- ${regionId.toUpperCase()} -->\n`;
  testSvg += `  <g fill="${color}" fill-opacity="0.5" stroke="${color}" stroke-width="2">\n`;
  
  paths.forEach((pathData, index) => {
    testSvg += `    <path d="${pathData}" />\n`;
  });
  
  testSvg += `  </g>\n\n`;
});

testSvg += '</svg>';

// Salvar SVG de teste
const testSvgPath = path.join(__dirname, '../public/images/test-extracted-paths.svg');
fs.writeFileSync(testSvgPath, testSvg);

console.log('SVG de teste criado em: public/images/test-extracted-paths.svg');
console.log('Abra este arquivo no navegador para ver se os paths correspondem às regiões coloridas.');


