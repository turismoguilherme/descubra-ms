// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getGuataCarouselThumbnail, getGuataVideoProvider } from '@/utils/guataVideo';
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Video } from 'lucide-react';

const COVER_MAX_BYTES = 2 * 1024 * 1024;
const COVER_MIME = ['image/jpeg', 'image/png', 'image/webp'];

interface GuataVideo {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  display_order: number;
  is_active: boolean;
}

async function uploadGuataVideoCover(file: File): Promise<string> {
  if (!COVER_MIME.includes(file.type)) {
    throw new Error('Formato inválido. Use JPG, PNG ou WebP.');
  }
  if (file.size > COVER_MAX_BYTES) {
    throw new Error('Imagem acima de 2 MB. Reduza o tamanho e tente de novo.');
  }
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `guata-video-covers/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('tourism-images').upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('tourism-images').getPublicUrl(path);
  return data.publicUrl;
}

const GuataVideosManager = () => {
  const { toast } = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos] = useState<GuataVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', videoUrl: '' });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('guata_videos')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    } else {
      setVideos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const clearCover = () => {
    setCoverFile(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleAdd = async () => {
    if (!form.title.trim() || !form.videoUrl.trim()) {
      toast({ title: 'Preencha título e link do vídeo', variant: 'destructive' });
      return;
    }
    const provider = getGuataVideoProvider(form.videoUrl.trim());
    if (!provider) {
      toast({
        title: 'Link inválido',
        description: 'Use um link do YouTube ou um post/reel público do Instagram (instagram.com/reel/... ou /p/...).',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      let thumbnailUrl: string | null = null;
      if (coverFile) {
        try {
          thumbnailUrl = await uploadGuataVideoCover(coverFile);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          toast({ title: 'Erro no upload da capa', description: msg, variant: 'destructive' });
          return;
        }
      }

      const nextOrder = (videos[videos.length - 1]?.display_order ?? -1) + 1;
      const { error } = await supabase.from('guata_videos').insert({
        title: form.title.trim(),
        youtube_url: form.videoUrl.trim(),
        thumbnail_url: thumbnailUrl,
        display_order: nextOrder,
        is_active: true,
      });
      if (error) {
        toast({
          title: 'Erro ao salvar',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      setForm({ title: '', videoUrl: '' });
      clearCover();
      toast({ title: 'Vídeo adicionado!' });
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (v: GuataVideo) => {
    const { error } = await supabase
      .from('guata_videos')
      .update({ is_active: !v.is_active })
      .eq('id', v.id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    load();
  };

  const handleDelete = async (v: GuataVideo) => {
    if (!confirm(`Excluir o vídeo "${v.title}"?`)) return;
    const { error } = await supabase.from('guata_videos').delete().eq('id', v.id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Vídeo removido' });
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= videos.length) return;
    const a = videos[index];
    const b = videos[target];
    await supabase.from('guata_videos').update({ display_order: b.display_order }).eq('id', a.id);
    await supabase.from('guata_videos').update({ display_order: a.display_order }).eq('id', b.id);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Video className="w-7 h-7 text-ms-primary-blue" />
          Vídeos do Guatá
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os vídeos exibidos no carrossel da home do Descubra MS (YouTube ou Instagram).
        </p>
        <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
          O <strong>título</strong> e o <strong>texto</strong> da seção acima do carrossel: em{' '}
          <strong className="text-foreground">Conteúdo da plataforma</strong> (
          <code className="text-xs bg-muted px-1 rounded">/viajar/admin/viajar/content</code>
          ), selecione <strong>Descubra MS</strong> e a seção <strong>Vídeos do Guatá (home)</strong>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar novo vídeo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Pantanal ao amanhecer"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="url">Link do vídeo</Label>
              <Input
                id="url"
                placeholder="YouTube ou instagram.com/reel/... ou instagram.com/p/..."
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover">Capa do card (opcional)</Label>
            <Input
              id="cover"
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="cursor-pointer"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setCoverFile(f);
              }}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou WebP, máximo 2 MB. Se não enviar, o YouTube usa a capa oficial do vídeo; no Instagram o card
              usa um placeholder até você enviar uma imagem.
            </p>
            {coverPreview && (
              <div className="flex items-start gap-3 pt-2">
                <img src={coverPreview} alt="" className="h-24 w-auto max-w-[200px] rounded-md border object-cover" />
                <Button type="button" variant="outline" size="sm" onClick={clearCover}>
                  Remover imagem
                </Button>
              </div>
            )}
          </div>
          <Button type="button" onClick={handleAdd} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Adicionar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vídeos cadastrados ({videos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : videos.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Nenhum vídeo cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {videos.map((v, i) => {
                const mq = getGuataCarouselThumbnail(v.youtube_url, v.thumbnail_url, 'mq');
                const hq = getGuataCarouselThumbnail(v.youtube_url, v.thumbnail_url, 'hq');
                const thumb = mq || hq;
                const provider = getGuataVideoProvider(v.youtube_url);
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    {thumb ? (
                      <img src={thumb} alt={v.title} className="w-32 h-20 object-cover rounded" />
                    ) : (
                      <div className="w-32 h-20 bg-muted rounded flex flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground px-1 text-center">
                        <Video className="w-6 h-6 opacity-60" />
                        {provider === 'instagram' ? 'Instagram' : 'Sem capa'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{v.title}</p>
                      <span className="text-[10px] uppercase text-muted-foreground">{provider || '?'}</span>
                      <a
                        href={v.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:underline truncate block"
                      >
                        {v.youtube_url}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => move(i, 1)}
                        disabled={i === videos.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-2 px-2">
                        <Switch checked={v.is_active} onCheckedChange={() => handleToggle(v)} />
                        <span className="text-xs text-muted-foreground">
                          {v.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(v)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuataVideosManager;
