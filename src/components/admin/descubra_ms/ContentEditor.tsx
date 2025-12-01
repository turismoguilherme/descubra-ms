import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Eye } from 'lucide-react';
import { descubraMSAdminService } from '@/services/admin/descubraMSAdminService';
import { useToast } from '@/hooks/use-toast';
import { ContentVersion } from '@/types/admin';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ContentPreviewTabs from '@/components/admin/ContentPreviewTabs';

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#0A0A0A]">Editor de Conteúdo</h2>
          <p className="text-[#6B7280] mt-1.5 text-sm">Edite textos e informações do Descubra MS</p>
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

      <Card className="bg-white border border-[#E5E5E5] shadow-sm">
        <CardHeader className="border-b border-[#E5E5E5]">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Buscar conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#E5E5E5] focus:border-[#3B82F6]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#E5E5E5] hover:bg-transparent">
                    <TableHead className="text-[#6B7280] font-medium">Chave</TableHead>
                    <TableHead className="text-[#6B7280] font-medium">Tipo</TableHead>
                    <TableHead className="text-[#6B7280] font-medium">Versão</TableHead>
                    <TableHead className="text-[#6B7280] font-medium">Status</TableHead>
                    <TableHead className="text-[#6B7280] font-medium">Editado por</TableHead>
                    <TableHead className="text-right text-[#6B7280] font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContents.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="text-center py-12 text-[#6B7280]">
                        Nenhum conteúdo encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContents.map((content) => (
                      <TableRow key={content.id} className="border-b border-[#E5E5E5] hover:bg-[#FAFAFA]">
                        <TableCell className="font-medium text-[#0A0A0A]">{content.content_key}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#E5E5E5] text-[#6B7280]">{content.content_type}</Badge>
                        </TableCell>
                        <TableCell className="text-[#6B7280]">v{content.version}</TableCell>
                        <TableCell>
                          <Badge variant={content.is_published ? 'default' : 'secondary'}>
                            {content.is_published ? 'Publicado' : 'Rascunho'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#6B7280]">{content.edited_by || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingContent(content);
                                setIsDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-[#FAFAFA]"
                            >
                              <Edit className="h-4 w-4 text-[#6B7280]" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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

  const handleSave = async () => {
    setSaving(true);
    try {
      if (content) {
        await descubraMSAdminService.updateContentVersion(content.id, {
          ...formData,
          version: content.version + 1,
        });
        toast({ title: 'Sucesso', description: 'Conteúdo salvo com sucesso' });
      } else {
        await descubraMSAdminService.createContentVersion({
          ...formData,
          platform: 'descubra_ms',
          version: 1,
          edited_by: null,
        });
        toast({ title: 'Sucesso', description: 'Conteúdo criado com sucesso' });
      }
      setHasChanges(false);
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

  const handlePublish = async () => {
    setPublishing(true);
    try {
      if (content) {
        await descubraMSAdminService.updateContentVersion(content.id, {
          ...formData,
          version: content.version + 1,
          is_published: true,
        });
      } else {
        await descubraMSAdminService.createContentVersion({
          ...formData,
          platform: 'descubra_ms',
          version: 1,
          is_published: true,
          edited_by: null,
        });
      }
      toast({ title: 'Sucesso', description: 'Conteúdo publicado com sucesso' });
      setHasChanges(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao publicar conteúdo',
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
      return <div className="whitespace-pre-wrap text-[#0A0A0A]">{formData.content}</div>;
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
          className="border-[#E5E5E5] focus:border-[#3B82F6]"
        />
        {content && <p className="text-xs text-gray-500 mt-1">A chave não pode ser alterada após criação</p>}
      </div>
      <div>
        <Label htmlFor="content_type">Tipo</Label>
        <Select
          value={formData.content_type}
          onValueChange={(value) => {
            setFormData({ ...formData, content_type: value as any });
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
            className="font-mono text-sm border-[#E5E5E5] focus:border-[#3B82F6]"
            required
          />
        </div>

        {/* Histórico de Versões */}
        {versions.length > 0 && (
          <div>
            <Label>Histórico de Versões ({versions.length})</Label>
            <div className="max-h-64 overflow-y-auto border border-[#E5E5E5] rounded-md bg-white">
              <div className="divide-y divide-[#E5E5E5]">
                {versions.map((version) => (
                  <div key={version.id} className="p-3 hover:bg-[#FAFAFA] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-[#0A0A0A]">Versão {version.version}</div>
                        <div className="text-xs text-[#6B7280]">
                          {new Date(version.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <Badge variant={version.is_published ? 'default' : 'secondary'}>
                        {version.is_published ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-[#6B7280] line-clamp-2">
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
