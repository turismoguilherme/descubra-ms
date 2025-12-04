// Script para encontrar exatamente onde cada cor aparece no SVG e qual região deveria ser
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Cores azul-marinho (Bonito) vs azul ciano (Vale das Águas)
const blueColors = {
  'azul-marinho-bonito': ['118DC2', '128EC1', '148DC1', '148EBF', '158FC0', '158FC2', '168EC1', '1A8EBE', '228FBC'],
  'azul-ciano-vale': ['81C7CF', '81C7D1', '82C7CE', '82C7D0', '84C7D0', '84C8D0', '8FC4D6', '9CD5E3']
};

console.log('\n=== ANÁLISE DETALHADA DAS CORES AZUIS ===\n');

// Encontrar todos os grupos com essas cores e extrair coordenadas aproximadas dos paths
Object.entries(blueColors).forEach(([tipo, colors]) => {
  console.log(`\n${tipo.toUpperCase()}:`);
  
  colors.forEach(color => {
    // Buscar grupos com essa cor
    const regex = new RegExp(`<g[^>]*(?:stroke|fill)="#${color}"[^>]*>([\\s\\S]*?)<\\/g>`, 'gi');
    let match;
    const paths = [];
    
    while ((match = regex.exec(svgContent)) !== null) {
      const groupContent = match[1];
      const pathMatch = groupContent.match(/<path[^>]*d="([^"]+)"[^>]*>/i);
      if (pathMatch) {
        // Extrair coordenadas iniciais do path para identificar localização
        const pathData = pathMatch[1];
        const coordMatch = pathData.match(/M\s+([\d.]+)\s+([\d.]+)/);
        if (coordMatch) {
          paths.push({
            x: parseFloat(coordMatch[1]),
            y: parseFloat(coordMatch[2]),
            path: pathData.substring(0, 100)
          });
        }
      }
    }
    
    if (paths.length > 0) {
      // Calcular posição média para identificar região
      const avgX = paths.reduce((sum, p) => sum + p.x, 0) / paths.length;
      const avgY = paths.reduce((sum, p) => sum + p.y, 0) / paths.length;
      
      console.log(`  #${color}: ${paths.length} paths encontrados`);
      console.log(`    Posição média: X=${avgX.toFixed(0)}, Y=${avgY.toFixed(0)}`);
      
      // Identificar região baseado na posição (viewBox: 0 0 896 1152)
      if (avgX < 300 && avgY > 700) {
        console.log(`    → Provavelmente: OESTE/SUDOESTE (Bonito-Serra da Bodoquena)`);
      } else if (avgX > 500 && avgY > 600) {
        console.log(`    → Provavelmente: SUDESTE (Vale das Águas)`);
      } else if (avgX < 400 && avgY < 500) {
        console.log(`    → Provavelmente: NORTE/OESTE (Pantanal/Rota Cerrado)`);
      } else {
        console.log(`    → Localização: CENTRO/OUTRA`);
      }
    } else {
      console.log(`  #${color}: Nenhum path encontrado`);
    }
  });
});

// Verificar se há confusão - cores azul-marinho sendo usadas onde deveria ser azul ciano
console.log('\n\n=== VERIFICAÇÃO DE CONFUSÃO DE CORES ===\n');
console.log('Se as cores azul-marinho aparecem no SUDESTE, estão erradas (deveriam ser azul ciano)');
console.log('Se as cores azul ciano aparecem no OESTE, estão erradas (deveriam ser azul-marinho)');


