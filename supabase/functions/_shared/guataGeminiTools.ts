// Gemini function-calling client (separate from callGeminiGenerate to preserve legacy behavior)
// Docs: https://ai.google.dev/gemini-api/docs/function-calling

const MODEL = Deno.env.get("GEMINI_TOOLS_MODEL") ?? Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

export type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, unknown> } }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

export interface GeminiContent {
  role: "user" | "model" | "function";
  parts: GeminiPart[];
}

export interface GeminiToolsCallResult {
  text: string | null;
  functionCalls: Array<{ name: string; args: Record<string, unknown> }>;
  httpStatus?: number;
  finishReason?: string;
}

export interface ToolDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export async function callGeminiWithTools(
  contents: GeminiContent[],
  tools: ToolDeclaration[],
  opts: { systemInstruction?: string; temperature?: number; maxOutputTokens?: number } = {},
): Promise<GeminiToolsCallResult> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return { text: null, functionCalls: [] };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const body: Record<string, unknown> = {
    contents,
    tools: [{ functionDeclarations: tools }],
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxOutputTokens ?? 1024,
      topP: 0.9,
      topK: 40,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
  if (opts.systemInstruction) {
    body.systemInstruction = { role: "system", parts: [{ text: opts.systemInstruction }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.warn(`[GeminiTools] HTTP ${res.status}:`, errText.slice(0, 300));
    return { text: null, functionCalls: [], httpStatus: res.status };
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const parts: GeminiPart[] = candidate?.content?.parts ?? [];
  const functionCalls = parts
    .filter((p: GeminiPart): p is { functionCall: { name: string; args: Record<string, unknown> } } =>
      "functionCall" in p && !!(p as { functionCall?: unknown }).functionCall,
    )
    .map((p) => ({ name: p.functionCall.name, args: p.functionCall.args ?? {} }));
  const textParts = parts
    .filter((p): p is { text: string } => "text" in p && typeof (p as { text?: unknown }).text === "string")
    .map((p) => p.text.trim())
    .filter(Boolean);

  return {
    text: textParts.length ? textParts.join("\n\n") : null,
    functionCalls,
    httpStatus: 200,
    finishReason: candidate?.finishReason,
  };
}
