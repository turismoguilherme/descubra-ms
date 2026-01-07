/**
 * Script para gerar traduções automaticamente para todo conteúdo existente
 * Execute este script para popular traduções faltantes
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Idiomas alvo
const TARGET_LANGUAGES = ['en-US', 'es-ES', 'fr-FR', 'de-DE'];
const LIBRE_TRANSLATE_URL = process.env.VITE_LIBRE_TRANSLATE_URL || 'https://libretranslate.de';

/**
 * Traduz texto usando LibreTranslate
 */
async function translateText(text, targetLang, sourceLang = 'pt-BR') {
  try {
    const response = await fetch(`${LIBRE_TRANSLATE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang.split('-')[0], // pt-BR -> pt
        target: targetLang.split('-')[0], // en-US -> en
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translatedText;

  } catch (error) {
    console.error(`❌ Erro ao traduzir "${text.substring(0, 50)}..." para ${targetLang}:`, error.message);
    return null;
  }
}

/**
 * Verifica se tradução já existe
 */
async function translationExists(contentKey, languageCode) {
  const { data, error } = await supabase
    .from('content_translations')
    .select('id')
    .eq('content_key', contentKey)
    .eq('language_code', languageCode)
    .single();

  return !error && data;
}

/**
 * Salva tradução no banco
 */
async function saveTranslation(contentKey, languageCode, translatedText) {
  const { error } = await supabase
    .from('content_translations')
    .upsert({
      content_key: contentKey,
      platform: 'descubra-ms',
      section: 'bulk-translation',
      language_code: languageCode,
      content: {
        content_value: translatedText
      }
    });

  if (error) {
    console.error(`❌ Erro ao salvar tradução ${contentKey} → ${languageCode}:`, error);
    return false;
  }

  return true;
}

/**
 * Processo principal
 */
async function generateMissingTranslations() {
  console.log('🚀 Iniciando geração de traduções em massa...\n');

  try {
    // Buscar todo conteúdo editável
    const { data: contents, error } = await supabase
      .from('institutional_content')
      .select('id, content_key, content_value')
      .not('content_value', 'is', null)
      .neq('content_value', '')
      .order('content_key');

    if (error) {
      throw error;
    }

    if (!contents || contents.length === 0) {
      console.log('ℹ️ Nenhum conteúdo encontrado');
      return;
    }

    console.log(`📋 Encontrados ${contents.length} itens de conteúdo\n`);

    let totalProcessed = 0;
    let totalTranslated = 0;
    let totalErrors = 0;

    // Processar cada item de conteúdo
    for (const content of contents) {
      if (!content.content_value || content.content_value.trim() === '') {
        continue;
      }

      console.log(`🔄 Processando: ${content.content_key}`);
      console.log(`   Texto: "${content.content_value.substring(0, 100)}${content.content_value.length > 100 ? '...' : ''}"`);

      // Verificar traduções para cada idioma
      for (const targetLang of TARGET_LANGUAGES) {
        totalProcessed++;

        // Verificar se tradução já existe
        const exists = await translationExists(content.content_key, targetLang);
        if (exists) {
          console.log(`   ⏭️ ${targetLang}: Já existe`);
          continue;
        }

        // Gerar tradução
        console.log(`   🔄 ${targetLang}: Gerando tradução...`);
        const translatedText = await translateText(content.content_value, targetLang);

        if (translatedText && translatedText !== content.content_value) {
          // Salvar tradução
          const saved = await saveTranslation(content.content_key, targetLang, translatedText);
          if (saved) {
            totalTranslated++;
            console.log(`   ✅ ${targetLang}: "${translatedText.substring(0, 100)}${translatedText.length > 100 ? '...' : ''}"`);
          } else {
            totalErrors++;
          }
        } else {
          console.log(`   ⚠️ ${targetLang}: Falhou ou texto idêntico`);
          totalErrors++;
        }

        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(''); // Linha em branco entre itens
    }

    // Relatório final
    console.log('📊 RELATÓRIO FINAL:');
    console.log(`   • Processados: ${totalProcessed}`);
    console.log(`   • Traduzidos: ${totalTranslated}`);
    console.log(`   • Erros: ${totalErrors}`);
    console.log(`   • Taxa de sucesso: ${((totalTranslated / totalProcessed) * 100).toFixed(1)}%`);

    if (totalTranslated > 0) {
      console.log('\n🎉 Traduções geradas com sucesso! O conteúdo dinâmico agora será traduzido.');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateMissingTranslations();
}

export { generateMissingTranslations };
