import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export interface BudgetCheckResult {
  ok: boolean;
  reason?: "DAILY_BUDGET" | "RPC_ERROR";
  count?: number;
  max?: number;
}

let adminClient: SupabaseClient | null = null;

function getAdmin(): SupabaseClient | null {
  if (adminClient) return adminClient;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  adminClient = createClient(url, key);
  return adminClient;
}

export function getDailyBudgetMax(): number {
  const raw = Deno.env.get("GUATA_GEMINI_DAILY_BUDGET") ?? "300";
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 300;
}

/** Consome 1 unidade do orçamento diário global (SECURITY DEFINER no Postgres). */
export async function tryConsumeGeminiBudget(): Promise<BudgetCheckResult> {
  const admin = getAdmin();
  const max = getDailyBudgetMax();
  if (!admin) {
    console.warn("[guataGeminiBudget] Sem service role — orçamento não aplicado");
    return { ok: true, max };
  }

  const { data, error } = await admin.rpc("guata_try_consume_gemini_budget", {
    p_max: max,
  });

  if (error) {
    console.error("[guataGeminiBudget] RPC error:", error);
    return { ok: true, reason: "RPC_ERROR", max };
  }

  const row = data as { ok?: boolean; reason?: string; count?: number; max?: number };
  if (row?.ok === false && row.reason === "DAILY_BUDGET") {
    return {
      ok: false,
      reason: "DAILY_BUDGET",
      count: row.count,
      max: row.max ?? max,
    };
  }
  return { ok: true, count: row?.count, max: row?.max ?? max };
}
