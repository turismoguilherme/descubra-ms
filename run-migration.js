const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente diretamente
const supabaseUrl = 'https://hvtrpkbjgbuypkskqcqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc3FxY20iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5NTQ5NTM0NSwiZXhwIjoxODAzMDcxMzQ1fQ.8J5gQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zqQ8zq';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  try {
    console.log('🔄 Verificando se a tabela content_translations existe...');

    // Primeiro, tentar fazer uma consulta simples para ver se a tabela existe
    const { data, error } = await supabase
      .from('content_translations')
      .select('count', { count: 'exact', head: true });

    if (error && error.code === 'PGRST116') {
      console.log('✅ Tabela content_translations NÃO existe. Criando...');

      // Se a tabela não existe, vamos inserir alguns dados de exemplo para forçar a criação
      // Como não temos acesso direto ao SQL DDL, vamos tentar usar uma abordagem diferente

      console.log('⚠️ Não é possível criar tabelas via SDK do Supabase.');
      console.log('📋 Você precisa executar a migração manualmente no painel do Supabase.');
      console.log('📁 Arquivo: supabase/migrations/20250127000006_create_content_translations.sql');

      return;
    }

    console.log('✅ Tabela content_translations já existe!');
    console.log(`📊 Registros encontrados: ${data}`);

  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

runMigration();
