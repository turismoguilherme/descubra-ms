// Teste da Edge Function guata-google-search-proxy
import { createClient } from '@supabase/supabase-js';

// Usar valores do .env
const supabaseUrl = 'https://hvtrpkbjgbuypkskqcqm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEdgeFunction() {
  console.log('🧪 Testando Edge Function guata-google-search-proxy...');

  try {
    const { data, error } = await supabase.functions.invoke('guata-google-search-proxy', {
      body: {
        query: 'bonito mato grosso do sul turismo',
        maxResults: 3,
        location: 'Mato Grosso do Sul'
      }
    });

    console.log('📊 Resposta recebida:');
    console.log('Status de erro:', !!error);
    console.log('Dados:', data);
    console.log('Erro:', error);

    if (data && data.success) {
      console.log('✅ Edge Function funcionando! Resultados:', data.results?.length || 0);
    } else {
      console.log('❌ Edge Function com problema:', data?.error || error?.message);
    }

  } catch (error) {
    console.error('❌ Erro ao testar Edge Function:', error);
  }
}

testEdgeFunction();
