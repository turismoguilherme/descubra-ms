// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';

const COVER_MAX = 2 * 1024 * 1024;
const HTML_MAX = 8 * 1024 * 1024;
const COVER_MIME = ['image/jpeg', 'image/png', 'image/webp'];

interface GuataCartilha {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  audience: string | null;
  theme: string;
  cover_url: string | null;
  html_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  status: 'available' | 'coming_soon';
  display_order: number;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

async function uploadFile(file: File, folder: string) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('guata-cartilhas').upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: true,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('guata-cartilhas').getPublicUrl(path);
  return data.publicUrl;
}

const emptyForm = {
  title: '',
  subtitle: '',
  audience: '',
  slug: '',
  theme: 'pantanal',
  status: 'available' as 'available' | 'coming_soon',
  is_featured: true,
  htmlPathManual: '',
};

const GuataCartilhasManager = () => {
  const { toast } = useToast();
  const coverRef = useRef<HTMLInputElement>(null);
  const htmlRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<GuataCartilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('guata_cartilhas')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Informe o título', variant: 'destructive' });
      return;
    }
    const slug = (form.slug.trim() || slugify(form.title)).trim();
    if (!slug) {
      toast({ title: 'Slug inválido', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      let coverUrl: string | null = null;
      let htmlUrl: string | null = form.htmlPathManual.trim() || null;

      if (coverFile) {
        if (!COVER_MIME.includes(coverFile.type)) throw new Error('Capa: use JPG, PNG ou WebP.');
        if (coverFile.size > COVER_MAX) throw new Error('Capa acima de 2 MB.');
        coverUrl = await uploadFile(coverFile, 'covers');
      }

      if (htmlFile) {
        if (htmlFile.size > HTML_MAX) throw new Error('HTML acima de 8 MB.');
        const typeOk =
          htmlFile.type === 'text/html' ||
          htmlFile.name.toLowerCase().endsWith('.html') ||
          htmlFile.name.toLowerCase().endsWith('.htm');
        if (!typeOk) throw new Error('Envie um arquivo .html');
        htmlUrl = await uploadFile(htmlFile, 'html');
      }

      if (form.status === 'available' && !htmlUrl) {
        toast({
          title: 'Cartilha disponível precisa de HTML',
          description: 'Envie o arquivo HTML ou informe o caminho (ex.: /cartilhas/minha/index.html).',
          variant: 'destructive',
        });
        return;
      }

      const nextOrder = (items[items.length - 1]?.display_order ?? -1) + 1;
      const { error } = await supabase.from('guata_cartilhas').insert({
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        audience: form.audience.trim() || null,
        slug,
        theme: form.theme,
        status: form.status,
        is_featured: form.is_featured,
        is_active: true,
        cover_url: coverUrl,
        html_url: htmlUrl,
        display_order: nextOrder,
      });
      if (error) throw new Error(error.message);

      setForm(emptyForm);
      setCoverFile(null);
      setHtmlFile(null);
      if (coverRef.current) coverRef.current.value = '';
      if (htmlRef.current) htmlRef.current.value = '';
      toast({ title: 'Cartilha adicionada!' });
      load();
    } catch (e) {
      toast({
        title: 'Erro ao salvar',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const patch = async (id: string, values: Partial<GuataCartilha>) => {
    const { error } = await supabase.from('guata_cartilhas').update(values).eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    load();
  };

  const handleDelete = async (item: GuataCartilha) => {
    if (!confirm(`Excluir a cartilha "${item.title}"?`)) return;
    const { error } = await supabase.from('guata_cartilhas').delete().eq('id', item.id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Cartilha removida' });
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    await supabase.from('guata_cartilhas').update({ display_order: b.display_order }).eq('id', a.id);
    await supabase.from('guata_cartilhas').update({ display_order: a.display_order }).eq('id', b.id);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-ms-pantanal-green" />
          Cartilhas do Guatá Capacita
        </h1>
        <p className="text-muted-foreground mt-1">
          Cadastre cartilhas para a home e a página /descubrams/cartilhas. Envie o HTML ou use um
          caminho já hospedado no site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova cartilha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title,
                    slug: f.slug ? f.slug : slugify(title),
                  }));
                }}
                placeholder="Ex: Guatá Capacita"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                placeholder="guata-capacita"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="subtitle">Descrição / subtítulo</Label>
              <Textarea
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="audience">Público</Label>
              <Input
                id="audience"
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                placeholder="Ex: Gastronomia"
              />
            </div>
            <div>
              <Label htmlFor="theme">Tema visual</Label>
              <select
                id="theme"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.theme}
                onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
              >
                <option value="pantanal">Verde Pantanal</option>
                <option value="terracotta">Terra Cota</option>
                <option value="blue">Azul Rio</option>
                <option value="amber">Ipê Amarelo</option>
                <option value="purple">Cerrado Violeta</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as 'available' | 'coming_soon',
                  }))
                }
              >
                <option value="available">Disponível</option>
                <option value="coming_soon">Em breve</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
              />
              <Label>Destaque na home</Label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Capa (opcional)</Label>
              <Input
                ref={coverRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label>Arquivo HTML da cartilha</Label>
              <Input
                ref={htmlRef}
                type="file"
                accept=".html,.htm,text/html"
                onChange={(e) => setHtmlFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="htmlPath">Ou caminho/URL do HTML já no site</Label>
            <Input
              id="htmlPath"
              value={form.htmlPathManual}
              onChange={(e) => setForm((f) => ({ ...f, htmlPathManual: e.target.value }))}
              placeholder="/cartilhas/guata-capacita/index.html"
            />
          </div>

          <Button onClick={handleAdd} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Salvar cartilha
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cartilhas cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-ms-pantanal-green" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma cartilha ainda.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center gap-3 p-4 border rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      /{item.slug} · {item.status === 'available' ? 'Disponível' : 'Em breve'} ·{' '}
                      {item.html_url || 'sem HTML'}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={(v) => patch(item.id, { is_active: v })}
                      />
                      Ativa
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Switch
                        checked={item.is_featured}
                        onCheckedChange={(v) => patch(item.id, { is_featured: v })}
                      />
                      Home
                    </div>
                    <Button size="icon" variant="outline" onClick={() => move(index, -1)}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => move(index, 1)}>
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(item)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuataCartilhasManager;
