import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/authGuard.ts';
import { getAuthUserFromRequest } from '../_shared/getAuthUserFromRequest.ts';

const MAX_BYTES = 10 * 1024 * 1024;
const POLICY_KEY_RE = /^[a-z][a-z0-9_]*$/;

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

async function canUploadPolicyPdf(userId: string): Promise<boolean> {
  const admin = serviceClient();

  try {
    const { data, error } = await admin.rpc('can_manage_site_media', { _uid: userId });
    if (!error && data === true) return true;
  } catch {
    /* função pode não existir em projetos antigos */
  }

  const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', userId);
  const roleList = (roles ?? []).map((r) => r.role);
  if (roleList.some((r) => ['admin', 'tech', 'master_admin'].includes(r))) return true;

  const { data: employee } = await admin
    .from('viajar_employees')
    .select('user_id, is_active')
    .eq('user_id', userId)
    .maybeSingle();
  return !!employee && employee.is_active !== false;
}

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, cors);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const { user } = await getAuthUserFromRequest(authHeader, supabaseUrl);
  if (!user?.id) {
    return json({ error: 'Não autenticado' }, 401, cors);
  }

  if (!(await canUploadPolicyPdf(user.id))) {
    return json({ error: 'Sem permissão para enviar PDF de políticas' }, 403, cors);
  }

  let policyKey: string;
  let fileBytes: Uint8Array;
  let contentType = 'application/pdf';

  const contentTypeHeader = req.headers.get('content-type') ?? '';
  if (contentTypeHeader.includes('multipart/form-data')) {
    const form = await req.formData();
    policyKey = String(form.get('policyKey') ?? '').trim();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return json({ error: 'Campo file é obrigatório' }, 400, cors);
    }
    if (file.size > MAX_BYTES) {
      return json({ error: 'Arquivo muito grande (máx. 10MB)' }, 400, cors);
    }
    contentType = file.type || 'application/pdf';
    fileBytes = new Uint8Array(await file.arrayBuffer());
  } else {
    const body = await req.json().catch(() => ({}));
    policyKey = String(body?.policyKey ?? '').trim();
    const b64 = String(body?.pdfBase64 ?? '');
    if (!b64) {
      return json({ error: 'pdfBase64 ou multipart file é obrigatório' }, 400, cors);
    }
    const clean = b64.includes(',') ? b64.split(',').pop()! : b64;
    try {
      const bin = atob(clean);
      fileBytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) fileBytes[i] = bin.charCodeAt(i);
    } catch {
      return json({ error: 'pdfBase64 inválido' }, 400, cors);
    }
    if (fileBytes.length > MAX_BYTES) {
      return json({ error: 'Arquivo muito grande (máx. 10MB)' }, 400, cors);
    }
    if (body?.contentType) contentType = String(body.contentType);
  }

  if (!POLICY_KEY_RE.test(policyKey)) {
    return json({ error: 'policyKey inválido' }, 400, cors);
  }

  const objectPath = `policy-pdfs/${policyKey}-${Date.now()}.pdf`;
  const admin = serviceClient();
  const { error: upErr } = await admin.storage.from('documents').upload(objectPath, fileBytes, {
    contentType,
    upsert: true,
  });
  if (upErr) {
    console.error('[admin-policy-pdf-upload]', upErr);
    return json({ error: upErr.message ?? 'Falha no Storage' }, 500, cors);
  }

  const { data: urlData } = admin.storage.from('documents').getPublicUrl(objectPath);
  const publicUrl = urlData?.publicUrl ?? '';
  if (!publicUrl) {
    return json({ error: 'URL pública vazia' }, 500, cors);
  }

  return json({ publicUrl, objectPath }, 200, cors);
});
