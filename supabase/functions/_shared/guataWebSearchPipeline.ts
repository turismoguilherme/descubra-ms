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

export async function searchGeminiGoogleGrounding(
  apiKey: string,
  model: string,
  userQuery: string,
  locationContext: string,
): Promise<GuataWebSearchHit[]> {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt =
    `Contexto: turismo em ${locationContext}, Brasil. ` +
    `Use pesquisa na web e cite fontes confiáveis (.gov.br quando existir). ` +
    `Consulta: ${userQuery}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Gemini grounding HTTP error:", res.status, text.slice(0, 400));
    return [];
  }

  let data: {
    candidates?: Array<{
      groundingMetadata?: {
        groundingChunks?: Array<{
          web?: { uri?: string; title?: string };
        }>;
      };
    }>;
  };
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }

  const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const hits: GuataWebSearchHit[] = [];
  for (const c of chunks) {
    const uri = c.web?.uri?.trim();
    if (!uri) continue;
    hits.push({
      title: stripHtml(c.web?.title || uri) || uri,
      snippet: "",
      url: uri,
      source: "gemini_google_search",
      description: "",
    });
  }
  return hits;
}

export async function searchLegacyCustomSearch(
  apiKey: string,
  engineId: string,
  searchQuery: string,
  num: number,
): Promise<GuataWebSearchHit[]> {
  const url =
    `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${
      encodeURIComponent(searchQuery)
    }&num=${num}`;

  const response = await fetch(url, { method: "GET" });
  if (!response.ok) return [];

  const data = await response.json().catch(() => null) as {
    items?: Array<{ title?: string; snippet?: string; htmlSnippet?: string; link?: string }>;
  } | null;
  if (!data?.items) return [];

  return data.items.map((item) => ({
    title: item.title || "",
    snippet: item.snippet || item.htmlSnippet || "",
    url: item.link || "",
    source: "google_cse",
    description: item.snippet || "",
  })).filter((x) => x.url);
}

export interface PipelineRunResult {
  results: GuataWebSearchHit[];
  success: boolean;
  sourcesUsed: string[];
  error?: string;
  message?: string;
  help?: string;
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
  const vertexHits: GuataWebSearchHit[] = [];
  const geminiHits: GuataWebSearchHit[] = [];

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

  if (canVertex && cfg.serviceAccountJson && servingResource) {
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
      console.error("Vertex AI Search falhou:", e);
    }
  }

  const needGemini =
    Boolean(cfg.geminiApiKey) &&
    (vertexHits.length < cfg.vertexMinBeforeSkipGemini || !canVertex);

  if (cfg.geminiApiKey && needGemini) {
    const g = await searchGeminiGoogleGrounding(
      cfg.geminiApiKey,
      cfg.geminiModel,
      searchQuery,
      location,
    );
    geminiHits.push(...g);
    if (g.length) sourcesUsed.push("gemini_google_search");
  }

  let merged = mergeDedupeRank(vertexHits, geminiHits, maxResults);

  if (merged.length === 0 && cfg.legacyApiKey && cfg.legacyEngineId) {
    const legacy = await searchLegacyCustomSearch(
      cfg.legacyApiKey,
      cfg.legacyEngineId,
      searchQuery,
      maxResults,
    );
    merged = mergeDedupeRank(legacy, [], maxResults);
    if (legacy.length) sourcesUsed.push("google_cse_legacy");
  }

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

  if (!cfg.geminiApiKey && !canVertex && !cfg.legacyApiKey) {
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

  return {
    results: [],
    success: false,
    sourcesUsed,
    error: "NO_RESULTS",
    message:
      "Nenhum resultado retornado pelos provedores configurados (Vertex / Gemini / legado).",
  };
}
