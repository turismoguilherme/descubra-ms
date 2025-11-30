import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit, Eye, Save, History, EyeOff } from 'lucide-react';
import { descubraMSAdminService } from '@/services/admin/descubraMSAdminService';
import { useToast } from '@/hooks/use-toast';
import { ContentVersion } from '@/types/admin';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
      const data = await descubraMSAdminService.getContentVersions('descubra_ms');
      setContents(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar conteúdos',
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
          <h2 className="text-2xl font-bold text-gray-900">Editor de Conteúdo</h2>
          <p className="text-gray-600 mt-1">Edite textos e informações do Descubra MS</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conteúdo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chave</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Editado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum conteúdo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContents.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">{content.content_key}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{content.content_type}</Badge>
                      </TableCell>
                      <TableCell>v{content.version}</TableCell>
                      <TableCell>
                        <Badge variant={content.is_published ? 'default' : 'secondary'}>
                          {content.is_published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </TableCell>
                      <TableCell>{content.edited_by || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingContent(content);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
  const [showPreview, setShowPreview] = useState(false);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const { toast } = useToast();

  const fetchVersions = async () => {
    if (!content?.content_key) return;
    try {
      const data = await descubraMSAdminService.getContentVersions('descubra_ms');
      const filtered = data.filter(v => v.content_key === content.content_key);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (content) {
        await descubraMSAdminService.updateContentVersion(content.id, {
          ...formData,
          version: content.version + 1,
        });
        toast({ title: 'Sucesso', description: 'Conteúdo atualizado com sucesso' });
      } else {
        await descubraMSAdminService.createContentVersion({
          ...formData,
          platform: 'descubra_ms',
          version: 1,
          edited_by: null,
        });
        toast({ title: 'Sucesso', description: 'Conteúdo criado com sucesso' });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar conteúdo',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => {
    if (formData.content_type === 'html') {
      return <div dangerouslySetInnerHTML={{ __html: formData.content }} className="prose max-w-none p-4 border rounded-md bg-gray-50" />;
    } else if (formData.content_type === 'markdown') {
      return <div className="prose max-w-none p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">{formData.content}</div>;
    } else {
      return <div className="p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">{formData.content}</div>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="content_key">Chave do Conteúdo</Label>
        <Input
          id="content_key"
          value={formData.content_key}
          onChange={(e) => setFormData({ ...formData, content_key: e.target.value })}
          placeholder="ex: hero_title, footer_text"
          required
          disabled={!!content}
        />
        {content && <p className="text-xs text-gray-500 mt-1">A chave não pode ser alterada após criação</p>}
      </div>
      <div>
        <Label htmlFor="content_type">Tipo</Label>
        <Select
          value={formData.content_type}
          onValueChange={(value) => setFormData({ ...formData, content_type: value as any })}
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
      
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="edit">Editar</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="history">Histórico ({versions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-2">
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="font-mono text-sm"
              required
            />
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-2">
          <div>
            <Label>Preview</Label>
            {renderPreview()}
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-2">
          <div>
            <Label>Histórico de Versões</Label>
            <div className="max-h-64 overflow-y-auto border rounded-md">
              {versions.length === 0 ? (
                <p className="text-sm text-gray-500 p-4 text-center">Nenhuma versão anterior</p>
              ) : (
                <div className="divide-y">
                  {versions.map((version) => (
                    <div key={version.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">Versão {version.version}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(version.created_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <Badge variant={version.is_published ? 'default' : 'secondary'}>
                          {version.is_published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                        {version.content.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_published"
          checked={formData.is_published}
          onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="is_published">Publicar imediatamente</Label>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : content ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogFooter>
    </form>
  );
}
