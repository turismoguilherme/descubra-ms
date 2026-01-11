/**
 * Teste completo do fluxo de tradução
 * Verifica se as traduções estão sendo carregadas corretamente
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Simular busca de conteúdo
async function testContentLoading() {
  console.log('🧪 Testando carregamento de conteúdo...\n');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Variáveis do Supabase não encontradas');
    return;
  }

  try {
    // Testar busca de conteúdo
    console.log('1. Buscando conteúdo do banco...');
    const contentResponse = await fetch(`${SUPABASE_URL}/rest/v1/institutional_content?select=id,content_key,content_value&is_active=eq.true&order=content_key`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!contentResponse.ok) {
      throw new Error(`HTTP ${contentResponse.status}`);
    }

    const contents = await contentResponse.json();
    console.log(`✅ Encontrados ${contents.length} itens de conteúdo`);

    if (contents.length > 0) {
      console.log('📝 Primeiros 3 itens:');
      contents.slice(0, 3).forEach(item => {
        console.log(`   - ${item.content_key}: "${item.content_value?.substring(0, 50)}${item.content_value?.length > 50 ? '...' : ''}"`);
      });
    }

    // Testar busca de traduções
    console.log('\n2. Buscando traduções...');
    const translationResponse = await fetch(`${SUPABASE_URL}/rest/v1/content_translations?select=content_key,language_code,content&order=content_key`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!translationResponse.ok) {
      throw new Error(`HTTP ${translationResponse.status}`);
    }

    const translations = await translationResponse.json();
    console.log(`✅ Encontradas ${translations.length} traduções`);

    // Agrupar por idioma
    const byLanguage = translations.reduce((acc, t) => {
      acc[t.language_code] = (acc[t.language_code] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Traduções por idioma:', byLanguage);

    // Verificar se há conteúdo sem tradução
    console.log('\n3. Verificando conteúdo sem tradução...');
    const contentKeys = new Set(contents.map(c => c.content_key));
    const translatedKeys = new Set(translations.map(t => t.content_key));

    const missingTranslations = [];
    contentKeys.forEach(key => {
      const itemTranslations = translations.filter(t => t.content_key === key);
      const missingLanguages = ['en-US', 'es-ES', 'fr-FR', 'de-DE'].filter(lang =>
        !itemTranslations.some(t => t.language_code === lang)
      );

      if (missingLanguages.length > 0) {
        missingTranslations.push({
          key,
          missing: missingLanguages
        });
      }
    });

    console.log(`❌ ${missingTranslations.length} itens sem tradução completa`);
    if (missingTranslations.length > 0) {
      console.log('📋 Primeiros 5 sem tradução:');
      missingTranslations.slice(0, 5).forEach(item => {
        console.log(`   - ${item.key}: faltam ${item.missing.join(', ')}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Testar API de tradução
async function testTranslationAPI() {
  console.log('\n🌐 Testando API de tradução...\n');

  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'Olá, este é um teste de tradução automática.',
        source: 'pt',
        target: 'en',
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API funcionando!');
    console.log('📝 Original:', 'Olá, este é um teste de tradução automática.');
    console.log('📝 Tradução:', data.translatedText);
    console.log('🌍 Idioma detectado:', data.detectedLanguage);

  } catch (error) {
    console.error('❌ API não funcionando:', error.message);
  }
}

// Executar testes
async function runAllTests() {
  console.log('🚀 Iniciando testes completos do sistema de tradução\n');

  await testContentLoading();
  await testTranslationAPI();

  console.log('\n📋 RESUMO:');
  console.log('Se a API estiver funcionando mas não há traduções no banco,');
  console.log('acesse o painel admin para gerar traduções automaticamente.');
  console.log('URL: https://descubrams.com/viajar/admin/system/translations');
}

runAllTests();



