/** Chamada Gemini com retry em 429, thinking desligado (2.5+) e fallback de modelo */

const PRIMARY_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
const FALLBACK_MODEL = Deno.env.get('GEMINI_FALLBACK_MODEL') ?? 'gemini-2.5-flash-lite';

export interface GeminiCallResult {
  text: string | null;
  httpStatus?: number;
  modelUsed: string;
  finishReason?: string;
}

function usesThinkingModel(model: string): boolean {
  return /gemini-2\.5|gemini-3/i.test(model);
}

function buildGenerationConfig(
  model: string,
  temperature: number,
  maxOutputTokens: number,
): Record<string, unknown> {
  const config: Record<string, unknown> = {
    temperature,
    maxOutputTokens,
    topP: 0.9,
    topK: 40,
  };

  // Gemini 2.5+ gasta tokens de "thinking" no maxOutputTokens — desliga para resposta completa
  if (usesThinkingModel(model)) {
    config.thinkingConfig = { thinkingBudget: 0 };
  }

  return config;
}

export async function callGeminiGenerate(
  prompt: string,
  config: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {},
): Promise<GeminiCallResult> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return { text: null, modelUsed: PRIMARY_MODEL };
  }

  const temperature = config.temperature ?? parseFloat(Deno.env.get('GEMINI_TEMPERATURE') ?? '0.7');
  const maxOutputTokens = config.maxOutputTokens ?? parseInt(Deno.env.get('GEMINI_MAX_OUTPUT_TOKENS') ?? '2048', 10);

  const models = [PRIMARY_MODEL, FALLBACK_MODEL].filter((m, i, arr) => arr.indexOf(m) === i);
  let lastHttpStatus: number | undefined;
  let lastFinishReason: string | undefined;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: buildGenerationConfig(model, temperature, maxOutputTokens),
        }),
      });

      lastHttpStatus = response.status;

      if (response.status === 429) {
        console.warn(`[Gemini] 429 em ${model}, tentativa ${attempt + 1}`);
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        console.warn(`[Gemini] HTTP ${response.status} em ${model}:`, err.slice(0, 200));
        break;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text?.trim();
      lastFinishReason = candidate?.finishReason;

      if (text) {
        if (lastFinishReason === 'MAX_TOKENS') {
          console.warn(`[Gemini] Resposta truncada (MAX_TOKENS) em ${model}, len=${text.length}`);
        }
        return { text, httpStatus: 200, modelUsed: model, finishReason: lastFinishReason };
      }
      break;
    }
  }

  return {
    text: null,
    httpStatus: lastHttpStatus ?? 503,
    modelUsed: PRIMARY_MODEL,
    finishReason: lastFinishReason,
  };
}
