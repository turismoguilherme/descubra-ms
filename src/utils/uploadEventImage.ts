import { supabase } from "@/integrations/supabase/client";

const BUCKET = "tourism-images";
const FOLDER = "event-logos";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export interface UploadImageResult {
  url?: string;
  error?: string;
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Faz upload de uma imagem (logo de evento) para o Storage e retorna a URL pública.
 * Usa o bucket público `tourism-images`. Requer usuário autenticado (policy de INSERT).
 */
export async function uploadEventLogo(file: File): Promise<UploadImageResult> {
  if (!file.type.startsWith("image/")) {
    return { error: "O arquivo precisa ser uma imagem (PNG, JPG, WEBP)." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "A imagem é muito grande. Envie uma imagem de até 5MB." };
  }

  const ext = EXT_BY_TYPE[file.type] ?? "png";
  const path = `${FOLDER}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return { error: uploadError.message || "Falha ao enviar a imagem." };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    return { error: "Não foi possível obter a URL da imagem." };
  }

  return { url: data.publicUrl };
}
