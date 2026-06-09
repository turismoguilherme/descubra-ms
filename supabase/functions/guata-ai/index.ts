import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { generateTouristPrompt, generateCATPrompt } from "./prompts.ts";
import { callGeminiGenerate } from "../_shared/guataGeminiCall.ts";
import { matchMSKnowledgeTopic } from "../_shared/msKnowledgeTopics.ts";
import {
  inferGuataResponseDepth,
  guataResponseDepthMaxTokens,
  guataResponseDepthFormatBlock,
} from "../_shared/guataResponseDepth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const GEMINI_MAX_TOKENS_DEFAULT = parseInt(Deno.env.get('GEMINI_MAX_OUTPUT_TOKENS') ?? '2048', 10);
const GEMINI_TEMPERATURE = parseFloat(Deno.env.get('GEMINI_TEMPERATURE') ?? '0.7');

interface KnowledgeItem {
  title?: string;
  content?: string;
  source?: string;
  lastUpdated?: string;
}

function buildContextContent(knowledgeBase?: KnowledgeItem[]): string {
  if (!knowledgeBase?.length) return '';
  return knowledgeBase
    .map((item) => {
      const title = item.title || 'Informação';
      const content = item.content || '';
      const source = item.source ? ` (fonte: ${item.source})` : '';
      return `${title}: ${content}${source}`;
    })
    .join('\n\n');
}

async function generateGeminiResponse(
  prompt: string,
  options: {
    knowledgeBase?: KnowledgeItem[];
    userContext?: string;
    chatHistory?: string;
    mode?: string;
  } = {},
): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY não configurada');
    return generateLocalResponse(prompt);
  }

  const contextContent = buildContextContent(options.knowledgeBase);
  const mode = options.mode === 'cat' ? 'cat' : 'tourist';
  const systemPrompt = mode === 'cat'
    ? generateCATPrompt(contextContent, options.userContext || '')
    : generateTouristPrompt(contextContent, options.userContext || '', options.chatHistory || '');

  const depth = inferGuataResponseDepth(prompt);
  const formatBlock = guataResponseDepthFormatBlock(depth);
  const maxTokens = Math.max(GEMINI_MAX_TOKENS_DEFAULT, guataResponseDepthMaxTokens(depth));

  const fullPrompt = `${systemPrompt}

${formatBlock}

Pergunta do usuário: "${prompt}"

Responda como o Guatá:`;

  const result = await callGeminiGenerate(fullPrompt, {
    temperature: GEMINI_TEMPERATURE,
    maxOutputTokens: maxTokens,
  });

  if (result.text) {
    console.log(`✅ Gemini OK (${result.modelUsed})`);
    return result.text;
  }

  console.warn(`⚠️ Gemini indisponível (status ${result.httpStatus}) — fallback local`);
  return generateLocalResponse(prompt);
}

function generateLocalResponse(prompt: string): string {
  const topic = matchMSKnowledgeTopic(prompt);
  if (topic) return topic;

  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('oi') || lowerPrompt.includes('olá') || lowerPrompt.includes('quem é') || lowerPrompt.includes('você é')) {
    return `Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! 🦦 Posso te contar sobre Bonito, Pantanal, Campo Grande e muito mais. O que você gostaria de saber?`;
  }
  if (lowerPrompt.includes('bonito')) {
    return `Bonito é a Capital do Ecoturismo — águas cristalinas, Rio Sucuri e Gruta do Lago Azul são imperdíveis. Quer saber mais sobre algum passeio?`;
  }
  if (lowerPrompt.includes('pantanal')) {
    return `O Pantanal é o maior santuário de vida selvagem das Américas. A melhor época é maio a setembro. Quer dicas de onde ficar ou como chegar?`;
  }
  if (lowerPrompt.includes('campo grande') || lowerPrompt.includes('capital')) {
    return `Campo Grande, a Cidade Morena, tem Feira Central, Parque das Nações Indígenas e Mercadão Municipal. O que você quer explorar primeiro?`;
  }

  return (
    'A busca com IA está temporariamente limitada, mas posso te ajudar com destinos, gastronomia, roteiros e turismo comunitário em MS. ' +
    'Reformula com uma cidade ou tema (ex.: Bonito, comida típica, turismo de impacto social)?'
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let body: Record<string, unknown>;
    try {
      const raw = await req.text();
      if (!raw) {
        return new Response(JSON.stringify({ error: 'Empty request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      body = JSON.parse(raw);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = typeof body.prompt === 'string' ? body.prompt : '';
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing or invalid prompt field' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (prompt === 'ping') {
      return new Response(JSON.stringify({ response: 'pong' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const knowledgeBase = Array.isArray(body.knowledgeBase) ? body.knowledgeBase as KnowledgeItem[] : [];
    const userContext = typeof body.userContext === 'string' ? body.userContext : '';
    const chatHistory = typeof body.chatHistory === 'string' ? body.chatHistory : '';
    const mode = typeof body.mode === 'string' ? body.mode : 'tourist';

    const geminiResponse = await generateGeminiResponse(prompt, {
      knowledgeBase,
      userContext,
      chatHistory,
      mode,
    });

    return new Response(JSON.stringify({ response: geminiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('❌ guata-ai: handler error:', message);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
