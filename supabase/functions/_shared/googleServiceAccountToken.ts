import * as jose from "npm:jose@5.9.6";

const DEFAULT_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

/**
 * Obtém access_token OAuth2 a partir de JSON de service account (campo private_key + client_email).
 */
export async function getAccessTokenFromServiceAccountJson(
  serviceAccountJson: string,
  scope: string = DEFAULT_SCOPE,
): Promise<string> {
  const sa = JSON.parse(serviceAccountJson) as {
    client_email?: string;
    private_key?: string;
  };
  if (!sa.client_email || !sa.private_key) {
    throw new Error("Service account JSON inválido: faltam client_email ou private_key");
  }

  const pkPem = sa.private_key.replace(/\\n/g, "\n");
  const algorithm = "RS256";
  const pk = await jose.importPKCS8(pkPem, algorithm);

  const jwt = await new jose.SignJWT({ scope })
    .setProtectedHeader({ alg: algorithm, typ: "JWT" })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(pk);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const body = await res.json().catch(() => ({})) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !body.access_token) {
    throw new Error(
      body.error_description || body.error || `Falha ao obter token OAuth (${res.status})`,
    );
  }

  return body.access_token;
}
