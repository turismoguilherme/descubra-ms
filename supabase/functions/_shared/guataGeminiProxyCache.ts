import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESPONSE_CACHE_MS = 24 * 60 * 60 * 1000;
const RESPONSE_CACHE_MAX = 120;
const memoryCache = new Map<string, { at: number; body: string }>();

function normalizeQuestion(q: string): string {
  return q.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function questionHashHex(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h) ^ text.charCodeAt(i);
  }
  return `djb2_${(h >>> 0).toString(16)}`;
}

export function proxyMemoryCacheKey(
  question: string,
  model: string,
  googleSearch: boolean,
): string {
  return `${normalizeQuestion(question)}|${model}|${googleSearch ? "g" : "n"}`;
}

export function proxyMemoryCacheGet(key: string): string | null {
  const e = memoryCache.get(key);
  if (!e || Date.now() - e.at > RESPONSE_CACHE_MS) {
    if (e) memoryCache.delete(key);
    return null;
  }
  return e.body;
}

export function proxyMemoryCacheSet(key: string, body: string): void {
  if (memoryCache.size >= RESPONSE_CACHE_MAX) {
    const first = memoryCache.keys().next().value;
    if (first) memoryCache.delete(first);
  }
  memoryCache.set(key, { at: Date.now(), body });
}

/** Persiste resposta no guata_response_cache (service role) para reuso entre usuários. */
export async function persistSharedGuataCache(
  question: string,
  answer: string,
): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key || !question.trim() || !answer.trim()) return;

  const admin = createClient(url, key);
  const normalized = normalizeQuestion(question);
  const questionHash = questionHashHex(normalized);
  const expiresAt = new Date(Date.now() + RESPONSE_CACHE_MS).toISOString();

  const { data: existing } = await admin
    .from("guata_response_cache")
    .select("id")
    .eq("question_hash", questionHash)
    .eq("cache_type", "shared")
    .eq("is_suggestion", false)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (existing?.id) {
    await admin
      .from("guata_response_cache")
      .update({
        answer,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return;
  }

  await admin.from("guata_response_cache").insert({
    question_hash: questionHash,
    question: question.trim().slice(0, 2000),
    answer,
    cache_type: "shared",
    is_suggestion: false,
    expires_at: expiresAt,
    used_count: 1,
  });
}
