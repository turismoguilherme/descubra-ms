/**
 * 🦦 GUATÁ SIMPLE EDGE SERVICE
 * Arquitetura original: web-rag (busca + Gemini) → fallback guata-ai → fallback local
 */

import { supabase } from "@/integrations/supabase/client";
import type { TrueApiQuery, TrueApiResponse } from "./guataTrueApiService";
import { MSKnowledgeBase } from "./search/msKnowledgeBase";
import { isGenericGuataFallback } from "./search/msKnowledgeTopics";
import { isGuataTransactionalIntent } from "@/utils/guataTransactionalIntent";

interface WebRagResult {
  answer?: string;
  confidence?: number;
  sources: Array<{ title?: string; snippet?: string; link?: string; source?: string }>;
  geminiStatus?: string;
}

const RAG_ERROR_ANSWER_PATTERNS = [
  /muitas consultas/i,
  /dificuldades técnicas/i,
  /não devolveu texto/i,
  /tente novamente em alguns instantes/i,
  /limite diário/i,
  /muitas requisições/i,
];

class GuataSimpleEdgeService {
  async processQuestion(query: TrueApiQuery): Promise<TrueApiResponse> {
    const startTime = Date.now();
    const question = String(query.question || "").trim();
    const rewritten = this.rewriteQuery(question, query.conversationHistory);

    if (isGuataTransactionalIntent(rewritten)) {
      const toolAnswer = await this.callGuataAi(rewritten, { sources: [] }, query, true);
      if (
        toolAnswer?.trim() &&
        !this.isErrorAnswer(toolAnswer) &&
        !isGenericGuataFallback(toolAnswer)
      ) {
        const answer = this.sanitizeAnswer(toolAnswer, query);
        return this.toResponse(answer, { sources: [] }, startTime, false, "transactional");
      }
    }

    const rag = await this.fetchWebContext(rewritten, query);

    if (this.isUsableRagAnswer(rag)) {
      const answer = this.sanitizeAnswer(rag.answer!, query);
      return this.toResponse(answer, rag, startTime, true);
    }

    const aiAnswer = await this.callGuataAi(rewritten, rag, query);
    if (
      aiAnswer?.trim() &&
      !this.isErrorAnswer(aiAnswer) &&
      !isGenericGuataFallback(aiAnswer)
    ) {
      const answer = this.sanitizeAnswer(aiAnswer, query);
      return this.toResponse(answer, rag, startTime, rag.sources.length > 0);
    }

    if (rag.sources.length > 0) {
      const summary = this.summarizeSources(rag.sources);
      const followup = this.clarifyingQuestion(question);
      return this.toResponse(`${summary}\n\n${followup}`, rag, startTime, true);
    }

    const kbAnswer = this.knowledgeFallback(question, rag.geminiStatus);
    const resp = this.toResponse(kbAnswer, rag, startTime, false);
    resp.learningInsights = {
      pipeline: "simple_edge",
      usedWeb: false,
      fallback: "knowledge_base",
      geminiStatus: rag.geminiStatus ?? "unknown",
    };
    return resp;
  }

  private rewriteQuery(prompt: string, history?: string[]): string {
    const tail = (history || []).slice(-3).join(" | ").trim();
    if (!tail) return prompt;
    const isShort = prompt.trim().length < 24;
    if (isShort || /isso|ali|lá|então|qual|quanto|quando|onde|como/i.test(prompt)) {
      return `${prompt} (contexto anterior: ${tail})`;
    }
    return prompt;
  }

  private async fetchWebContext(
    question: string,
    query: TrueApiQuery,
  ): Promise<WebRagResult> {
    try {
      const { data, error } = await supabase.functions.invoke("guata-web-rag", {
        body: {
          question,
          state_code: "MS",
          max_results: 5,
          include_sources: true,
          session_id: query.sessionId,
          user_id: query.userId,
          location: query.userLocation || "Mato Grosso do Sul",
          conversation_history: query.conversationHistory || [],
        },
      });

      if (error) {
        console.warn("[Guatá] guata-web-rag erro:", error.message);
        return { sources: [], geminiStatus: "invoke_error" };
      }

      const sources = (data?.sources || []).map((s: Record<string, unknown>) => ({
        title: String(s.title || "Fonte"),
        snippet: String(s.snippet || s.content || ""),
        link: String(s.link || ""),
        source: String(s.source || "web"),
      }));

      const geminiStatus = data?.guata_ai_meta?.gemini_status as string | undefined;

      return {
        answer: data?.answer ? String(data.answer) : undefined,
        confidence: typeof data?.confidence === "number" ? data.confidence : undefined,
        sources,
        geminiStatus,
      };
    } catch (err) {
      console.error("[Guatá] falha ao chamar guata-web-rag:", err);
      return { sources: [] };
    }
  }

  private async callGuataAi(
    prompt: string,
    rag: WebRagResult,
    query: TrueApiQuery,
    forceTools = false,
  ): Promise<string | null> {
    const knowledgeBase = [
      ...rag.sources.map((s, i) => ({
        id: `web-${i}`,
        title: s.title || "Fonte web",
        content: s.snippet || "",
        source: s.source || "web",
        lastUpdated: new Date().toISOString(),
      })),
      ...(rag.answer && this.isUsableRagAnswer(rag)
        ? [{
            id: "rag-answer",
            title: "Contexto consolidado",
            content: rag.answer,
            source: "rag",
            lastUpdated: new Date().toISOString(),
          }]
        : []),
    ];

    try {
      const { data, error } = await supabase.functions.invoke("guata-ai", {
        body: {
          prompt,
          knowledgeBase,
          userContext: query.userLocation ? `Localização: ${query.userLocation}` : "",
          chatHistory: (query.conversationHistory || []).slice(-6).join("\n"),
          mode: "tourist",
          enable_tools: true,
          user_authenticated: query.userId && query.userId !== "convidado" && query.userId !== "publico",
          force_tools: forceTools,
        },
      });

      if (error) throw error;
      const text = data?.response || data?.answer;
      return text && String(text).trim() ? String(text).trim() : null;
    } catch (err) {
      console.warn("[Guatá] guata-ai fallback falhou:", err);
      return null;
    }
  }

  private isErrorAnswer(text: string): boolean {
    const t = text.trim().toLowerCase();
    if (!t) return true;
    return RAG_ERROR_ANSWER_PATTERNS.some((p) => p.test(t));
  }

  private isUsableRagAnswer(rag: WebRagResult): boolean {
    if (!rag.answer || rag.answer.trim().length < 15) return false;
    const badStatus = rag.geminiStatus && rag.geminiStatus !== "ok";
    if (badStatus) return false;
    return !this.isErrorAnswer(rag.answer);
  }

  /** Remove markdown pesado e auto-apresentação repetida após a 1ª mensagem */
  private sanitizeAnswer(answer: string, query: TrueApiQuery): string {
    let text = String(answer).trim();
    text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
    text = text.replace(/\*([^*]+)\*/g, "$1");

    const skipGreeting =
      query.isFirstUserMessage === false ||
      ((query.conversationHistory?.length ?? 0) > 0 && !query.isTotemVersion);

    if (skipGreeting) {
      text = text.replace(
        /^🦦?\s*(Olá|Oi|Ola)[!.]?\s*(Eu sou o Guatá[^.!?]*[.!?]\s*)+/i,
        "",
      ).trim();
    }

    return text;
  }

  private summarizeSources(
    sources: WebRagResult["sources"],
  ): string {
    const top = sources.slice(0, 3);
    const lines = top.map((s, i) => {
      const title = s.title || `Referência ${i + 1}`;
      const snippet = s.snippet ? ` — ${s.snippet.slice(0, 120)}` : "";
      return `• ${title}${snippet}`;
    });
    return `Encontrei algumas referências que podem ajudar:\n${lines.join("\n")}`;
  }

  private clarifyingQuestion(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (/bonito|gruta|flutua/i.test(lower)) {
      return "Quer saber sobre passeios, preços ou como chegar em Bonito?";
    }
    if (/pantanal|safari|onça/i.test(lower)) {
      return "Prefere melhor época, lodges ou tempo de estadia no Pantanal?";
    }
    if (/campo grande|feira|mercad/i.test(lower)) {
      return "Quer dicas de onde comer, o que visitar ou um roteiro em Campo Grande?";
    }
    if (/evento|agenda|festival/i.test(lower)) {
      return "Quer eventos deste fim de semana ou dos próximos 30 dias?";
    }
    return "Me conta se você busca natureza, cultura ou gastronomia — e quantos dias pretende ficar.";
  }

  /** Base local + mensagem honesta se a IA estiver limitada */
  private knowledgeFallback(question: string, geminiStatus?: string): string {
    const kb = MSKnowledgeBase.answerForQuestion(question);
    if (kb) return kb;

    const q = question.toLowerCase().trim();
    if (/^(oi|olá|ola|hey|bom dia|boa tarde|boa noite)[\s!.,?]*$/i.test(q)) {
      return "Oi! Sou o Guatá, sua capivara guia de MS. Quer falar de destinos, gastronomia ou montar um roteiro?";
    }
    if (q.includes("bonito")) {
      return "Bonito é a capital do ecoturismo — águas cristalinas, Gruta do Lago Azul e Rio da Prata são imperdíveis. Quer detalhes de algum passeio?";
    }
    if (q.includes("pantanal")) {
      return "O Pantanal é o maior santuário de vida selvagem das Américas. A melhor época para observação é maio a setembro. Quer saber como chegar ou onde ficar?";
    }
    if (q.includes("campo grande")) {
      return "Campo Grande, a Cidade Morena, tem Feira Central, Parque das Nações Indígenas e Mercadão Municipal. O que você quer explorar primeiro?";
    }

    const iaLimitada = geminiStatus && geminiStatus !== "ok";
    if (iaLimitada) {
      return (
        "A busca com IA está temporariamente limitada, mas posso te ajudar com destinos, gastronomia, roteiros e turismo comunitário em MS. " +
        "Reformula a pergunta com uma cidade ou tema (ex.: Bonito, Pantanal, comida típica)?"
      );
    }
    return "Posso te ajudar com destinos, gastronomia e roteiros em Mato Grosso do Sul. Sobre o que você quer saber?";
  }

  private toResponse(
    answer: string,
    rag: WebRagResult,
    startTime: number,
    usedWeb: boolean,
    pipeline: "simple_edge" | "transactional" = "simple_edge",
  ): TrueApiResponse {
    return {
      answer,
      confidence: rag.confidence ?? (usedWeb ? 0.85 : 0.65),
      sources: rag.sources.map((s) => s.source || s.title || "web").filter(Boolean),
      processingTime: Date.now() - startTime,
      learningInsights: { pipeline, usedWeb },
      adaptiveImprovements: [],
      memoryUpdates: [],
      personality: "Guatá",
      emotionalState: "helpful",
      followUpQuestions: [],
      usedWebSearch: usedWeb,
      knowledgeSource: usedWeb ? "hybrid" : "local",
      partnerSuggestion: undefined,
      partnersFound: [],
      partnerPriority: 0,
    };
  }
}

export const guataSimpleEdgeService = new GuataSimpleEdgeService();
