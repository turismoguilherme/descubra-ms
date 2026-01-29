import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContentVersion } from '@/types/admin';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ContentPreviewTabs from '@/components/admin/ContentPreviewTabs';
import { supabase } from '@/integrations/supabase/client';

export default function ContentEditor() {
  const [contents, setContents] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentVersion | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('content_versions')
        .select('*')
        .eq('platform', 'descubra_ms')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setContents((data || []) as ContentVersion[]);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar conteúdos:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao carregar conteúdos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = contents.filter(content =>
    content.content_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Editor de Conteúdo</h2>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Edite textos e informações do Descubra MS. Use a busca para encontrar o conteúdo que deseja editar.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conteúdo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}</DialogTitle>
              <DialogDescription>
                {editingContent ? 'Atualize o conteúdo' : 'Crie um novo conteúdo editável'}
              </DialogDescription>
            </DialogHeader>
            <ContentForm
              content={editingContent}
              onSuccess={() => {
                setIsDialogOpen(false);
                setEditingContent(null);
                fetchContents();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca mais destacada */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Buscar Conteúdo
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite a chave ou parte do conteúdo que deseja editar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {filteredContents.length > 0 
                  ? `${filteredContents.length} conteúdo(s) encontrado(s)`
                  : 'Nenhum conteúdo encontrado com essa busca'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando conteúdos...</p>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-foreground font-medium">Nenhum conteúdo encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? 'Tente buscar com outros termos' : 'Crie um novo conteúdo para começar'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredContents.map((content) => (
                <div 
                  key={content.id} 
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">
                          {content.content_key}
                        </Badge>
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          {content.content_type}
                        </Badge>
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          v{content.version}
                        </Badge>
                        {content.is_published ? (
                          <Badge className="bg-green-500">✓ Publicado</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-300 text-amber-600 bg-amber-50">
                            Rascunho
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                        {content.content.substring(0, 150)}
                        {content.content.length > 150 && '...'}
                      </p>
                      {content.edited_by && (
                        <p className="text-xs text-muted-foreground">Editado por: {content.edited_by}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingContent(content);
                        setIsDialogOpen(true);
                      }}
                      className="flex-shrink-0"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
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
}

interface ContentFormProps {
  content: ContentVersion | null;
  onSuccess: () => void;
}

function ContentForm({ content, onSuccess }: ContentFormProps) {
  const [formData, setFormData] = useState({
    content_key: content?.content_key || '',
    content_type: content?.content_type || 'text',
    content: content?.content || '',
    is_published: content?.is_published || false,
  });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const { toast } = useToast();

  const fetchVersions = async () => {
    if (!content?.content_key) return;
    try {
      const { data, error } = await (supabase as any)
        .from('content_versions')
        .select('*')
        .eq('platform', 'descubra_ms')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const filtered = (data as ContentVersion[]).filter(v => v.content_key === content.content_key);
      setVersions(filtered.sort((a, b) => b.version - a.version));
    } catch (error) {
      console.error('Erro ao buscar versões:', error);
    }
  };

  useEffect(() => {
    if (content?.content_key) {
      fetchVersions();
    }
  }, [content?.content_key]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (content) {
        const { error } = await (supabase as any)
          .from('content_versions')
          .update({
            ...formData,
            version: content.version + 1,
          })
          .eq('id', content.id);
        
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Conteúdo salvo com sucesso' });
      } else {
        const { error } = await (supabase as any)
          .from('content_versions')
          .insert([{
            ...formData,
            platform: 'descubra_ms',
            version: 1,
            edited_by: null,
          }]);
        
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Conteúdo criado com sucesso' });
      }
      setHasChanges(false);
      onSuccess();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar conteúdo',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      if (content) {
        const { error } = await (supabase as any)
          .from('content_versions')
          .update({
            ...formData,
            version: content.version + 1,
            is_published: true,
          })
          .eq('id', content.id);
        
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('content_versions')
          .insert([{
            ...formData,
            platform: 'descubra_ms',
            version: 1,
            is_published: true,
            edited_by: null,
          }]);
        
        if (error) throw error;
      }
      toast({ title: 'Sucesso', description: 'Conteúdo publicado com sucesso' });
      setHasChanges(false);
      onSuccess();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao publicar conteúdo',
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  const renderPreview = () => {
    if (formData.content_type === 'html') {
      return <div dangerouslySetInnerHTML={{ __html: formData.content }} className="prose max-w-none" />;
    } else if (formData.content_type === 'markdown') {
      return <div className="prose max-w-none whitespace-pre-wrap">{formData.content}</div>;
    } else {
      return <div className="whitespace-pre-wrap text-foreground">{formData.content}</div>;
    }
  };

  return (
    <ContentPreviewTabs
      previewContent={renderPreview()}
      onSave={handleSave}
      onPublish={handlePublish}
      isSaving={saving}
      isPublishing={publishing}
      hasChanges={hasChanges}
    >
      <form className="space-y-6">
      <div>
        <Label htmlFor="content_key">Chave do Conteúdo</Label>
        <Input
          id="content_key"
          value={formData.content_key}
          onChange={(e) => {
            setFormData({ ...formData, content_key: e.target.value });
            setHasChanges(true);
          }}
          placeholder="ex: hero_title, footer_text"
          required
          disabled={!!content}
          className="border-border"
        />
        {content && <p className="text-xs text-muted-foreground mt-1">A chave não pode ser alterada após criação</p>}
      </div>
      <div>
        <Label htmlFor="content_type">Tipo</Label>
        <Select
          value={formData.content_type}
          onValueChange={(value) => {
            setFormData({ ...formData, content_type: value as 'text' | 'html' | 'markdown' });
            setHasChanges(true);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
        <div>
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => {
              setFormData({ ...formData, content: e.target.value });
              setHasChanges(true);
            }}
            rows={12}
            className="font-mono text-sm border-border"
            required
          />
        </div>

        {/* Histórico de Versões */}
        {versions.length > 0 && (
          <div>
            <Label>Histórico de Versões ({versions.length})</Label>
            <div className="max-h-64 overflow-y-auto border border-border rounded-md bg-card">
              <div className="divide-y divide-border">
                {versions.map((version) => (
                  <div key={version.id} className="p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-foreground">Versão {version.version}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(version.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <Badge variant={version.is_published ? 'default' : 'secondary'}>
                        {version.is_published ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {version.content.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </ContentPreviewTabs>
  );
}
