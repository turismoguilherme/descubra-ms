import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Plus, Edit, FileText, Save, Send, Clock, History, 
  Image as ImageIcon, X, Check, ChevronRight, MapPin, Calendar,
  Eye, Home, Building2, Globe, ExternalLink, Filter
} from 'lucide-react';
import { descubraMSAdminService } from '@/services/admin/descubraMSAdminService';
import { useToast } from '@/hooks/use-toast';
import { ContentVersion } from '@/types/admin';
import { cn } from '@/lib/utils';

// Definição das páginas e seções do Descubra MS
const DESCUBRA_MS_PAGES = [
  {
    id: 'homepage',
    name: 'Página Inicial',
    icon: Home,
    url: '/',
    sections: [
      { id: 'hero', name: 'Hero Principal', description: 'Título, subtítulo e botões principais da homepage' },
      { id: 'destaques', name: 'Seção de Destaques', description: 'Conteúdo da seção de destaques' },
      { id: 'experiencias', name: 'Experiências', description: 'Conteúdo sobre experiências turísticas' },
      { id: 'regioes', name: 'Regiões', description: 'Informações sobre as regiões turísticas' },
    ]
  },
  {
    id: 'destinos',
    name: 'Destinos',
    icon: MapPin,
    url: '/destinos',
    sections: [
      { id: 'hero', name: 'Cabeçalho da Página', description: 'Título e descrição da página de destinos' },
      { id: 'filters', name: 'Filtros', description: 'Textos dos filtros de busca' },
    ]
  },
  {
    id: 'eventos',
    name: 'Eventos',
    icon: Calendar,
    url: '/eventos',
    sections: [
      { id: 'hero', name: 'Cabeçalho da Página', description: 'Título e descrição da página de eventos' },
      { id: 'cta', name: 'Chamada para Cadastro', description: 'Texto do botão e mensagem de cadastro' },
    ]
  },
  {
    id: 'parceiros',
    name: 'Parceiros',
    icon: Building2,
    url: '/parceiros',
    sections: [
      { id: 'hero', name: 'Cabeçalho da Página', description: 'Título e descrição da página de parceiros' },
      { id: 'benefits', name: 'Benefícios', description: 'Lista de benefícios para parceiros' },
      { id: 'cta', name: 'Chamada para Seja Parceiro', description: 'Texto do botão de cadastro' },
    ]
  },
  {
    id: 'passaporte',
    name: 'Passaporte Digital',
    icon: FileText,
    url: '/passaporte',
    sections: [
      { id: 'hero', name: 'Cabeçalho da Página', description: 'Título e descrição do passaporte' },
      { id: 'how_it_works', name: 'Como Funciona', description: 'Passos de como usar o passaporte' },
      { id: 'rewards', name: 'Recompensas', description: 'Informações sobre recompensas' },
    ]
  },
];

interface UnifiedContentEditorProps {
  onContentChange?: () => void;
}

export default function UnifiedContentEditor({ onContentChange }: UnifiedContentEditorProps) {
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [contents, setContents] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentVersion | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContents();
  }, []);

  useEffect(() => {
    if (selectedPage && selectedSection) {
      loadSectionContent();
    }
  }, [selectedPage, selectedSection]);

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

  const loadSectionContent = () => {
    const contentKey = `${selectedPage}_${selectedSection}`;
    const existingContent = contents.find(c => c.content_key === contentKey);
    if (existingContent) {
      setEditingContent(existingContent);
      setIsEditDialogOpen(true);
    } else {
      setEditingContent(null);
      setIsEditDialogOpen(true);
    }
  };

  const getContentForSection = (pageId: string, sectionId: string) => {
    const contentKey = `${pageId}_${sectionId}`;
    return contents.find(c => c.content_key === contentKey);
  };

  const filteredPages = DESCUBRA_MS_PAGES.filter(page => {
    if (selectedCategory !== 'all' && page.id !== selectedCategory) return false;
    if (searchTerm) {
      const matchesPage = page.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSections = page.sections.some(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesPage || matchesSections;
    }
    return true;
  });

  const handleNewContent = (pageId: string, sectionId: string) => {
    setSelectedPage(pageId);
    setSelectedSection(sectionId);
    setEditingContent(null);
    setIsEditDialogOpen(true);
  };

  const handleEditContent = (content: ContentVersion) => {
    // Extrair página e seção da chave
    const parts = content.content_key.split('_');
    if (parts.length >= 2) {
      setSelectedPage(parts[0]);
      setSelectedSection(parts.slice(1).join('_'));
    }
    setEditingContent(content);
    setIsEditDialogOpen(true);
  };

  const currentPage = DESCUBRA_MS_PAGES.find(p => p.id === selectedPage);

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
              Edite o conteúdo de cada página e seção do site Descubra Mato Grosso do Sul
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 px-3 py-1">
                <FileText className="h-3 w-3 mr-1" />
                {contents.length} conteúdo(s) cadastrado(s)
              </Badge>
              <Badge variant="outline" className="bg-white border-green-300 text-green-700 px-3 py-1">
                <Check className="h-3 w-3 mr-1" />
                {contents.filter(c => c.is_published).length} publicado(s)
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Busca e Filtros */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Buscar Páginas e Seções
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite para buscar páginas ou seções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Filtrar por Página</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as páginas</SelectItem>
                  {DESCUBRA_MS_PAGES.map(page => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Páginas e Seções */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando páginas...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPages.map((page) => {
            const PageIcon = page.icon;
            return (
              <Card key={page.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <PageIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">{page.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-gray-300">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {page.url}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {page.sections.length} seção(ões)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {page.sections.map((section) => {
                      const sectionContent = getContentForSection(page.id, section.id);
                      const contentKey = `${page.id}_${section.id}`;
                      
                      return (
                        <Card 
                          key={section.id}
                          className={cn(
                            "border-2 transition-all cursor-pointer hover:border-blue-400",
                            sectionContent 
                              ? sectionContent.is_published 
                                ? "border-green-300 bg-green-50/50" 
                                : "border-amber-300 bg-amber-50/50"
                              : "border-gray-200 bg-gray-50/50"
                          )}
                          onClick={() => handleNewContent(page.id, section.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{section.name}</h3>
                                <p className="text-xs text-gray-600 mb-3">{section.description}</p>
                              </div>
                              {sectionContent && (
                                <Badge 
                                  variant={sectionContent.is_published ? "default" : "outline"}
                                  className={cn(
                                    "text-xs",
                                    sectionContent.is_published 
                                      ? "bg-green-500 hover:bg-green-600" 
                                      : "border-amber-300 text-amber-600 bg-amber-50"
                                  )}
                                >
                                  {sectionContent.is_published ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Publicado
                                    </>
                                  ) : (
                                    'Rascunho'
                                  )}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Breadcrumb mostrando onde está */}
                            <div className="mb-3 p-2 bg-white rounded border border-gray-200">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <span className="font-medium text-blue-700">Descubra MS</span>
                                <ChevronRight className="h-3 w-3" />
                                <span className="font-medium">{page.name}</span>
                                <ChevronRight className="h-3 w-3" />
                                <span className="text-gray-500">{section.name}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                Aparece em: <span className="font-mono">{page.url}</span>
                              </div>
                            </div>

                            {sectionContent ? (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Versão:</span> {sectionContent.version}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditContent(sectionContent);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-2" />
                                  Editar Conteúdo
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNewContent(page.id, section.id);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                Criar Conteúdo
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de Edição */}
      {isEditDialogOpen && (
        <ContentEditDialog
          content={editingContent}
          page={currentPage}
          section={currentPage?.sections.find(s => s.id === selectedSection)}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
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

// Componente de Dialog de Edição
interface ContentEditDialogProps {
  content: ContentVersion | null;
  page: typeof DESCUBRA_MS_PAGES[0] | undefined;
  section: typeof DESCUBRA_MS_PAGES[0]['sections'][0] | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ContentEditDialog({ content, page, section, isOpen, onClose, onSuccess }: ContentEditDialogProps) {
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
  const [activeTab, setActiveTab] = useState<'edit' | 'history'>('edit');
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
    } else if (page && section) {
      setFormData({
        content_key: `${page.id}_${section.id}`,
        content_type: 'text',
        content: '',
        is_published: false,
        scheduled_publish_at: '',
      });
      setVersions([]);
    }
  }, [content, page, section]);

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

    const action = publish ? setPublishing : setSaving;
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
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar conteúdo',
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Edit className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {content ? 'Editar Conteúdo' : 'Criar Novo Conteúdo'}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {page && section && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-blue-700">Descubra MS</span>
                      <ChevronRight className="h-4 w-4" />
                      <span className="font-medium">{page.name}</span>
                      <ChevronRight className="h-4 w-4" />
                      <span>{section.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Este conteúdo aparece em: <span className="font-mono">{page.url}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{section.description}</p>
                  </div>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Histórico ({versions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="content_key" className="text-sm font-semibold text-gray-700">
                  Chave do Conteúdo (Identificador)
                </Label>
                <Input
                  id="content_key"
                  value={formData.content_key}
                  disabled
                  className="mt-2 border-gray-300 bg-gray-50 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta chave identifica onde o conteúdo aparece no site
                </p>
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




