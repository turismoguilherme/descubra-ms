// Script para analisar quais cores o Celeiro do MS está capturando
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Cores que o Celeiro do MS está tentando capturar
const celeiroColors = [
  'BEAFC9', 'BFB2C9', 'CAA9B8', 'B5B4D4', 'B3B3D4', 'B3B3D2', 'B1B2D5', 'B1B2D4', 'B0B2D4', 'B2B4D6',
  'CDABB3', 'C6B6BA', 'BDB6BE', 'C6B2B4', 'CFBABB', 'CAB6B2', 'C1C1BF', 'B5C2CD', 'D3BCB2', 'C0BCB1',
  'BFB9AD', 'BFB8AC', 'CFB9A9', 'BCB8AB', 'AAC4CD', 'CED1DD', 'CCC0A9', 'CCAF9B', 'DAB8A1', 'C2CAAF',
  'A7B2A7', 'D6C7A8', 'C2CDAF', 'D1DAB9', 'D3DBB9', 'C1E2E3', 'E2E9EB', 'D9CF8F', 'E4DE9A'
];

console.log('\n=== ANÁLISE DE CORES DO CELEIRO DO MS ===\n');

const foundColors = [];
const notFoundColors = [];

celeiroColors.forEach(color => {
  const regex = new RegExp(`(?:stroke|fill)="#${color}"`, 'gi');
  const matches = svgContent.match(regex);
  const count = matches ? matches.length : 0;
  
  if (count > 0) {
    foundColors.push({ color, count });
  } else {
    notFoundColors.push(color);
  }
});

console.log(`✅ Cores encontradas no SVG (${foundColors.length}):`);
foundColors.forEach(({ color, count }) => {
  console.log(`  #${color}: ${count} ocorrências`);
});

if (notFoundColors.length > 0) {
  console.log(`\n❌ Cores NÃO encontradas no SVG (${notFoundColors.length}):`);
  notFoundColors.forEach(color => {
    console.log(`  #${color}`);
  });
}

// Verificar se alguma dessas cores está sendo usada por outras regiões
console.log('\n\n=== VERIFICAÇÃO DE CONFLITOS ===\n');
const otherRegionColors = {
  'caminhos-natureza-cone-sul': ['D49B9A', 'D69F9D', 'D79E9A', 'D79F9A', 'D99A9C', 'CDABB3', 'C6B2B4', 'CFBABB', 'CAB6B2'],
  'pantanal': ['D1B21B', 'D1B218', 'CFB11C', 'D2B31C', 'D1B21A', 'DACC7A', 'E2D78E', 'D9CF8F']
};

Object.entries(otherRegionColors).forEach(([region, colors]) => {
  const conflicts = celeiroColors.filter(c => colors.includes(c));
  if (conflicts.length > 0) {
    console.log(`⚠️  CONFLITO: Celeiro do MS e ${region} compartilham cores:`);
    conflicts.forEach(c => console.log(`    #${c}`));
  }
});


