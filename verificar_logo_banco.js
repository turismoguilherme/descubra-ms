// Script para verificar qual logo está no banco de dados
// Execute: node verificar_logo_banco.js

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas');
  console.log('💡 Certifique-se de ter um arquivo .env com essas variáveis');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarLogo() {
  console.log('🔍 Verificando logo no banco de dados...\n');
  
  try {
    const { data, error } = await supabase
      .from('institutional_content')
      .select('content_key, content_value, updated_at')
      .eq('content_key', 'ms_logo_url')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar logo:', error);
      return;
    }

    if (!data || !data.content_value) {
      console.log('⚠️  Logo não encontrada no banco de dados (ms_logo_url)');
      console.log('💡 Isso significa que o sistema está usando a logo padrão: /images/logo-descubra-ms.png?v=3');
    } else {
      console.log('✅ Logo encontrada no banco de dados:');
      console.log('   Chave: ms_logo_url');
      console.log('   URL: ' + data.content_value);
      console.log('   Última atualização: ' + data.updated_at);
      console.log('\n📋 Esta é a logo que está sendo carregada do banco.');
      console.log('💡 Para usar esta logo como padrão, precisamos:');
      console.log('   1. Verificar se a URL aponta para um arquivo acessível');
      console.log('   2. Se for URL do Supabase Storage, baixar a imagem');
      console.log('   3. Copiar para /public/images/logo-descubra-ms.png');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

verificarLogo();




