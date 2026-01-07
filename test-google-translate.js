/**
 * Teste da Google Translate API
 * Execute este script para verificar se a API está funcionando
 */

const API_KEY = process.env.VITE_GOOGLE_TRANSLATE_API_KEY;

async function testGoogleTranslateAPI() {
  if (!API_KEY) {
    console.error('❌ VITE_GOOGLE_TRANSLATE_API_KEY não definida');
    return;
  }

  console.log('🔄 Testando Google Translate API...');

  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
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
      console.error(`❌ Erro HTTP ${response.status}: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log('✅ API funcionando!', data);

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testGoogleTranslateAPI();
