// @ts-nocheck
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { extractYoutubeId, getYoutubeThumbnail } from '@/utils/youtube';
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Video } from 'lucide-react';

interface GuataVideo {
  id: string;
  title: string;
  youtube_url: string;
  display_order: number;
  is_active: boolean;
}

const GuataVideosManager = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<GuataVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', youtube_url: '' });

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

  const handleAdd = async () => {
    if (!form.title.trim() || !form.youtube_url.trim()) {
      toast({ title: 'Preencha título e link', variant: 'destructive' });
      return;
    }
    if (!extractYoutubeId(form.youtube_url)) {
      toast({
        title: 'Link inválido',
        description: 'Cole um link válido do YouTube (ex: https://youtu.be/...).',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    const nextOrder = (videos[videos.length - 1]?.display_order ?? -1) + 1;
    const { error } = await supabase.from('guata_videos').insert({
      title: form.title.trim(),
      youtube_url: form.youtube_url.trim(),
      display_order: nextOrder,
      is_active: true,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    setForm({ title: '', youtube_url: '' });
    toast({ title: 'Vídeo adicionado!' });
    load();
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
          Gerencie os vídeos exibidos no carrossel da home do Descubra MS.
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
              <Label htmlFor="url">Link do YouTube</Label>
              <Input
                id="url"
                placeholder="https://youtu.be/... ou https://youtube.com/watch?v=..."
                value={form.youtube_url}
                onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={saving}>
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
                const thumb = getYoutubeThumbnail(v.youtube_url, 'mq');
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    {thumb ? (
                      <img src={thumb} alt={v.title} className="w-32 h-20 object-cover rounded" />
                    ) : (
                      <div className="w-32 h-20 bg-muted rounded flex items-center justify-center">
                        <Video className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{v.title}</p>
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
