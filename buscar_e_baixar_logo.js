// Script para buscar e baixar a logo do banco de dados
// Execute: VITE_SUPABASE_URL="sua_url" VITE_SUPABASE_ANON_KEY="sua_chave" node buscar_e_baixar_logo.js
// Ou modifique as variáveis abaixo diretamente

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cole suas credenciais do Supabase aqui (ou use variáveis de ambiente)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hvtrpkbjgbuypkskqcqm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'COLE_SUA_CHAVE_AQUI';

if (supabaseKey === 'COLE_SUA_CHAVE_AQUI') {
  console.error('❌ Por favor, forneça a chave do Supabase:');
  console.log('   Opção 1: Modifique a variável supabaseKey neste arquivo');
  console.log('   Opção 2: Execute: VITE_SUPABASE_ANON_KEY="sua_chave" node buscar_e_baixar_logo.js');
  console.log('\n💡 Você pode encontrar a chave em: Supabase Dashboard > Settings > API > anon/public key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function buscarEBaixarLogo() {
  console.log('🔍 Buscando logo no banco de dados...\n');
  
  try {
    // 1. Buscar URL da logo no banco
    const { data, error } = await supabase
      .from('institutional_content')
      .select('content_value')
      .eq('content_key', 'ms_logo_url')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar logo:', error.message);
      console.error('   Detalhes:', error);
      return;
    }

    if (!data || !data.content_value) {
      console.log('⚠️  Logo não encontrada no banco de dados');
      return;
    }

    const logoUrl = data.content_value;
    console.log('✅ Logo encontrada no banco:');
    console.log('   URL:', logoUrl);
    console.log('\n📥 Baixando logo...');

    // 2. Baixar a imagem
    const response = await fetch(logoUrl);
    if (!response.ok) {
      throw new Error(`Erro ao baixar: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Criar backup da logo antiga se existir
    const outputPath = path.join(__dirname, 'public', 'images', 'logo-descubra-ms.png');
    const backupPath = path.join(__dirname, 'public', 'images', 'logo-descubra-ms-backup.png');
    
    if (fs.existsSync(outputPath)) {
      console.log('📦 Criando backup da logo antiga...');
      fs.copyFileSync(outputPath, backupPath);
      console.log('   ✅ Backup salvo em: logo-descubra-ms-backup.png');
    }

    // 4. Salvar a nova logo
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

buscarEBaixarLogo();

