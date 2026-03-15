// Script para baixar a logo do banco de dados e salvar como padrão
// Execute: node baixar_logo_banco.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler variáveis de ambiente do arquivo .env manualmente
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function baixarLogo() {
  console.log('🔍 Buscando logo no banco de dados...\n');
  
  try {
    // 1. Buscar URL da logo no banco
    const { data, error } = await supabase
      .from('institutional_content')
      .select('content_value')
      .eq('content_key', 'ms_logo_url')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar logo:', error);
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

    // 3. Salvar no diretório public/images
    const outputPath = path.join(__dirname, 'public', 'images', 'logo-descubra-ms.png');
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
  }
}

baixarLogo();

