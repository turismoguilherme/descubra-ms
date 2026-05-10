import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { platformContentService } from '@/services/admin/platformContentService';
import {
  GUATA_LABS_CONTENT_KEYS,
  type GuataLabsContentKey,
} from '@/hooks/useGuataLabsContent';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

const BUCKET = 'tourism-images';

const IMAGE_FIELDS: { key: GuataLabsContentKey; label: string }[] = [
  { key: 'guata_navbar_logo_url', label: 'Logo no header (navbar)' },
  { key: 'guata_mascot_hero', label: 'Hero (grande ao lado do título)' },
  { key: 'guata_mascot_floating', label: 'Avatar flutuante (reserva — não usado na landing)' },
  { key: 'guata_mascot_about', label: 'Ilustração extra (reserva)' },
  { key: 'guata_mascot_404', label: 'Página de erro (reserva)' },
  { key: 'guata_mascot_cta', label: 'CTA / marketing (reserva)' },
];

const TEXT_FIELDS: { key: GuataLabsContentKey; label: string; rows?: number }[] = [
  { key: 'guata_brand_name', label: 'Nome da marca (navbar/footer)', rows: 1 },
  { key: 'guata_brand_tagline', label: 'Tagline curta', rows: 2 },
];

export default function MascotManagerTab() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadKey, setUploadKey] = useState<GuataLabsContentKey | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await platformContentService.getContent([...GUATA_LABS_CONTENT_KEYS]);
      const m: Record<string, string> = {};
      rows.forEach((r) => {
        m[r.content_key] = r.content_value ?? '';
      });
      setValues(m);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erro ao carregar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  const saveTexts = async () => {
    setSaving(true);
    try {
      for (const f of TEXT_FIELDS) {
        const v = values[f.key] ?? '';
        await platformContentService.upsertContent(f.key, v, 'text', 'Guatá Labs — landing');
      }
      toast({ title: 'Textos salvos' });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao salvar';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (key: GuataLabsContentKey, file: File) => {
    setUploadKey(key);
    try {
      const ext = file.name.split('.').pop() || 'webp';
      const path = `guata-labs/mascots/${key}-${uuidv4()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const url = data.publicUrl;
      await platformContentService.upsertContent(key, url, 'image', 'Guatá Labs — mascote');
      setField(key, url);
      toast({ title: 'Imagem enviada', description: key });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload falhou';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setUploadKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-guata-forest" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <AdminPageHeader
        title="Mascote Guatá"
        description="Imagens e textos da landing pública (Guatá Labs). URLs públicas no bucket tourism-images."
      />

      <Card>
        <CardHeader>
          <CardTitle>Imagens</CardTitle>
          <CardDescription>Envie PNG/WebP. Se vazio, a landing usa o logo Guatá Labs como fallback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {IMAGE_FIELDS.map(({ key, label }) => (
            <div key={key} className="space-y-2 border-b pb-4 last:border-0">
              <Label>{label}</Label>
              <div className="flex flex-wrap items-center gap-3">
                {values[key] ? (
                  <img src={values[key]} alt="" className="h-20 w-20 rounded-lg object-cover border" />
                ) : (
                  <span className="text-sm text-muted-foreground">Sem imagem (fallback automático)</span>
                )}
                <input
                  id={`guata-mascot-file-${key}`}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(key, f);
                    e.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadKey === key}
                  className="inline-flex items-center gap-2"
                  onClick={() => document.getElementById(`guata-mascot-file-${key}`)?.click()}
                >
                  {uploadKey === key ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Enviar arquivo
                </Button>
              </div>
              <Input
                value={values[key] || ''}
                onChange={(e) => setField(key, e.target.value)}
                placeholder="URL pública (opcional — colar CDN)"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={async () => {
                  try {
                    await platformContentService.upsertContent(
                      key,
                      values[key] || '',
                      'image',
                      'Guatá Labs — mascote'
                    );
                    toast({ title: 'URL salva', description: key });
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Erro';
                    toast({ title: msg, variant: 'destructive' });
                  }
                }}
              >
                Salvar URL
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Textos e mensagens</CardTitle>
          <CardDescription>Nome e tagline exibidos na navbar e no rodapé.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {TEXT_FIELDS.map(({ key, label, rows }) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={key}>{label}</Label>
              {rows && rows > 1 ? (
                <Textarea
                  id={key}
                  rows={rows}
                  value={values[key] || ''}
                  onChange={(e) => setField(key, e.target.value)}
                />
              ) : (
                <Input id={key} value={values[key] || ''} onChange={(e) => setField(key, e.target.value)} />
              )}
            </div>
          ))}
          <Button onClick={saveTexts} disabled={saving} className="mt-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salvar textos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
