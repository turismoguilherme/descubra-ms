// Script para baixar a logo diretamente da URL do Supabase Storage
// Execute: node baixar_logo_direto.js "URL_COMPLETA_DA_LOGO"
// Ou modifique a variável logoUrl abaixo com a URL completa

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URL da logo do Supabase Storage (cole a URL completa aqui)
// Você pode obter a URL completa executando o SQL: SELECT content_value FROM institutional_content WHERE content_key = 'ms_logo_url';
const logoUrl = process.argv[2] || 'https://hvtrpkbjgbuypkskqcqm.supabase.co/storage/v1/object/public/tourism-images/logos/ms_logo_url/[UUID].png';

async function baixarLogo() {
  if (!logoUrl || logoUrl.includes('[UUID]')) {
    console.error('❌ Por favor, forneça a URL completa da logo:');
    console.log('   node baixar_logo_direto.js "URL_COMPLETA"');
    console.log('\n💡 Para obter a URL completa, execute no Supabase SQL Editor:');
    console.log('   SELECT content_value FROM institutional_content WHERE content_key = \'ms_logo_url\';');
    process.exit(1);
  }

  console.log('📥 Baixando logo de:');
  console.log('   ' + logoUrl);
  console.log('');

  try {
    // Baixar a imagem
    const response = await fetch(logoUrl);
    if (!response.ok) {
      throw new Error(`Erro ao baixar: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Criar backup da logo antiga se existir
    const outputPath = path.join(__dirname, 'public', 'images', 'logo-descubra-ms.png');
    const backupPath = path.join(__dirname, 'public', 'images', 'logo-descubra-ms-backup.png');
    
    if (fs.existsSync(outputPath)) {
      console.log('📦 Criando backup da logo antiga...');
      fs.copyFileSync(outputPath, backupPath);
      console.log('   ✅ Backup salvo em: logo-descubra-ms-backup.png');
    }

    // Salvar a nova logo
    fs.writeFileSync(outputPath, buffer);

    console.log('✅ Logo baixada e salva em:');
    console.log('   ' + outputPath);
    console.log('\n📋 Próximos passos:');
    console.log('   1. Verificar se a logo foi salva corretamente');
    console.log('   2. Atualizar o código para usar esta logo como padrão');
    console.log('   3. Testar se o flash foi resolvido');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('   Detalhes:', error);
    process.exit(1);
  }
}

baixarLogo();

