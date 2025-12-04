// Script para verificar coordenadas dos paths e identificar sobreposições
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/svg-regions-paths.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('\n=== ANÁLISE DE COORDENADAS DOS PATHS ===\n');

// Função para extrair coordenada inicial de um path
function getPathStart(pathData) {
  const cleaned = pathData.replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/M\s+([\d.]+)\s+([\d.]+)/);
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }
  return null;
}

// Analisar regiões problemáticas
const problematicRegions = ['bonito-serra-bodoquena', 'vale-das-aguas', 'celeiro-ms'];

problematicRegions.forEach(regionId => {
  const paths = jsonData.regions[regionId] || [];
  console.log(`\n${regionId.toUpperCase()} (${paths.length} paths):`);
  
  const coordinates = paths.map(p => getPathStart(p)).filter(c => c !== null);
  
  if (coordinates.length > 0) {
    const avgX = coordinates.reduce((sum, c) => sum + c.x, 0) / coordinates.length;
    const avgY = coordinates.reduce((sum, c) => sum + c.y, 0) / coordinates.length;
    const minX = Math.min(...coordinates.map(c => c.x));
    const maxX = Math.max(...coordinates.map(c => c.x));
    const minY = Math.min(...coordinates.map(c => c.y));
    const maxY = Math.max(...coordinates.map(c => c.y));
    
    console.log(`  Posição média: X=${avgX.toFixed(0)}, Y=${avgY.toFixed(0)}`);
    console.log(`  Área: X[${minX.toFixed(0)}-${maxX.toFixed(0)}], Y[${minY.toFixed(0)}-${maxY.toFixed(0)}]`);
    
    // Identificar região baseado na posição
    if (avgX < 300 && avgY > 600) {
      console.log(`  → Localização: OESTE/SUDOESTE (Bonito-Serra da Bodoquena)`);
    } else if (avgX > 500 && avgY > 600) {
      console.log(`  → Localização: SUDESTE (Vale das Águas)`);
    } else if (avgX > 300 && avgX < 500 && avgY > 400 && avgY < 700) {
      console.log(`  → Localização: CENTRO-SUL (Celeiro do MS)`);
    } else {
      console.log(`  → Localização: OUTRA`);
    }
  }
});

// Verificar se há sobreposição de coordenadas entre regiões
console.log('\n\n=== VERIFICAÇÃO DE SOBREPOSIÇÃO ===\n');

const bonitoPaths = (jsonData.regions['bonito-serra-bodoquena'] || []).map(p => getPathStart(p)).filter(c => c !== null);
const valePaths = (jsonData.regions['vale-das-aguas'] || []).map(p => getPathStart(p)).filter(c => c !== null);

// Verificar se há paths do Bonito na área do Vale
const bonitoInValeArea = bonitoPaths.filter(c => c.x > 500 && c.y > 600);
const valeInBonitoArea = valePaths.filter(c => c.x < 300 && c.y > 600);

if (bonitoInValeArea.length > 0) {
  console.log(`⚠️  ${bonitoInValeArea.length} paths do Bonito estão na área do Vale das Águas!`);
}

if (valeInBonitoArea.length > 0) {
  console.log(`⚠️  ${valeInBonitoArea.length} paths do Vale estão na área do Bonito!`);
}

if (bonitoInValeArea.length === 0 && valeInBonitoArea.length === 0) {
  console.log(`✅ Não há sobreposição aparente entre Bonito e Vale das Águas`);
}


