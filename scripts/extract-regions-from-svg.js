// Script para extrair paths por cor do SVG e criar áreas clicáveis
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/images/mapa-ms-regioes.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Mapeamento de cores para regiões
const colorMapping = {
  // AMARELO: PANTANAL
  'pantanal': ['D1B21B', 'D1B218', 'CFB11C', 'D2B31C', 'D1B21A'],
  
  // VERDE: ROTA CERRADO PANTANAL
  'rota-cerrado-pantanal': ['84A24B', '84A148', '83A147', '83A049', '84A147', '86A155'],
  
  // VERMELHO FORTE: COSTA LESTE
  'costa-leste': ['D84642', 'DA4240', 'DA4340', 'DB4240', 'DB423F', 'DB413F', 'D94844'],
  
  // ROXO: CAMPO GRANDE DOS IPÊS
  'campo-grande-ipes': ['76448E', '75428E', '76428D', '76438D', '76448D', '77448E', '77448F', '75428C'],
  
  // AZUL MARINHO: BONITO-SERRA DA BODOQUENA
  'bonito-serra-bodoquena': ['118DC2', '128EC1', '148DC1', '148EBF', '158FC0', '158FC2', '168EC1', '1A8EBE', '228FBC'],
  
  // MARROM: CAMINHOS DA FRONTEIRA
  'caminhos-fronteira': ['DA5527', 'DB5523', 'E04E1A', 'E0501C', 'E0511F'],
  
  // AZUL FORTE: VALE DAS ÁGUAS
  'vale-das-aguas': ['81C7CF', '81C7D1', '82C7CE', '82C7D0', '84C7D0', '84C8D0', '8FC4D6', '9CD5E3'],
  
  // VERMELHO FRACO: CAMINHOS DA NATUREZA-CONE SUL
  'caminhos-natureza-cone-sul': ['D49B9A', 'D69F9D', 'D79E9A', 'D79F9A', 'D99A9C'],
  
  // CINZA: CELEIRO DO MS
  'celeiro-ms': ['C1C1BF', 'C2CAAF', 'CCC0A9', 'C1E2E3', 'CED1DD']
};

// Extrair paths por cor
const regionPaths = {};

Object.keys(colorMapping).forEach(regionId => {
  const colors = colorMapping[regionId];
  const paths = [];
  
  colors.forEach(color => {
    // Buscar todos os grupos com essa cor
    const regex = new RegExp(`<g[^>]*stroke="#${color}"[^>]*>([\\s\\S]*?)</g>`, 'gi');
    let match;
    
    while ((match = regex.exec(svgContent)) !== null) {
      // Extrair paths dentro do grupo
      const groupContent = match[1];
      const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/gi;
      let pathMatch;
      
      while ((pathMatch = pathRegex.exec(groupContent)) !== null) {
        paths.push(pathMatch[1].trim());
      }
    }
  });
  
  regionPaths[regionId] = paths;
});

// Salvar resultado
const output = {
  regions: regionPaths,
  summary: Object.keys(regionPaths).map(id => ({
    id,
    pathCount: regionPaths[id].length
  }))
};

console.log('Regiões extraídas:');
output.summary.forEach(s => {
  console.log(`- ${s.id}: ${s.pathCount} paths`);
});

fs.writeFileSync(
  path.join(__dirname, '../src/data/svg-regions-paths.json'),
  JSON.stringify(output, null, 2)
);

console.log('\nArquivo salvo em: src/data/svg-regions-paths.json');


