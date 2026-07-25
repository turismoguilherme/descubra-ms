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
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';

const COVER_MAX = 2 * 1024 * 1024;
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

async function uploadCover(file: File) {
  if (!COVER_MIME.includes(file.type)) throw new Error('Capa: use JPG, PNG ou WebP.');
  if (file.size > COVER_MAX) throw new Error('Capa acima de 2 MB.');
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `covers/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('guata-cartilhas').upload(path, file, {
    contentType: file.type,
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
  theme: 'pantanal',
  is_featured: true,
  is_active: true,
  status: 'coming_soon' as 'available' | 'coming_soon',
  openLink: '',
};

const GuataCartilhasManager = () => {
  const { toast } = useToast();
  const coverRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<GuataCartilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState('');

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

    const slug = slugify(form.title);
    if (!slug) {
      toast({ title: 'Título inválido', variant: 'destructive' });
      return;
    }

    const openLink = form.openLink.trim() || null;
    let status = form.status;
    if (status === 'available' && !openLink) {
      status = 'coming_soon';
      toast({
        title: 'Salva como Em breve',
        description: 'Para ficar Disponível/Abrir, informe o link da cartilha em Opções avançadas.',
      });
    }

    setSaving(true);
    try {
      let coverUrl: string | null = null;
      if (coverFile) coverUrl = await uploadCover(coverFile);

      const nextOrder = (items[items.length - 1]?.display_order ?? -1) + 1;
      const { error } = await supabase.from('guata_cartilhas').insert({
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        audience: form.audience.trim() || null,
        slug,
        theme: form.theme,
        status,
        is_featured: form.is_featured,
        is_active: form.is_active,
        cover_url: coverUrl,
        html_url: openLink,
        display_order: nextOrder,
      });
      if (error) throw new Error(error.message);

      setForm(emptyForm);
      setCoverFile(null);
      setShowAdvanced(false);
      if (coverRef.current) coverRef.current.value = '';
      toast({ title: 'Cartilha criada! Agora escolha home, ordem e se está Em breve.' });
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
    const item = items.find((i) => i.id === id);
    if (values.status === 'available' && item && !item.html_url && !values.html_url) {
      toast({
        title: 'Falta o link para abrir',
        description: 'Clique em “Definir link de abertura” antes de marcar como Disponível.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('guata_cartilhas').update(values).eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    load();
  };

  const saveOpenLink = async (item: GuataCartilha) => {
    const link = linkDraft.trim();
    if (!link) {
      toast({ title: 'Informe o link', variant: 'destructive' });
      return;
    }
    await patch(item.id, {
      html_url: link,
      status: item.status === 'coming_soon' ? 'coming_soon' : 'available',
    });
    setEditingLinkId(null);
    setLinkDraft('');
    toast({ title: 'Link salvo' });
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
        <p className="text-muted-foreground mt-1 max-w-3xl">
          Crie a cartilha aqui. Depois decida: aparece na home, ordem, visível no site e se está
          “Em breve” ou “Disponível” para abrir.
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
            <div className="md:col-span-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Sabores de MS"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="subtitle">Descrição (aparece na home)</Label>
              <Textarea
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                rows={2}
                placeholder="Texto curto para o card"
              />
            </div>
            <div>
              <Label htmlFor="audience">Público / selo</Label>
              <Input
                id="audience"
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                placeholder="Ex: Gastronomia"
              />
            </div>
            <div>
              <Label htmlFor="theme">Cor do card</Label>
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
              <Label>Capa (opcional)</Label>
              <Input
                ref={coverRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex flex-col gap-3 justify-end">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
                />
                <Label>Mostrar na home</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                />
                <Label>Visível no site</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.status === 'coming_soon'}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, status: v ? 'coming_soon' : 'available' }))
                  }
                />
                <Label>Em breve (ainda não abre)</Label>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Opções avançadas (só se já puder abrir a cartilha)
          </button>

          {showAdvanced && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
              <Label htmlFor="openLink">Link para abrir a cartilha</Label>
              <Input
                id="openLink"
                value={form.openLink}
                onChange={(e) => setForm((f) => ({ ...f, openLink: e.target.value }))}
                placeholder="/cartilhas/guata-capacita/index.html"
              />
              <p className="text-xs text-muted-foreground">
                Só preencha quando a cartilha já existir no site. Ex.: Guatá Capacita usa{' '}
                <code className="text-[11px]">/cartilhas/guata-capacita/index.html</code>
              </p>
            </div>
          )}

          <Button onClick={handleAdd} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Criar cartilha
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suas cartilhas — decida onde ficam</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-ms-pantanal-green" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma cartilha ainda. Crie a primeira acima.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const canOpen = item.status === 'available' && !!item.html_url;
                return (
                  <div key={item.id} className="p-4 border rounded-xl space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{item.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {item.subtitle || 'Sem descrição'}
                        </div>
                        <div className="text-xs mt-1">
                          {canOpen ? (
                            <span className="text-emerald-700 font-medium">Disponível para abrir</span>
                          ) : (
                            <span className="text-amber-700 font-medium">Em breve na home</span>
                          )}
                          {!item.html_url && (
                            <span className="text-muted-foreground"> · sem link de abertura</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <Switch
                            checked={item.is_active}
                            onCheckedChange={(v) => patch(item.id, { is_active: v })}
                          />
                          Visível
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Switch
                            checked={item.is_featured}
                            onCheckedChange={(v) => patch(item.id, { is_featured: v })}
                          />
                          Home
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Switch
                            checked={item.status === 'coming_soon'}
                            onCheckedChange={(v) =>
                              patch(item.id, { status: v ? 'coming_soon' : 'available' })
                            }
                          />
                          Em breve
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

                    {editingLinkId === item.id ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={linkDraft}
                          onChange={(e) => setLinkDraft(e.target.value)}
                          placeholder="/cartilhas/minha-cartilha/index.html"
                        />
                        <Button onClick={() => saveOpenLink(item)}>Salvar link</Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingLinkId(null);
                            setLinkDraft('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingLinkId(item.id);
                          setLinkDraft(item.html_url || '');
                        }}
                      >
                        {item.html_url ? 'Alterar link de abertura' : 'Definir link de abertura'}
                      </Button>
                    )}
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

export default GuataCartilhasManager;
