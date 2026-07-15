// Auth helper shared by Guatá tool-calling flow
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface GuataAuthContext {
  userId: string | null;
  authHeader: string | null;
  supabaseUser: SupabaseClient; // client scoped to the caller (RLS as user)
  supabaseAdmin: SupabaseClient; // service-role client (RLS bypass, use with care)
}

export function buildAuthContext(req: Request): GuataAuthContext {
  const authHeader = req.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: authHeader ? { headers: { Authorization: authHeader } } : {},
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return { userId: null, authHeader, supabaseUser, supabaseAdmin };
}

export function isInternalBotRequest(req: Request): boolean {
  const secret = Deno.env.get("GUATA_BOT_INTERNAL_SECRET") ||
    Deno.env.get("DESCUBRA_WEBHOOK_SECRET");
  if (!secret) return false;
  const auth = req.headers.get("Authorization") || "";
  return auth === `Bearer ${secret}`;
}

/** Dígitos BR: 55 + DDD + número (ex.: 5567999212361). */
export function normalizeBrazilPhoneDigits(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

export async function resolveUserId(ctx: GuataAuthContext): Promise<string | null> {
  if (!ctx.authHeader?.startsWith("Bearer ")) return null;
  const token = ctx.authHeader.slice(7);
  const botSecret = Deno.env.get("GUATA_BOT_INTERNAL_SECRET") ||
    Deno.env.get("DESCUBRA_WEBHOOK_SECRET");
  // Token interno do bot não é JWT de usuário
  if (botSecret && token === botSecret) return null;
  try {
    const { data, error } = await ctx.supabaseUser.auth.getClaims(token);
    if (error || !data?.claims?.sub) return null;
    ctx.userId = String(data.claims.sub);
    return ctx.userId;
  } catch (_err) {
    return null;
  }
}

/** D1 WhatsApp: vincula número ao user_profiles.phone (mesmo projeto). */
export async function resolveUserIdByPhone(
  ctx: GuataAuthContext,
  phoneRaw: string,
): Promise<string | null> {
  const target = normalizeBrazilPhoneDigits(phoneRaw);
  if (!target || target.length < 12) return null;

  const last9 = target.slice(-9);
  const { data, error } = await ctx.supabaseAdmin
    .from("user_profiles")
    .select("user_id, phone")
    .not("phone", "is", null)
    .ilike("phone", `%${last9}`)
    .limit(20);

  if (error || !data?.length) return null;

  for (const row of data) {
    const normalized = normalizeBrazilPhoneDigits(row.phone);
    if (
      normalized === target ||
      (normalized.length >= 9 && target.endsWith(normalized.slice(-9)))
    ) {
      ctx.userId = row.user_id;
      return row.user_id;
    }
  }
  return null;
}

const WRITE_RATE_LIMIT_PER_HOUR = 5;

export async function checkWriteRateLimit(
  ctx: GuataAuthContext,
  toolName: string,
): Promise<{ ok: boolean; used: number }> {
  if (!ctx.userId) return { ok: false, used: 0 };
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await ctx.supabaseAdmin
    .from("guata_action_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .eq("status", "success")
    .gte("created_at", since)
    .in("tool_name", ["create_event_draft", "create_reservation", "create_checkout_link"]);
  const used = count ?? 0;
  return { ok: used < WRITE_RATE_LIMIT_PER_HOUR, used };
}

export async function logAction(
  ctx: GuataAuthContext,
  toolName: string,
  input: unknown,
  output: unknown,
  status: "success" | "error" | "rate_limited",
  errorMessage?: string,
): Promise<void> {
  if (!ctx.userId) return;
  try {
    await ctx.supabaseAdmin.from("guata_action_logs").insert({
      user_id: ctx.userId,
      tool_name: toolName,
      input: input ?? {},
      output: output ?? null,
      status,
      error_message: errorMessage ?? null,
    });
  } catch (err) {
    console.warn("[guataAuth] failed to log action:", err);
  }
}
