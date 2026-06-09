import { getAccessTokenFromServiceAccountJson } from "./googleServiceAccountToken.ts";

export interface GuataWebSearchHit {
  title: string;
  snippet: string;
  url: string;
  source: string;
  description?: string;
}

export interface WebSearchPipelineConfig {
  geminiApiKey?: string;
  geminiModel: string;
  /** Mínimo de hits do Vertex antes de pular Gemini (só Vertex preenche bem a lista). */
  vertexMinBeforeSkipGemini: number;
  serviceAccountJson?: string;
  gcpProject?: string;
  vertexLocation: string;
  /** Resource completo, ex.: projects/.../dataStores/.../servingConfigs/default_search */
  vertexServingConfigResource?: string;
  vertexDataStoreId?: string;
  vertexEngineId?: string;
  /** Ex.: default_search ou default_serving_config (depende do app no Console). */
  vertexServingConfigId?: string;
  legacyApiKey?: string;
  legacyEngineId?: string;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeUrlKey(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    let path = u.pathname.replace(/\/+$/, "") || "/";
    return `${u.hostname.toLowerCase()}${path}`.toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

/** Prioriza fontes oficiais MS / governo. */
export function officialSourceScore(url: string): number {
  const h = url.toLowerCase();
  if (h.includes("turismo.ms.gov.br")) return 100;
  if (h.includes("ms.gov.br") || h.endsWith(".gov.br")) return 80;
  if (h.includes("descubrams.com") || h.includes("viajartur.com")) return 40;
  return 0;
}

export function mergeDedupeRank(
  primary: GuataWebSearchHit[],
  secondary: GuataWebSearchHit[],
  maxResults: number,
): GuataWebSearchHit[] {
  const seen = new Set<string>();
  const out: GuataWebSearchHit[] = [];

  const push = (r: GuataWebSearchHit) => {
    const k = normalizeUrlKey(r.url);
    if (!r.url || seen.has(k)) return;
    seen.add(k);
    out.push(r);
  };

  const sortedPrimary = [...primary].sort(
    (a, b) => officialSourceScore(b.url) - officialSourceScore(a.url),
  );
  for (const r of sortedPrimary) push(r);
  const sortedSecondary = [...secondary].sort(
    (a, b) => officialSourceScore(b.url) - officialSourceScore(a.url),
  );
  for (const r of sortedSecondary) push(r);

  return out.slice(0, maxResults);
}

function buildVertexServingConfigResource(env: {
  full?: string;
  project?: string;
  location: string;
  dataStoreId?: string;
  engineId?: string;
  servingConfigId: string;
}): string | null {
  if (env.full?.startsWith("projects/")) return env.full;
  if (!env.project) return null;
  const base =
    `projects/${env.project}/locations/${env.location}/collections/default_collection`;
  if (env.engineId) {
    return `${base}/engines/${env.engineId}/servingConfigs/${env.servingConfigId}`;
  }
  if (env.dataStoreId) {
    return `${base}/dataStores/${env.dataStoreId}/servingConfigs/${env.servingConfigId}`;
  }
  return null;
}

function extractDiscoveryHit(raw: Record<string, unknown>): GuataWebSearchHit | null {
  const doc = raw?.document as Record<string, unknown> | undefined;
  if (!doc) return null;
  const derived = (doc.derivedStructData ?? doc.structData) as
    | Record<string, unknown>
    | undefined;
  if (!derived) return null;
  const url = String(derived.link || derived.url || derived.uri || "").trim();
  if (!url) return null;
  const title = stripHtml(
    String(derived.title || derived.htmlTitle || derived.name || ""),
  );
  const snippet = stripHtml(
    String(derived.snippet || derived.htmlSnippet || derived.description || ""),
  );
  return {
    title: title || url,
    snippet,
    url,
    source: "vertex_search",
    description: snippet,
  };
}

export async function searchVertexDiscoveryEngine(
  accessToken: string,
  servingConfigResource: string,
  query: string,
  pageSize: number,
  quotaProjectId?: string,
): Promise<GuataWebSearchHit[]> {
  const url =
    `https://discoveryengine.googleapis.com/v1beta/${servingConfigResource}:search`;

  const userProject =
    quotaProjectId || servingConfigResource.split("/")[1] || "";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  if (userProject) headers["X-Goog-User-Project"] = userProject;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      pageSize,
      languageCode: "pt-BR",
      regionCode: "BR",
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Vertex Search HTTP error:", res.status, text.slice(0, 500));
    return [];
  }

  let data: { results?: unknown[] };
  try {
    data = JSON.parse(text) as { results?: unknown[] };
  } catch {
    return [];
  }

  const hits: GuataWebSearchHit[] = [];
  for (const item of data.results || []) {
    const h = extractDiscoveryHit(item as Record<string, unknown>);
    if (h) hits.push(h);
  }
  return hits;
}

type GeminiCandidate = {
  content?: { parts?: Array<{ text?: string }> };
  groundingMetadata?: {
    groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
  };
};

function hitsFromGeminiCandidate(
  candidate: GeminiCandidate | undefined,
  userQuery: string,
  source: string,
): GuataWebSearchHit[] {
  const chunks = candidate?.groundingMetadata?.groundingChunks || [];
  const hits: GuataWebSearchHit[] = [];
  for (const c of chunks) {
    const uri = c.web?.uri?.trim();
    if (!uri) continue;
    hits.push({
      title: stripHtml(c.web?.title || uri) || uri,
      snippet: "",
      url: uri,
      source,
      description: "",
    });
  }

  const answerText = (candidate?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join(" ")
    .trim();

  if (hits.length === 0 && answerText) {
    const urlMatches = answerText.match(/https?:\/\/[^\s)\]"']+/g) ?? [];
    const seen = new Set<string>();
    for (const uri of urlMatches) {
      const key = normalizeUrlKey(uri);
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        title: uri,
        snippet: answerText.slice(0, 280),
        url: uri,
        source,
        description: answerText.slice(0, 280),
      });
      if (hits.length >= 5) break;
    }
    if (hits.length === 0 && answerText.length > 80) {
      hits.push({
        title: `Pesquisa: ${userQuery.slice(0, 100)}`,
        snippet: answerText.slice(0, 500),
        url: "https://turismo.ms.gov.br",
        source: `${source}_text`,
        description: answerText.slice(0, 500),
      });
    }
  }

  return hits;
}

async function callGeminiGenerate(
  apiKey: string,
  model: string,
  prompt: string,
  useGoogleSearch: boolean,
): Promise<{ ok: boolean; status: number; data?: { candidates?: GeminiCandidate[] }; raw?: string }> {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };
  if (useGoogleSearch) {
    body.tools = [{ google_search: {} }];
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, raw };
  }
  try {
    return { ok: true, status: res.status, data: JSON.parse(raw) };
  } catch {
    return { ok: false, status: res.status, raw };
  }
}

/** Fallback sem google_search quando grounding estoura quota. */
export async function searchGeminiTextFallback(
  apiKey: string,
  model: string,
  userQuery: string,
  locationContext: string,
): Promise<GuataWebSearchHit[]> {
  const prompt =
    `Você pesquisa turismo em ${locationContext}, Brasil. ` +
    `Responda em português, de forma factual e específica sobre: ${userQuery}. ` +
    `Mencione programas oficiais, destinos e fontes .gov.br quando souber.`;

  const result = await callGeminiGenerate(apiKey, model, prompt, false);
  if (!result.ok || !result.data) {
    console.error("Gemini text fallback HTTP error:", result.status, result.raw?.slice(0, 400));
    return [];
  }
  return hitsFromGeminiCandidate(
    result.data.candidates?.[0],
    userQuery,
    "gemini_text_fallback",
  );
}

export async function searchGeminiGoogleGrounding(
  apiKey: string,
  model: string,
  userQuery: string,
  locationContext: string,
): Promise<GuataWebSearchHit[]> {
  const prompt =
    `Contexto: turismo em ${locationContext}, Brasil. ` +
    `Use pesquisa na web e cite fontes confiáveis (.gov.br quando existir). ` +
    `Consulta: ${userQuery}`;

  const result = await callGeminiGenerate(apiKey, model, prompt, true);
  if (!result.ok) {
    const quotaHit =
      result.status === 429 ||
      (result.raw ?? "").toLowerCase().includes("quota") ||
      (result.raw ?? "").toLowerCase().includes("resource_exhausted");
    console.error("Gemini grounding HTTP error:", result.status, result.raw?.slice(0, 400));
    if (quotaHit) {
      console.warn("Gemini grounding quota — tentando fallback textual sem google_search");
      return searchGeminiTextFallback(apiKey, model, userQuery, locationContext);
    }
    return [];
  }

  const hits = hitsFromGeminiCandidate(
    result.data?.candidates?.[0],
    userQuery,
    "gemini_google_search",
  );
  if (hits.length === 0) {
    return searchGeminiTextFallback(apiKey, model, userQuery, locationContext);
  }
  return hits;
}

export type LegacyCseResult = {
  hits: GuataWebSearchHit[];
  error?: string;
  httpStatus?: number;
};

export async function searchLegacyCustomSearch(
  apiKey: string,
  engineId: string,
  searchQuery: string,
  num: number,
): Promise<LegacyCseResult> {
  const url =
    `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${
      encodeURIComponent(searchQuery)
    }&num=${num}`;

  const response = await fetch(url, { method: "GET" });
  const text = await response.text();
  if (!response.ok) {
    let reason = `HTTP ${response.status}`;
    try {
      const err = JSON.parse(text) as {
        error?: { message?: string; errors?: Array<{ reason?: string }> };
      };
      reason = err.error?.message || reason;
      if (
        reason.toLowerCase().includes("api key not valid") ||
        reason.toLowerCase().includes("invalid api key")
      ) {
        reason = "API_KEY_INVALID";
      }
    } catch {
      // keep HTTP status
    }
    console.error("Legacy CSE error:", reason);
    return { hits: [], error: reason, httpStatus: response.status };
  }

  const data = JSON.parse(text) as {
    items?: Array<{ title?: string; snippet?: string; htmlSnippet?: string; link?: string }>;
  };
  if (!data?.items?.length) {
    return { hits: [] };
  }

  return {
    hits: data.items.map((item) => ({
      title: item.title || "",
      snippet: item.snippet || item.htmlSnippet || "",
      url: item.link || "",
      source: "google_cse",
      description: item.snippet || "",
    })).filter((x) => x.url),
  };
}

export interface PipelineRunResult {
  results: GuataWebSearchHit[];
  success: boolean;
  sourcesUsed: string[];
  error?: string;
  message?: string;
  help?: string;
  details?: Record<string, string>;
}

async function tryLegacyCsePair(
  apiKey: string | undefined,
  engineId: string | undefined,
  searchQuery: string,
  maxResults: number,
  label: string,
): Promise<{ hits: GuataWebSearchHit[]; source: string; error?: string }> {
  if (!apiKey || !engineId) {
    return { hits: [], source: label };
  }
  const legacy = await searchLegacyCustomSearch(
    apiKey,
    engineId,
    searchQuery,
    maxResults,
  );
  if (legacy.hits.length > 0) {
    return { hits: legacy.hits, source: label };
  }
  return { hits: [], source: label, error: legacy.error };
}

export async function runGuataWebSearchPipeline(
  query: string,
  location: string,
  maxResults: number,
  sanitize: (s: string, max?: number) => string,
  cfg: WebSearchPipelineConfig,
): Promise<PipelineRunResult> {
  const searchQuery = `${sanitize(query, 500)} ${sanitize(location, 100)} turismo`;
  const sourcesUsed: string[] = [];
  const providerErrors: Record<string, string> = {};
  const vertexHits: GuataWebSearchHit[] = [];
  const geminiHits: GuataWebSearchHit[] = [];
  let legacyHits: GuataWebSearchHit[] = [];

  // 1. Modo antigo: Google Custom Search primeiro (rápido, sem quota Gemini)
  const primaryLegacy = await tryLegacyCsePair(
    cfg.legacyApiKey,
    cfg.legacyEngineId,
    searchQuery,
    maxResults,
    "google_cse_legacy",
  );
  if (primaryLegacy.hits.length > 0) {
    legacyHits = primaryLegacy.hits;
    sourcesUsed.push(primaryLegacy.source);
  } else if (primaryLegacy.error) {
    providerErrors[primaryLegacy.source] = primaryLegacy.error;
  }

  const servingResource = buildVertexServingConfigResource({
    full: cfg.vertexServingConfigResource,
    project: cfg.gcpProject,
    location: cfg.vertexLocation,
    dataStoreId: cfg.vertexDataStoreId,
    engineId: cfg.vertexEngineId,
    servingConfigId: cfg.vertexServingConfigId || "default_search",
  });

  const canVertex = Boolean(
    cfg.serviceAccountJson && servingResource,
  );

  // 2. Vertex AI Search (se CSE não trouxe resultados suficientes)
  if (legacyHits.length < maxResults && canVertex && cfg.serviceAccountJson && servingResource) {
    try {
      const token = await getAccessTokenFromServiceAccountJson(
        cfg.serviceAccountJson,
      );
      const v = await searchVertexDiscoveryEngine(
        token,
        servingResource,
        searchQuery,
        Math.min(25, Math.max(maxResults, 10)),
        cfg.gcpProject,
      );
      vertexHits.push(...v);
      if (v.length) sourcesUsed.push("vertex_ai_search");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      providerErrors.vertex_ai_search = msg;
      console.error("Vertex AI Search falhou:", e);
    }
  }

  // 3. Gemini grounding (fallback quando CSE/Vertex insuficientes)
  const needGemini =
    Boolean(cfg.geminiApiKey) &&
    legacyHits.length + vertexHits.length < maxResults;

  if (cfg.geminiApiKey && needGemini) {
    const g = await searchGeminiGoogleGrounding(
      cfg.geminiApiKey,
      cfg.geminiModel,
      searchQuery,
      location,
    );
    geminiHits.push(...g);
    if (g.length) {
      const src = g[0]?.source?.startsWith("gemini_text")
        ? "gemini_text_fallback"
        : "gemini_google_search";
      sourcesUsed.push(src);
    } else {
      providerErrors.gemini_google_search = "empty_or_quota";
    }
  }

  let merged = mergeDedupeRank(
    mergeDedupeRank(legacyHits, vertexHits, maxResults),
    geminiHits,
    maxResults,
  );

  if (merged.length > 0) {
    return {
      results: merged.map((r) => ({
        ...r,
        title: sanitize(r.title, 200),
        snippet: sanitize(r.snippet, 500),
        url: sanitize(r.url, 500),
        description: sanitize(r.description || r.snippet, 500),
      })),
      success: true,
      sourcesUsed,
    };
  }

  const hasAnyProvider = Boolean(
    cfg.geminiApiKey || canVertex || cfg.legacyApiKey || cfg.legacyEngineId,
  );

  if (!hasAnyProvider) {
    return {
      results: [],
      success: false,
      sourcesUsed,
      error: "WEB_SEARCH_NOT_CONFIGURED",
      message:
        "Nenhum provedor de busca configurado. Defina GEMINI_API_KEY e/ou Vertex AI Search (GOOGLE_SERVICE_ACCOUNT_JSON + projeto + data store ou engine) no Supabase Secrets.",
      help:
        "Custom Search JSON API está indisponível para novos projetos; use Gemini (google_search) e/ou Vertex AI Search (Discovery Engine).",
    };
  }

  const cseInvalid = providerErrors.google_cse_legacy === "API_KEY_INVALID";
  return {
    results: [],
    success: false,
    sourcesUsed,
    error: cseInvalid ? "INVALID_API_KEY" : "NO_RESULTS",
    message: cseInvalid
      ? "Chave do Google Custom Search inválida ou expirada. Atualize GOOGLE_SEARCH_API_KEY nos Secrets do Supabase."
      : "Nenhum resultado retornado pelos provedores configurados (CSE / Vertex / Gemini).",
    help: cseInvalid
      ? "Google Cloud Console → APIs & Services → Credentials → crie/renove a API key com Custom Search API habilitada."
      : Object.keys(providerErrors).length
      ? `Falhas: ${Object.entries(providerErrors).map(([k, v]) => `${k}=${v}`).join(", ")}`
      : undefined,
    details: Object.keys(providerErrors).length ? providerErrors : undefined,
  };
}
