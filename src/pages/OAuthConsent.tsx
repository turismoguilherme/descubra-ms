// @ts-nocheck
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Tela de consentimento OAuth 2.1 (servidor de autorização Supabase).
 * Rota: /.lovable/oauth/consent?authorization_id=...
 */
export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Parâmetro authorization_id ausente.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/descubrams/login?redirect=${encodeURIComponent(next)}`;
        return;
      }
      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorizationId)
      : await supabase.auth.oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("O servidor de autorização não retornou um redirecionamento.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "o aplicativo";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Autorizar acesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">
              Não foi possível carregar esta solicitação: {error}
            </p>
          )}
          {!error && !details && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {!error && details && (
            <>
              <p className="text-sm">
                Conectar <strong>{clientName}</strong> à sua conta permite que ele use o Descubra MS
                como você (eventos, parceiros, passaporte e reservas).
              </p>
              <div className="flex gap-2">
                <Button disabled={busy} onClick={() => decide(true)} className="flex-1">
                  Autorizar
                </Button>
                <Button
                  disabled={busy}
                  variant="outline"
                  onClick={() => decide(false)}
                  className="flex-1"
                >
                  Recusar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
