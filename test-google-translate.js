/**
 * Teste das APIs de Tradução
 * Execute este script para verificar qual API está funcionando
 */

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const LIBRE_TRANSLATE_URL = process.env.VITE_LIBRE_TRANSLATE_URL || 'https://libretranslate.de';

async function testLibreTranslateAPI() {
  console.log('🔄 Testando LibreTranslate API (gratuita)...');

  try {
    const response = await fetch(`${LIBRE_TRANSLATE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'Olá, mundo!',
        source: 'pt',
        target: 'en',
        format: 'text'
      })
    });

    if (!response.ok) {
      console.error(`❌ LibreTranslate: Erro HTTP ${response.status}: ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ LibreTranslate funcionando!', {
      original: 'Olá, mundo!',
      traduzido: data.translatedText,
      idioma: data.detectedLanguage
    });
    return true;

  } catch (error) {
    console.error('❌ LibreTranslate: Erro na requisição:', error.message);
    return false;
  }
}

async function testGoogleTranslateAPI() {
  if (!GOOGLE_API_KEY) {
    console.log('⚠️ VITE_GOOGLE_TRANSLATE_API_KEY não definida - pulando Google Translate');
    return false;
  }

  console.log('🔄 Testando Google Translate API...');

  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'Olá, mundo!',
        target: 'en',
        source: 'pt'
      })
    });

    if (!response.ok) {
      console.error(`❌ Google Translate: Erro HTTP ${response.status}: ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ Google Translate funcionando!', data);
    return true;

  } catch (error) {
    console.error('❌ Google Translate: Erro na requisição:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de tradução...\n');

  const libreWorking = await testLibreTranslateAPI();
  console.log('');

  const googleWorking = await testGoogleTranslateAPI();
  console.log('');

  console.log('📊 Resultado dos testes:');
  console.log(`LibreTranslate (gratuita): ${libreWorking ? '✅ Funcionando' : '❌ Com problemas'}`);
  console.log(`Google Translate: ${googleWorking ? '✅ Funcionando' : '❌ Com problemas'}`);

  if (libreWorking) {
    console.log('\n🎉 Ótimo! Você pode usar a tradução gratuita imediatamente!');
    console.log('Configure no Vercel: VITE_LIBRE_TRANSLATE_URL=https://libretranslate.de (ou deixe vazio)');
  } else if (googleWorking) {
    console.log('\n✅ Google Translate está funcionando!');
  } else {
    console.log('\n❌ Nenhuma API de tradução está funcionando.');
    console.log('Verifique as configurações e tente novamente.');
  }
}

runTests();
