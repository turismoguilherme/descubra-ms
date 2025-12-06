import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { contentService } from '@/services/admin/contentService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Eye, EyeOff, Save, Undo, Redo, Image, Type, Palette, Link2, 
  Layout, Monitor, Smartphone, Tablet, ChevronRight, MapPin,
  Building2, Home, FileText, Settings, Check, X, History, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Definição das páginas editáveis por plataforma
const EDITABLE_PAGES = {
  viajar: [
    {
      id: 'homepage',
      name: 'Homepage',
      icon: Home,
      sections: [
        { id: 'hero', name: 'Hero Principal', fields: ['title', 'subtitle', 'cta_primary', 'cta_secondary', 'background_image'] },
        { id: 'features', name: 'Funcionalidades', fields: ['title', 'subtitle', 'items'] },
        { id: 'testimonials', name: 'Depoimentos', fields: ['title', 'items'] },
        { id: 'cta', name: 'Call to Action', fields: ['title', 'subtitle', 'button_text', 'button_link'] },
      ]
    },
    {
      id: 'solucoes',
      name: 'Soluções',
      icon: Settings,
      sections: [
        { id: 'hero', name: 'Hero', fields: ['title', 'subtitle'] },
        { id: 'solutions', name: 'Lista de Soluções', fields: ['items'] },
      ]
    },
    {
      id: 'precos',
      name: 'Preços',
      icon: FileText,
      sections: [
        { id: 'hero', name: 'Hero', fields: ['title', 'subtitle'] },
        { id: 'plans', name: 'Planos', fields: ['items'] },
        { id: 'faq', name: 'FAQ', fields: ['items'] },
      ]
    },
    {
      id: 'sobre',
      name: 'Sobre',
      icon: Building2,
      sections: [
        { id: 'hero', name: 'Hero', fields: ['title', 'subtitle'] },
        { id: 'history', name: 'Nossa História', fields: ['content'] },
        { id: 'team', name: 'Equipe', fields: ['items'] },
        { id: 'values', name: 'Valores', fields: ['items'] },
      ]
    },
    {
      id: 'contato',
      name: 'Contato',
      icon: Globe,
      sections: [
        { id: 'hero', name: 'Hero', fields: ['title', 'subtitle'] },
        { id: 'info', name: 'Informações', fields: ['email', 'phone', 'address'] },
        { id: 'social', name: 'Redes Sociais', fields: ['facebook', 'instagram', 'linkedin', 'twitter'] },
      ]
    },
  ],
  'descubra-ms': [
    {
      id: 'homepage',
      name: 'Homepage',
      icon: Home,
      sections: [
        { id: 'hero', name: 'Hero Principal', fields: ['title', 'subtitle', 'cta_primary', 'cta_secondary', 'background_video'] },
        { id: 'destaques', name: 'Destaques', fields: ['title', 'items'] },
        { id: 'experiencias', name: 'Experiências', fields: ['title', 'subtitle', 'items'] },
        { id: 'regioes', name: 'Regiões', fields: ['title', 'items'] },
      ]
    },
    {
      id: 'destinos',
      name: 'Destinos',
      icon: MapPin,
      sections: [
        { id: 'hero', name: 'Hero', fields: ['title', 'subtitle'] },
        { id: 'filters', name: 'Filtros', fields: ['categories'] },
      ]
    },
    {
      id: 'eventos',
      name: 'Eventos',
      icon: FileText,
      sections: [
        { id: 'hero', name: 'Hero', fields: ['title', 'subtitle'] },
        { id: 'cta', name: 'CTA Cadastro', fields: ['title', 'subtitle', 'button_text'] },
      ]
    },
    {
      id: 'parceiros',
      name: 'Parceiros',
      icon: Building2,
      sections: [
        { id: 'hero', name: 'Hero', fields: ['title', 'subtitle'] },
        { id: 'benefits', name: 'Benefícios', fields: ['items'] },
        { id: 'cta', name: 'CTA Seja Parceiro', fields: ['title', 'button_text'] },
      ]
    },
    {
      id: 'passaporte',
      name: 'Passaporte Digital',
      icon: FileText,
      sections: [
        { id: 'hero', name: 'Hero', fields: ['title', 'subtitle'] },
        { id: 'how_it_works', name: 'Como Funciona', fields: ['steps'] },
        { id: 'rewards', name: 'Recompensas', fields: ['title', 'subtitle'] },
      ]
    },
  ],
};

// Dados salvos localmente (simulando banco de dados)
const getStorageKey = (platform: string, page: string, section: string) => 
  `content_${platform}_${page}_${section}`;

interface ContentEditorProps {
  platform?: string;
}

export default function VisualContentEditor({ platform: propPlatform }: ContentEditorProps) {
  const { platform: routePlatform } = useParams();
  const platform = propPlatform || routePlatform || 'viajar';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const pageFromUrl = searchParams.get('page');
  
  const [selectedPage, setSelectedPage] = useState(pageFromUrl || '');
  const [selectedSection, setSelectedSection] = useState('');
  const [content, setContent] = useState<Record<string, any>>({});
  const [originalContent, setOriginalContent] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pages = EDITABLE_PAGES[platform as keyof typeof EDITABLE_PAGES] || [];
  const currentPage = pages.find(p => p.id === selectedPage);
  const currentSection = currentPage?.sections.find(s => s.id === selectedSection);

  useEffect(() => {
    if (pages.length > 0 && !selectedPage) {
      setSelectedPage(pages[0].id);
    }
  }, [platform]);

  useEffect(() => {
    if (selectedPage && currentPage?.sections.length) {
      setSelectedSection(currentPage.sections[0].id);
    }
  }, [selectedPage]);

  useEffect(() => {
    if (selectedPage && selectedSection) {
      loadContent();
    }
  }, [selectedPage, selectedSection]);

  const loadContent = async () => {
    if (!selectedPage || !selectedSection) return;
    
    setLoading(true);
    try {
      const contentKey = `${selectedPage}_${selectedSection}`;
      const platformKey = platform === 'descubra-ms' ? 'descubra_ms' : 'viajar';
      
      // Buscar conteúdo publicado do banco de dados
      try {
        const publishedContent = await contentService.getPublishedContent(platformKey as 'viajar' | 'descubra_ms', contentKey);
        
        if (publishedContent && publishedContent.content) {
          // Se há conteúdo publicado, parsear e usar
          const parsed = typeof publishedContent.content === 'string' 
            ? JSON.parse(publishedContent.content) 
            : publishedContent.content;
          setContent(parsed);
          setOriginalContent(parsed);
        } else {
          // Se não há conteúdo publicado, buscar a última versão (mesmo não publicada)
          const versions = await contentService.getContentVersions(platformKey as 'viajar' | 'descubra_ms', contentKey);
          if (versions && versions.length > 0) {
            const latest = versions[0];
            const parsed = typeof latest.content === 'string' 
              ? JSON.parse(latest.content) 
              : latest.content;
            setContent(parsed);
            setOriginalContent(parsed);
          } else {
            // Se não há nenhum conteúdo, usar valores padrão
            const defaultContent = getDefaultContent();
            // Garantir que sempre há conteúdo para mostrar
            if (Object.keys(defaultContent).length === 0 && currentSection?.fields) {
              currentSection.fields.forEach(field => {
                defaultContent[field] = '';
              });
            }
            setContent(defaultContent);
            setOriginalContent(defaultContent);
          }
        }
      } catch (error: any) {
        // Se a tabela não existe ou erro, usar localStorage como fallback
        const key = getStorageKey(platform, selectedPage, selectedSection);
        const saved = localStorage.getItem(key);
        
        if (saved) {
          const parsed = JSON.parse(saved);
          setContent(parsed);
          setOriginalContent(parsed);
        } else {
          const defaultContent = getDefaultContent();
          // Garantir que sempre há conteúdo para mostrar
          if (Object.keys(defaultContent).length === 0 && currentSection?.fields) {
            currentSection.fields.forEach(field => {
              defaultContent[field] = '';
            });
          }
          setContent(defaultContent);
          setOriginalContent(defaultContent);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar conteúdo:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar o conteúdo. Usando valores padrão.',
        variant: 'destructive',
      });
      const defaultContent = getDefaultContent();
      // Garantir que sempre há conteúdo para mostrar
      if (Object.keys(defaultContent).length === 0 && currentSection?.fields) {
        currentSection.fields.forEach(field => {
          defaultContent[field] = '';
        });
      }
      setContent(defaultContent);
      setOriginalContent(defaultContent);
    } finally {
      setLoading(false);
      setHasChanges(false);
    }
  };

  const getDefaultContent = () => {
    const defaults: Record<string, any> = {
      title: 'Título Principal',
      subtitle: 'Subtítulo descritivo aqui',
      cta_primary: 'Começar Agora',
      cta_secondary: 'Saiba Mais',
      background_image: '',
      content: 'Conteúdo da seção...',
      items: [],
      email: 'contato@exemplo.com',
      phone: '(67) 99999-9999',
      address: 'Endereço completo aqui',
      facebook: 'https://facebook.com/exemplo',
      instagram: 'https://instagram.com/exemplo',
      linkedin: 'https://linkedin.com/company/exemplo',
      twitter: 'https://twitter.com/exemplo',
    };
    
    // Garantir que todos os campos da seção atual tenham valores padrão
    if (currentSection?.fields) {
      currentSection.fields.forEach(field => {
        if (!(field in defaults)) {
          if (field.includes('items') || field.includes('steps') || field.includes('categories')) {
            defaults[field] = [];
          } else if (field.includes('url') || field.includes('link') || field.includes('site')) {
            defaults[field] = 'https://exemplo.com';
          } else {
            defaults[field] = `Valor padrão para ${field.replace(/_/g, ' ')}`;
          }
        }
      });
    }
    
    return defaults;
  };

  const updateContent = (field: string, value: any) => {
    const newContent = { ...content, [field]: value };
    setContent(newContent);
    setHasChanges(JSON.stringify(newContent) !== JSON.stringify(originalContent));
    
    // Adicionar ao histórico
    const newHistory = [...history.slice(0, historyIndex + 1), newContent];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleSave = async () => {
    if (!selectedPage || !selectedSection) return;
    
    setSaving(true);
    try {
      const contentKey = `${selectedPage}_${selectedSection}`;
      const platformKey = platform === 'descubra-ms' ? 'descubra_ms' : 'viajar';
      
      // Buscar versão atual para incrementar
      const versions = await contentService.getContentVersions(platformKey as 'viajar' | 'descubra_ms', contentKey);
      const nextVersion = versions && versions.length > 0 
        ? Math.max(...versions.map(v => v.version || 1)) + 1 
        : 1;
      
      // Salvar no banco de dados
      const { data, error } = await supabase
        .from('content_versions')
        .insert({
          content_key: contentKey,
          platform: platformKey,
          content_type: 'text',
          content: JSON.stringify(content),
          version: nextVersion,
          is_published: true, // Publicar automaticamente
          edited_by: user?.id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Também salvar no localStorage como backup
      const key = getStorageKey(platform, selectedPage, selectedSection);
      localStorage.setItem(key, JSON.stringify(content));
      
      setOriginalContent(content);
      setHasChanges(false);
      
      toast({
        title: 'Conteúdo salvo!',
        description: 'As alterações foram salvas e publicadas com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      
      // Fallback para localStorage se o banco falhar
      try {
        const key = getStorageKey(platform, selectedPage, selectedSection);
        localStorage.setItem(key, JSON.stringify(content));
        setOriginalContent(content);
        setHasChanges(false);
        
        toast({
          title: 'Salvo localmente',
          description: 'Conteúdo salvo localmente. Erro ao salvar no banco de dados.',
          variant: 'default',
        });
      } catch (localError) {
        toast({
          title: 'Erro ao salvar',
          description: error.message || 'Não foi possível salvar as alterações.',
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const handleDiscard = () => {
    setContent(originalContent);
    setHasChanges(false);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const renderField = (field: string) => {
    const value = content[field] || '';
    
    switch (field) {
      case 'title':
      case 'subtitle':
      case 'cta_primary':
      case 'cta_secondary':
      case 'button_text':
      case 'email':
      case 'phone':
        return (
          <div key={field} className="space-y-2">
            <Label className="capitalize text-slate-700">{field.replace(/_/g, ' ')}</Label>
            <Input
              value={value}
              onChange={(e) => updateContent(field, e.target.value)}
              placeholder={`Digite o ${field.replace(/_/g, ' ')}`}
              className="border-slate-200"
            />
          </div>
        );
      
      case 'content':
      case 'address':
        return (
          <div key={field} className="space-y-2">
            <Label className="capitalize text-slate-700">{field.replace(/_/g, ' ')}</Label>
            <Textarea
              value={value}
              onChange={(e) => updateContent(field, e.target.value)}
              placeholder={`Digite o ${field.replace(/_/g, ' ')}`}
              rows={4}
              className="border-slate-200"
            />
          </div>
        );
      
      case 'background_image':
      case 'background_video':
        return (
          <div key={field} className="space-y-2">
            <Label className="capitalize text-slate-700">{field.replace(/_/g, ' ')}</Label>
            <div className="flex gap-2">
              <Input
                value={value}
                onChange={(e) => updateContent(field, e.target.value)}
                placeholder="URL da imagem ou vídeo"
                className="border-slate-200"
              />
              <Button variant="outline" size="icon">
                <Image className="h-4 w-4" />
              </Button>
            </div>
            {value && (
              <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
                <img src={value} alt="Preview" className="w-full h-32 object-cover" />
              </div>
            )}
          </div>
        );
      
      case 'button_link':
      case 'facebook':
      case 'instagram':
      case 'linkedin':
      case 'twitter':
        return (
          <div key={field} className="space-y-2">
            <Label className="capitalize text-slate-700">{field.replace(/_/g, ' ')}</Label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-md text-slate-500 text-sm">
                <Link2 className="h-4 w-4" />
              </span>
              <Input
                value={value}
                onChange={(e) => updateContent(field, e.target.value)}
                placeholder="https://"
                className="rounded-l-none border-slate-200"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div key={field} className="space-y-2">
            <Label className="capitalize text-slate-700">{field.replace(/_/g, ' ')}</Label>
            <Input
              value={value}
              onChange={(e) => updateContent(field, e.target.value)}
              className="border-slate-200"
            />
          </div>
        );
    }
  };

  const renderPreview = () => {
    if (!currentSection) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 min-h-[300px]">
          <Eye className="h-12 w-12 mb-4 text-gray-300" />
          <p className="font-medium">Nenhuma seção selecionada</p>
          <p className="text-sm mt-1">Selecione uma página e seção para ver o preview</p>
        </div>
      );
    }

    const previewWidth = {
      desktop: 'w-full',
      tablet: 'w-[768px]',
      mobile: 'w-[375px]',
    }[previewMode];

    // Se não há conteúdo ainda, mostrar campos vazios com placeholders
    const hasContent = content && Object.keys(content).length > 0;

    // Preview da plataforma real - atualiza em tempo real conforme edita
    if (selectedSection === 'hero') {
      const title = content?.title || 'Título Principal';
      const subtitle = content?.subtitle || 'Subtítulo descritivo aqui';
      const ctaPrimary = content?.cta_primary || 'Começar Agora';
      const ctaSecondary = content?.cta_secondary || 'Saiba Mais';
      
      return (
        <div 
          className={cn(
            "bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 rounded-lg overflow-hidden transition-all mx-auto shadow-xl",
            previewWidth
          )}
          style={{
            backgroundImage: content?.background_image ? `url(${content.background_image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '300px',
          }}
        >
          <div className="bg-black/40 p-8 md:p-12 text-center text-white">
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-6">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-medium transition-colors">
                {ctaPrimary}
              </button>
              <button className="border border-white/50 hover:bg-white/10 px-6 py-3 rounded-lg font-medium transition-colors">
                {ctaSecondary}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (selectedSection === 'info' || selectedSection === 'social') {
      return (
        <div className={cn("bg-white rounded-lg p-6 border border-slate-200 mx-auto shadow-lg", previewWidth)}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {selectedSection === 'info' ? 'Informações de Contato' : 'Redes Sociais'}
          </h3>
          <div className="space-y-3">
            {currentSection.fields && currentSection.fields.length > 0 ? (
              currentSection.fields.map(field => {
                const value = content?.[field] || '';
                const isLink = field.includes('facebook') || field.includes('instagram') || field.includes('linkedin') || field.includes('twitter') || field.includes('link') || field.includes('url');
                const displayValue = value || (isLink ? 'https://exemplo.com' : 'Não definido');
                
                return (
                  <div key={field} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-slate-500 capitalize font-medium min-w-[100px] text-sm">{field.replace(/_/g, ' ')}:</span>
                    {isLink ? (
                      <a 
                        href={value || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cn(
                          "break-words",
                          value ? "text-blue-600 hover:underline" : "text-gray-400 italic"
                        )}
                      >
                        {displayValue}
                      </a>
                    ) : (
                      <span className={cn(
                        "break-words",
                        value ? "text-slate-800" : "text-gray-400 italic"
                      )}>{displayValue}</span>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 italic">Nenhum campo definido para esta seção</p>
            )}
          </div>
        </div>
      );
    }

    // Preview genérico - mostra conteúdo real da plataforma
    return (
      <div className={cn("bg-white rounded-lg p-6 border border-slate-200 mx-auto shadow-lg", previewWidth)}>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{currentSection?.name || 'Seção'}</h3>
        <div className="space-y-4">
          {currentSection?.fields && currentSection.fields.length > 0 ? (
            currentSection.fields.map(field => {
              const value = content?.[field];
              const displayValue = typeof value === 'object' && value !== null
                ? JSON.stringify(value, null, 2)
                : value || 'Não definido';
              
              return (
                <div key={field} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <span className="text-sm text-slate-500 capitalize font-medium block mb-1">
                    {field.replace(/_/g, ' ')}:
                  </span>
                  <p className={cn(
                    "break-words whitespace-pre-wrap",
                    value ? "text-slate-800" : "text-gray-400 italic"
                  )}>
                    {displayValue}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="font-medium mb-2">Nenhum campo definido</p>
              <p className="text-sm">Esta seção não possui campos editáveis</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {platform === 'viajar' ? 'ViajARTur' : 'Descubra MS'}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">{currentPage?.name || 'Selecione uma página'}</span>
            {currentSection && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">{currentSection.name}</span>
              </>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {currentPage?.name && currentSection 
              ? `Editando: ${currentPage.name} → ${currentSection.name}`
              : 'Editor de Conteúdo'}
          </h2>
          <p className="text-gray-600 mt-1">
            {currentPage?.name && currentSection 
              ? `Você está editando a seção "${currentSection.name}" da página "${currentPage.name}"`
              : 'Selecione uma página e seção para começar a editar'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="border-amber-300 text-amber-600 bg-amber-50">
              Alterações não salvas
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleDiscard} disabled={!hasChanges}>
            <X className="h-4 w-4 mr-2" />
            Descartar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navegação de Páginas - Mais visível */}
        <Card className="lg:col-span-3 bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-200">
            <CardTitle className="text-base font-semibold text-gray-900">📄 Páginas Disponíveis</CardTitle>
            <CardDescription className="text-sm text-gray-600">Clique para selecionar</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {pages.map((page) => {
              const Icon = page.icon;
              return (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left border-b border-gray-100 last:border-0",
                    selectedPage === page.id
                      ? "bg-blue-50 text-blue-700 border-l-4 border-l-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{page.name}</span>
                  {selectedPage === page.id && (
                    <Check className="h-4 w-4 ml-auto text-blue-600" />
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Seções e Editor - Mais claro */}
        <div className="lg:col-span-5 space-y-4">
          {/* Seleção de Seção - Mais destacada */}
          {currentPage && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-200">
                <CardTitle className="text-base font-semibold text-gray-900">
                  🎯 Seções de "{currentPage.name}"
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Escolha qual parte da página deseja editar
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {currentPage.sections.map((section) => (
                    <Button
                      key={section.id}
                      variant={selectedSection === section.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSection(section.id)}
                      className={cn(
                        "justify-start",
                        selectedSection === section.id 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {section.name}
                      {selectedSection === section.id && (
                        <Check className="h-4 w-4 ml-auto" />
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Editor de Campos - Mais claro */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">
                ✏️ {currentSection?.name || 'Selecione uma seção'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {currentSection 
                  ? `Edite os campos da seção "${currentSection.name}". As alterações aparecerão no preview ao lado.`
                  : 'Primeiro selecione uma página e depois uma seção para começar a editar'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {currentSection?.fields.map(field => renderField(field))}
              {!currentSection && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Nenhuma seção selecionada</p>
                  <p className="text-sm mt-1">Selecione uma página e seção acima para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview - Mais destacado */}
        <Card className="lg:col-span-4 bg-white border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Preview ao Vivo
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Veja como ficará no site em tempo real
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={cn(
                      "p-2 transition-colors",
                      previewMode === 'desktop' ? "bg-emerald-100 text-emerald-700" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={cn(
                      "p-2 transition-colors border-x border-slate-200",
                      previewMode === 'tablet' ? "bg-emerald-100 text-emerald-700" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={cn(
                      "p-2 transition-colors",
                      previewMode === 'mobile' ? "bg-emerald-100 text-emerald-700" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={cn(
            "p-6 bg-slate-100 min-h-[400px] flex items-center justify-center overflow-auto transition-all",
            !showPreview && "hidden"
          )}>
            {loading ? (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="font-medium">Carregando conteúdo...</p>
              </div>
            ) : showPreview ? (
              <div className="w-full">
                {renderPreview()}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <EyeOff className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Preview oculto</p>
                <p className="text-sm mt-1">Clique no ícone do olho para mostrar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

