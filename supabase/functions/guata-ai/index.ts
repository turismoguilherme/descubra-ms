import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { generateTouristPrompt, generateCATPrompt, generateGuataToolsGuidance } from "./prompts.ts";
import { callGeminiGenerate } from "../_shared/guataGeminiCall.ts";
import {
  callGeminiWithTools,
  type GeminiContent,
} from "../_shared/guataGeminiTools.ts";
import { matchMSKnowledgeTopic } from "../_shared/msKnowledgeTopics.ts";
import {
  inferGuataResponseDepth,
  guataResponseDepthMaxTokens,
  guataResponseDepthFormatBlock,
} from "../_shared/guataResponseDepth.ts";
import {
  buildAuthContext,
  isInternalBotRequest,
  resolveUserId,
  resolveUserIdByPhone,
} from "../_shared/guataAuth.ts";
import { guataToolDeclarations } from "./toolSchemas.ts";
import { searchPartners } from "./tools/searchPartners.ts";
import { checkAvailability } from "./tools/checkAvailability.ts";
import { createEventDraft } from "./tools/createEventDraft.ts";
import { createReservation } from "./tools/createReservation.ts";
import { createCheckoutLink } from "./tools/createCheckoutLink.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const GEMINI_MAX_TOKENS_DEFAULT = parseInt(Deno.env.get("GEMINI_MAX_OUTPUT_TOKENS") ?? "2048", 10);
const GEMINI_TEMPERATURE = parseFloat(Deno.env.get("GEMINI_TEMPERATURE") ?? "0.7");
const MAX_TOOL_ITERATIONS = 4;

interface KnowledgeItem {
  title?: string;
  content?: string;
  source?: string;
  lastUpdated?: string;
}

function buildContextContent(knowledgeBase?: KnowledgeItem[]): string {
  if (!knowledgeBase?.length) return "";
  return knowledgeBase
    .map((item) => {
      const title = item.title || "Informação";
      const content = item.content || "";
      const source = item.source ? ` (fonte: ${item.source})` : "";
      return `${title}: ${content}${source}`;
    })
    .join("\n\n");
}

const WRITE_ACTIONS = new Set(["create_event_draft", "create_reservation", "create_checkout_link"]);
const ACTION_LABELS: Record<string, string> = {
  create_event_draft: "cadastrar_evento",
  create_reservation: "reservar",
  create_checkout_link: "pagar",
};

function detectRequestedAction(prompt: string): string | null {
  const p = prompt.toLowerCase();
  if (/(cadastrar|criar|registrar).{0,20}evento/.test(p)) return "cadastrar_evento";
  if (/(reservar|reserva|booking)/.test(p)) return "reservar";
  if (/(comprar|pagar|checkout|pagamento)/.test(p)) return "pagar";
  return null;
}

async function runToolCallingConversation(params: {
  prompt: string;
  systemPrompt: string;
  chatHistory: string;
  ctx: ReturnType<typeof buildAuthContext>;
  userAuthenticated: boolean;
}): Promise<{ text: string | null; usedTools: string[] }> {
  const { prompt, systemPrompt, chatHistory, ctx, userAuthenticated } = params;

  const toolsGuidance = generateGuataToolsGuidance(userAuthenticated);

  const contents: GeminiContent[] = [];
  if (chatHistory.trim()) {
    contents.push({ role: "user", parts: [{ text: `Histórico recente:\n${chatHistory}` }] });
    contents.push({ role: "model", parts: [{ text: "Entendido, seguindo o histórico." }] });
  }
  contents.push({ role: "user", parts: [{ text: prompt }] });

  const usedTools: string[] = [];

  for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
    const res = await callGeminiWithTools(contents, guataToolDeclarations, {
      systemInstruction: `${systemPrompt}\n\n${toolsGuidance}`,
      temperature: 0.4,
      maxOutputTokens: 1024,
    });

    if (!res.functionCalls.length) {
      return { text: res.text, usedTools };
    }

    contents.push({
      role: "model",
      parts: res.functionCalls.map((fc) => ({ functionCall: fc })),
    });

    const responses: GeminiContent = { role: "function", parts: [] };
    for (const fc of res.functionCalls) {
      usedTools.push(fc.name);

      if (WRITE_ACTIONS.has(fc.name) && !userAuthenticated) {
        responses.parts.push({
          functionResponse: {
            name: fc.name,
            response: { error: "auth_required", hint: "Peça ao usuário para fazer login." },
          },
        });
        continue;
      }

      let result: Record<string, unknown> = { error: "tool_unknown" };
      try {
        if (fc.name === "search_partners") {
          result = (await searchPartners(ctx, fc.args as never)) as Record<string, unknown>;
        } else if (fc.name === "check_availability") {
          result = (await checkAvailability(ctx, fc.args as never)) as Record<string, unknown>;
        } else if (fc.name === "create_event_draft") {
          result = (await createEventDraft(ctx, fc.args as never)) as Record<string, unknown>;
        } else if (fc.name === "create_reservation") {
          result = (await createReservation(ctx, fc.args as never)) as Record<string, unknown>;
        } else if (fc.name === "create_checkout_link") {
          result = (await createCheckoutLink(ctx, fc.args as never)) as Record<string, unknown>;
        }
      } catch (err) {
        result = { error: "tool_exception", hint: err instanceof Error ? err.message : String(err) };
      }

      responses.parts.push({
        functionResponse: { name: fc.name, response: result },
      });
    }
    contents.push(responses);
  }

  // Último passo sem tools para forçar resposta final
  const finalRes = await callGeminiWithTools(contents, [], {
    systemInstruction: systemPrompt,
    temperature: 0.5,
    maxOutputTokens: 1024,
  });
  return { text: finalRes.text, usedTools };
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
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.log("❌ GEMINI_API_KEY não configurada");
    return generateLocalResponse(prompt);
  }

  const contextContent = buildContextContent(options.knowledgeBase);
  const mode = options.mode === "cat" ? "cat" : "tourist";
  const systemPrompt = mode === "cat"
    ? generateCATPrompt(contextContent, options.userContext || "")
    : generateTouristPrompt(contextContent, options.userContext || "", options.chatHistory || "");

  const depth = inferGuataResponseDepth(prompt);
  const formatBlock = guataResponseDepthFormatBlock(depth);
  const maxTokens = Math.max(GEMINI_MAX_TOKENS_DEFAULT, guataResponseDepthMaxTokens(depth));

  const fullPrompt = `${systemPrompt}\n\n${formatBlock}\n\nPergunta do usuário: "${prompt}"\n\nResponda como o Guatá:`;

  const result = await callGeminiGenerate(fullPrompt, {
    temperature: GEMINI_TEMPERATURE,
    maxOutputTokens: maxTokens,
  });

  if (result.text) return result.text;
  console.warn(`⚠️ Gemini indisponível (status ${result.httpStatus}) — fallback local`);
  return generateLocalResponse(prompt);
}

function generateLocalResponse(prompt: string): string {
  const topic = matchMSKnowledgeTopic(prompt);
  if (topic) return topic;
  const lowerPrompt = prompt.toLowerCase();
  if (/(oi|olá|quem é|você é)/.test(lowerPrompt)) {
    return "Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! 🦦 Posso te contar sobre Bonito, Pantanal, Campo Grande e muito mais.";
  }
  return "A busca com IA está temporariamente limitada. Reformula com uma cidade ou tema (ex.: Bonito, comida típica)?";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let body: Record<string, unknown>;
    try {
      const raw = await req.text();
      if (!raw) {
        return new Response(JSON.stringify({ error: "Empty request body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      body = JSON.parse(raw);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (prompt === "ping") {
      return new Response(JSON.stringify({ response: "pong" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const knowledgeBase = Array.isArray(body.knowledgeBase) ? (body.knowledgeBase as KnowledgeItem[]) : [];
    const userContext = typeof body.userContext === "string" ? body.userContext : "";
    const chatHistory = typeof body.chatHistory === "string" ? body.chatHistory : "";
    const mode = typeof body.mode === "string" ? body.mode : "tourist";
    const enableTools = body.enable_tools !== false; // opt-out

    // Tool-calling path
    if (enableTools && Deno.env.get("GEMINI_API_KEY")) {
      const ctx = buildAuthContext(req);
      const whatsappPhone = typeof body.whatsapp_phone === "string"
        ? body.whatsapp_phone.trim()
        : "";
      const fromWhatsApp = Boolean(whatsappPhone) && isInternalBotRequest(req);

      let userId = await resolveUserId(ctx);
      if (!userId && fromWhatsApp && whatsappPhone) {
        userId = await resolveUserIdByPhone(ctx, whatsappPhone);
      }

      const isAuthed = !!userId;
      const requestedAction = detectRequestedAction(prompt);

      // Short-circuit: se pediu ação e não está logado, evita gastar tool-call
      if (!isAuthed && requestedAction) {
        const acao = requestedAction;
        if (fromWhatsApp) {
          const msg =
            `Para ${acao === "cadastrar_evento" ? "cadastrar eventos" : acao === "reservar" ? "reservar passeios" : "concluir pagamentos"} pelo WhatsApp, vincule este número à sua conta:\n\n` +
            `1️⃣ Acesse: https://descubrams.com/descubrams/login\n` +
            `2️⃣ No perfil, salve o telefone *${whatsappPhone}* (mesmo do WhatsApp)\n` +
            `3️⃣ Envie *vincular* aqui no chat`;
          return new Response(
            JSON.stringify({ response: msg, whatsapp_link_required: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        const msg = acao === "cadastrar_evento"
          ? "Legal! Para cadastrar um evento oficial, preciso que você faça login primeiro — assim o admin sabe quem enviou e você acompanha a aprovação."
          : acao === "reservar"
            ? "Posso te ajudar a reservar! Só preciso que você entre na sua conta primeiro para vincular a reserva a você."
            : "Para concluir uma compra/pagamento, você precisa estar logado. Faça login e eu retomo daqui.";
        return new Response(
          JSON.stringify({ response: `${msg}\n\n[[REQUIRE_LOGIN:${acao}]]` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const contextContent = buildContextContent(knowledgeBase);
      const systemPrompt = mode === "cat"
        ? generateCATPrompt(contextContent, userContext)
        : generateTouristPrompt(contextContent, userContext, chatHistory);

      const toolRes = await runToolCallingConversation({
        prompt,
        systemPrompt,
        chatHistory,
        ctx,
        userAuthenticated: isAuthed,
      });

      if (toolRes.text) {
        return new Response(
          JSON.stringify({ response: toolRes.text, used_tools: toolRes.usedTools }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      // Se tool-calling não devolveu texto, cai no fluxo clássico
    }

    const geminiResponse = await generateGeminiResponse(prompt, {
      knowledgeBase,
      userContext,
      chatHistory,
      mode,
    });

    return new Response(JSON.stringify({ response: geminiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("❌ guata-ai: handler error:", message);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
