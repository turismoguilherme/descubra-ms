/**
 * Busca contexto curado no Guatá Channel (PDF/FAQ). Falha silenciosa → caller usa FTS/PSE.
 */

export interface ChannelSearchResult {
  title: string;
  snippet: string;
  link: string;
  source: "api";
  confidence: number;
}

export async function fetchChannelKnowledge(
  query: string,
  options: { limit?: number; source?: "descubra-ms-web" | "whatsapp" } = {},
): Promise<ChannelSearchResult[]> {
  const apiUrl = (Deno.env.get("GUATA_CHANNEL_API_URL") || "").replace(/\/$/, "");
  const secret = Deno.env.get("DESCUBRA_WEBHOOK_SECRET") || "";
  const q = query.trim();
  if (!apiUrl || !secret || !q) return [];

  const timeoutMs = 4000;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${apiUrl}/api/knowledge/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        query: q,
        limit: options.limit ?? 8,
        locale: "pt-BR",
        source: options.source ?? "descubra-ms-web",
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`⚠️ Channel knowledge: HTTP ${res.status}`);
      return [];
    }

    const json = await res.json();
    const chunks = Array.isArray(json?.chunks) ? json.chunks : [];

    return chunks.map((c: Record<string, unknown>, i: number) => {
      const content = String(c.content ?? "");
      const title = String(c.title ?? `Guatá Channel (${i + 1})`);
      const docId = c.source_document_id ? String(c.source_document_id) : String(i);
      const score = typeof c.score === "number" ? c.score : 0.85;
      return {
        title,
        snippet: content.length > 320 ? `${content.slice(0, 320)}…` : content,
        link: `#guata-channel-${docId}`,
        source: "api" as const,
        confidence: Math.min(1, Math.max(0.5, score)),
      };
    });
  } catch (err) {
    console.warn("⚠️ Channel knowledge:", err instanceof Error ? err.message : err);
    return [];
  }
}
