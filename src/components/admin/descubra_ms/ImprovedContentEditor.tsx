// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Plus, Edit, FileText, Save, Send, Clock, History, 
  Image as ImageIcon, X, Check, ChevronRight, MapPin, Calendar,
  Eye, EyeOff, Filter, SortAsc, SortDesc
} from 'lucide-react';
import { descubraMSAdminService } from '@/services/admin/descubraMSAdminService';
import { useToast } from '@/hooks/use-toast';
import { ContentVersion } from '@/types/admin';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Categorias de conteúdo para organização
const CONTENT_CATEGORIES = {
  'homepage': { label: 'Homepage', icon: FileText, color: 'blue' },
  'hero': { label: 'Hero Sections', icon: ImageIcon, color: 'purple' },
  'destinos': { label: 'Destinos', icon: MapPin, color: 'green' },
  'eventos': { label: 'Eventos', icon: Calendar, color: 'orange' },
  'parceiros': { label: 'Parceiros', icon: FileText, color: 'cyan' },
  'passaporte': { label: 'Passaporte', icon: FileText, color: 'pink' },
  'footer': { label: 'Rodapé', icon: FileText, color: 'gray' },
  'menu': { label: 'Menus', icon: FileText, color: 'indigo' },
  'outros': { label: 'Outros', icon: FileText, color: 'slate' },
};

interface ContentEditorProps {
  onContentChange?: () => void;
}

export default function ImprovedContentEditor({ onContentChange }: ContentEditorProps) {
  const [contents, setContents] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'version'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao carregar conteúdos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar e ordenar conteúdos
  const getFilteredAndSortedContents = () => {
    let filtered = contents.filter(content => {
      const matchesSearch = 
        content.content_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        content.content_key.toLowerCase().includes(selectedCategory.toLowerCase());
      
      return matchesSearch && matchesCategory;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.content_key.localeCompare(b.content_key);
          break;
        case 'version':
          comparison = (a.version || 0) - (b.version || 0);
          break;
        case 'date':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredContents = getFilteredAndSortedContents();

  // Detectar categoria do conteúdo pela chave
  const getContentCategory = (contentKey: string) => {
    const key = contentKey.toLowerCase();
    if (key.includes('homepage') || key.includes('home')) return 'homepage';
    if (key.includes('hero')) return 'hero';
    if (key.includes('destino')) return 'destinos';
    if (key.includes('evento')) return 'eventos';
    if (key.includes('parceiro')) return 'parceiros';
    if (key.includes('passaporte') || key.includes('passport')) return 'passaporte';
    if (key.includes('footer') || key.includes('rodape')) return 'footer';
    if (key.includes('menu')) return 'menu';
    return 'outros';
  };

  const handleNewContent = () => {
    setEditingContent(null);
    setIsDialogOpen(true);
  };

  const handleEditContent = (content: ContentVersion) => {
    setEditingContent(content);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb e Header - MUITO CLARO */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-sm text-blue-700 mb-3">
          <span className="font-medium">Admin</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium">Descubra MS</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-blue-900">Editor de Conteúdo</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📝 Editor de Conteúdo - Descubra MS
            </h1>
            <p className="text-gray-600 text-lg">
              Gerencie e edite todo o conteúdo do site Descubra Mato Grosso do Sul
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 px-3 py-1">
                <FileText className="h-3 w-3 mr-1" />
                {filteredContents.length} conteúdo(s) encontrado(s)
              </Badge>
              <Badge variant="outline" className="bg-white border-green-300 text-green-700 px-3 py-1">
                <Check className="h-3 w-3 mr-1" />
                {contents.filter(c => c.is_published).length} publicado(s)
              </Badge>
            </div>
          </div>
          <Button onClick={handleNewContent} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Novo Conteúdo
          </Button>
        </div>
      </div>

      {/* Filtros e Busca - MELHORADO */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Buscar e Filtrar Conteúdos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite para buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {Object.entries(CONTENT_CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordenação */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Ordenar por</Label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="border-gray-300 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="version">Versão</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="border-gray-300"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Conteúdos - ORGANIZADA */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Conteúdos Disponíveis
          </CardTitle>
          <CardDescription>
            Clique em um conteúdo para editar ou visualizar detalhes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando conteúdos...</p>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium">Nenhum conteúdo encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Crie um novo conteúdo para começar'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredContents.map((content) => {
                const category = getContentCategory(content.content_key);
                const categoryInfo = CONTENT_CATEGORIES[category as keyof typeof CONTENT_CATEGORIES] || CONTENT_CATEGORIES.outros;
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <div 
                    key={content.id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleEditContent(content)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            categoryInfo.color === 'blue' && "bg-blue-100 text-blue-700",
                            categoryInfo.color === 'purple' && "bg-purple-100 text-purple-700",
                            categoryInfo.color === 'green' && "bg-green-100 text-green-700",
                            categoryInfo.color === 'orange' && "bg-orange-100 text-orange-700",
                            categoryInfo.color === 'cyan' && "bg-cyan-100 text-cyan-700",
                            categoryInfo.color === 'pink' && "bg-pink-100 text-pink-700",
                            categoryInfo.color === 'gray' && "bg-gray-100 text-gray-700",
                            categoryInfo.color === 'indigo' && "bg-indigo-100 text-indigo-700",
                            categoryInfo.color === 'slate' && "bg-slate-100 text-slate-700",
                          )}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <Badge variant="outline" className="font-mono text-xs bg-gray-50 text-gray-700 border-gray-300">
                            {content.content_key}
                          </Badge>
                          <Badge variant="outline" className="border-gray-300 text-gray-600">
                            {content.content_type}
                          </Badge>
                          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                            v{content.version}
                          </Badge>
                          {content.is_published ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              Publicado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-300 text-amber-600 bg-amber-50">
                              Rascunho
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {content.content.substring(0, 200)}
                          {content.content.length > 200 && '...'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {content.edited_by && (
                            <span>Editado por: {content.edited_by}</span>
                          )}
                          <span>
                            {new Date(content.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditContent(content);
                        }}
                        className="flex-shrink-0"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      {isDialogOpen && (
        <ContentEditDialog
          content={editingContent}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingContent(null);
          }}
          onSuccess={() => {
            fetchContents();
            onContentChange?.();
          }}
        />
      )}
    </div>
  );
}

// Componente de Dialog de Edição Melhorado
interface ContentEditDialogProps {
  content: ContentVersion | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ContentEditDialog({ content, isOpen, onClose, onSuccess }: ContentEditDialogProps) {
  const [formData, setFormData] = useState({
    content_key: content?.content_key || '',
    content_type: content?.content_type || 'text',
    content: content?.content || '',
    is_published: content?.is_published || false,
    scheduled_publish_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [activeTab, setActiveTab] = useState<'edit' | 'history' | 'images'>('edit');
  const { toast } = useToast();

  useEffect(() => {
    if (content) {
      setFormData({
        content_key: content.content_key,
        content_type: content.content_type,
        content: content.content,
        is_published: content.is_published,
        scheduled_publish_at: '',
      });
      fetchVersions();
    } else {
      setFormData({
        content_key: '',
        content_type: 'text',
        content: '',
        is_published: false,
        scheduled_publish_at: '',
      });
      setVersions([]);
    }
  }, [content]);

  const fetchVersions = async () => {
    if (!content?.content_key) return;
    try {
      const data = await descubraMSAdminService.getContentVersions('descubra_ms');
      const filtered = data.filter(v => v.content_key === content.content_key);
      setVersions(filtered.sort((a, b) => (b.version || 0) - (a.version || 0)));
    } catch (error) {
      console.error('Erro ao buscar versões:', error);
    }
  };

  const handleSave = async (publish: boolean = false, schedule: boolean = false) => {
    if (publish && schedule && !formData.scheduled_publish_at) {
      toast({
        title: 'Erro',
        description: 'Selecione uma data para publicação agendada',
        variant: 'destructive',
      });
      return;
    }

    const action = publish ? (schedule ? setPublishing : setPublishing) : setSaving;
    action(true);
    
    try {
      if (content) {
        await descubraMSAdminService.updateContentVersion(content.id, {
          ...formData,
          version: content.version + 1,
          is_published: publish && !schedule,
          scheduled_publish_at: schedule ? formData.scheduled_publish_at : null,
        });
        toast({ 
          title: 'Sucesso', 
          description: schedule 
            ? 'Conteúdo agendado para publicação' 
            : publish 
              ? 'Conteúdo publicado com sucesso' 
              : 'Conteúdo salvo com sucesso' 
        });
      } else {
        await descubraMSAdminService.createContentVersion({
          ...formData,
          platform: 'descubra_ms',
          version: 1,
          is_published: publish && !schedule,
          scheduled_publish_at: schedule ? formData.scheduled_publish_at : null,
          edited_by: null,
        });
        toast({ 
          title: 'Sucesso', 
          description: schedule 
            ? 'Conteúdo criado e agendado para publicação' 
            : publish 
              ? 'Conteúdo criado e publicado com sucesso' 
              : 'Conteúdo criado com sucesso' 
        });
      }
      setHasChanges(false);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar conteúdo',
        variant: 'destructive',
      });
    } finally {
      action(false);
    }
  };

  const handleRestoreVersion = async (version: ContentVersion) => {
    setFormData({
      ...formData,
      content: version.content,
      content_type: version.content_type,
    });
    setHasChanges(true);
    toast({
      title: 'Versão restaurada',
      description: 'A versão foi carregada. Clique em Salvar para aplicar as alterações.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Edit className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {content ? 'Editar Conteúdo' : 'Novo Conteúdo'}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {content 
                  ? `Editando: ${content.content_key} (Versão ${content.version})`
                  : 'Crie um novo conteúdo editável para o Descubra MS'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Histórico ({versions.length})
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="h-4 w-4 mr-2" />
              Imagens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="content_key" className="text-sm font-semibold text-gray-700">
                  Chave do Conteúdo *
                </Label>
                <Input
                  id="content_key"
                  value={formData.content_key}
                  onChange={(e) => {
                    setFormData({ ...formData, content_key: e.target.value });
                    setHasChanges(true);
                  }}
                  placeholder="ex: homepage_hero_title, destinos_description"
                  required
                  disabled={!!content}
                  className="mt-2 border-gray-300 focus:border-blue-500"
                />
                {content && (
                  <p className="text-xs text-gray-500 mt-1">
                    A chave não pode ser alterada após criação
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="content_type" className="text-sm font-semibold text-gray-700">
                  Tipo de Conteúdo
                </Label>
                <Select
                  value={formData.content_type}
                  onValueChange={(value) => {
                    setFormData({ ...formData, content_type: value as any });
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger className="mt-2 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto Simples</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content" className="text-sm font-semibold text-gray-700">
                  Conteúdo *
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e.target.value });
                    setHasChanges(true);
                  }}
                  rows={12}
                  className="mt-2 font-mono text-sm border-gray-300 focus:border-blue-500"
                  required
                  placeholder="Digite o conteúdo aqui..."
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => {
                      setFormData({ ...formData, is_published: e.target.checked });
                      setHasChanges(true);
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                    Publicar imediatamente
                  </Label>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Publicação Agendada (Opcional)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_publish_at}
                    onChange={(e) => {
                      setFormData({ ...formData, scheduled_publish_at: e.target.value });
                      setHasChanges(true);
                    }}
                    className="border-gray-300 focus:border-blue-500"
                    placeholder="Selecione data e hora"
                  />
                  {formData.scheduled_publish_at && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      Agendado para: {new Date(formData.scheduled_publish_at).toLocaleString('pt-BR')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {versions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Nenhuma versão anterior</p>
                <p className="text-sm mt-1">Este conteúdo ainda não possui histórico de versões</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  {versions.length} versão(ões) encontrada(s). Clique em "Restaurar" para usar uma versão anterior.
                </div>
                {versions.map((version) => (
                  <Card key={version.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                              Versão {version.version}
                            </Badge>
                            {version.is_published && (
                              <Badge className="bg-green-500">Publicado</Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(version.created_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {version.content.substring(0, 150)}...
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreVersion(version)}
                          className="ml-4"
                        >
                          Restaurar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Editor de Imagens</p>
              <p className="text-sm mt-1">Funcionalidade em desenvolvimento</p>
              <p className="text-xs mt-2 text-gray-400">
                Em breve você poderá fazer upload e editar imagens diretamente aqui
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div>
              {hasChanges && (
                <Badge variant="outline" className="border-amber-300 text-amber-600 bg-amber-50">
                  Alterações não salvas
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave(false, false)}
                disabled={saving || !hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </Button>
              {formData.scheduled_publish_at ? (
                <Button
                  onClick={() => handleSave(true, true)}
                  disabled={publishing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {publishing ? 'Agendando...' : 'Agendar Publicação'}
                </Button>
              ) : (
                <Button
                  onClick={() => handleSave(true, false)}
                  disabled={publishing || !hasChanges}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {publishing ? 'Publicando...' : 'Publicar Agora'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

