/**
 * Debug detalhado do sistema de traduções
 * Verifica exatamente o que está acontecendo
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function debugTranslations() {
  console.log('🔍 DEBUG: Sistema de Traduções\n');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Variáveis do Supabase não encontradas');
    return;
  }

  try {
    // 1. Verificar conteúdo base
    console.log('1️⃣ Verificando conteúdo base (ms_hero_)...');
    const contentResponse = await fetch(`${SUPABASE_URL}/rest/v1/institutional_content?select=id,content_key,content_value&content_key=ilike.ms_hero_%&is_active=eq.true`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    const contents = await contentResponse.json();
    console.log(`📄 Encontrados ${contents.length} itens de conteúdo ms_hero_:`);
    contents.forEach(item => {
      console.log(`   ${item.content_key}: "${item.content_value?.substring(0, 50)}${item.content_value?.length > 50 ? '...' : ''}"`);
    });

    // 2. Verificar traduções existentes
    console.log('\n2️⃣ Verificando traduções existentes...');
    const translationResponse = await fetch(`${SUPABASE_URL}/rest/v1/content_translations?select=content_key,language_code,content&content_key=ilike.ms_hero_%`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    const translations = await translationResponse.json();
    console.log(`🌐 Encontradas ${translations.length} traduções:`);
    translations.forEach(t => {
      const content = t.content as any;
      console.log(`   ${t.content_key} [${t.language_code}]: "${content?.content_value?.substring(0, 50)}${content?.content_value?.length > 50 ? '...' : ''}"`);
    });

    // 3. Simular busca como o componente faz
    console.log('\n3️⃣ Simulando busca como o UniversalHero faz (idioma: en-US)...');
    console.log('   Buscando: getContentByPrefix("ms_hero_", "en-US")');

    // Simular o que o método faz
    const prefixContents = contents.filter(c => c.content_key.startsWith('ms_hero_'));

    console.log(`   Conteúdo base encontrado: ${prefixContents.length} itens`);

    // Simular busca de traduções
    const contentKeys = prefixContents.map(c => c.content_key);
    const relevantTranslations = translations.filter(t =>
      contentKeys.includes(t.content_key) && t.language_code === 'en-US'
    );

    console.log(`   Traduções encontradas para en-US: ${relevantTranslations.length} itens`);

    // Simular aplicação de traduções
    const translatedContents = prefixContents.map(content => {
      const translation = relevantTranslations.find(t => t.content_key === content.content_key);
      if (translation && (translation.content as any)?.content_value) {
        return {
          ...content,
          content_value: (translation.content as any).content_value,
        };
      }
      return content;
    });

    console.log('   Resultado final:');
    translatedContents.forEach(item => {
      const hasTranslation = relevantTranslations.some(t => t.content_key === item.content_key);
      console.log(`   ${item.content_key}: "${item.content_value?.substring(0, 50)}${item.content_value?.length > 50 ? '...' : ''}" ${hasTranslation ? '✅ (traduzido)' : '❌ (original)'}`);
    });

    // 4. Verificar se o hook de tradução automática está funcionando
    console.log('\n4️⃣ Testando geração de tradução automática...');

    const testContent = 'Descubra Mato Grosso do Sul - Viva essa experiência!';
    console.log(`   Texto de teste: "${testContent}"`);

    try {
      const translateResponse = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: testContent,
          source: 'pt',
          target: 'en',
          format: 'text'
        })
      });

      if (translateResponse.ok) {
        const translateData = await translateResponse.json();
        console.log(`   ✅ Tradução automática funciona: "${translateData.translatedText}"`);
      } else {
        console.log(`   ❌ API de tradução falhou: ${translateResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Erro na API de tradução: ${error.message}`);
    }

    // 5. Conclusões
    console.log('\n📋 DIAGNÓSTICO:');
    const translatedCount = translatedContents.filter((_, i) =>
      relevantTranslations.some(t => t.content_key === prefixContents[i].content_key)
    ).length;

    console.log(`   • Conteúdo total: ${prefixContents.length}`);
    console.log(`   • Com tradução: ${translatedCount}`);
    console.log(`   • Sem tradução: ${prefixContents.length - translatedCount}`);

    if (translatedCount === 0) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log('   Não há traduções salvas no banco para o conteúdo ms_hero_');
      console.log('   Isso significa que:');
      console.log('   1. As traduções automáticas não foram geradas');
      console.log('   2. Ou houve falha ao salvar no banco');
      console.log('\n💡 SOLUÇÃO:');
      console.log('   Use o painel admin para gerar traduções:');
      console.log('   https://descubrams.com/viajar/admin/system/translations');
    } else {
      console.log('\n✅ SISTEMA FUNCIONANDO:');
      console.log('   As traduções existem, mas podem não estar sendo carregadas');
      console.log('   Verifique se o componente está mudando o idioma corretamente');
    }

  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
  }
}

debugTranslations();
