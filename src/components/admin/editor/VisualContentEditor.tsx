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
import { useParams, useNavigate } from 'react-router-dom';
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
  
  const [selectedPage, setSelectedPage] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [content, setContent] = useState<Record<string, any>>({});
  const [originalContent, setOriginalContent] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
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
    loadContent();
  }, [selectedPage, selectedSection]);

  const loadContent = () => {
    if (!selectedPage || !selectedSection) return;
    
    const key = getStorageKey(platform, selectedPage, selectedSection);
    const saved = localStorage.getItem(key);
    
    if (saved) {
      const parsed = JSON.parse(saved);
      setContent(parsed);
      setOriginalContent(parsed);
    } else {
      // Dados padrão baseados na seção
      const defaultContent = getDefaultContent();
      setContent(defaultContent);
      setOriginalContent(defaultContent);
    }
    setHasChanges(false);
  };

  const getDefaultContent = () => {
    const defaults: Record<string, any> = {
      title: '',
      subtitle: '',
      cta_primary: 'Começar Agora',
      cta_secondary: 'Saiba Mais',
      background_image: '',
      content: '',
      items: [],
    };
    
    currentSection?.fields.forEach(field => {
      if (!defaults[field]) {
        defaults[field] = field.includes('items') ? [] : '';
      }
    });
    
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
    setSaving(true);
    try {
      const key = getStorageKey(platform, selectedPage, selectedSection);
      localStorage.setItem(key, JSON.stringify(content));
      setOriginalContent(content);
      setHasChanges(false);
      
      toast({
        title: 'Conteúdo salvo!',
        description: 'As alterações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
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
    if (!currentSection) return null;

    const previewWidth = {
      desktop: 'w-full',
      tablet: 'w-[768px]',
      mobile: 'w-[375px]',
    }[previewMode];

    // Preview simulado baseado na seção
    if (selectedSection === 'hero') {
      return (
        <div 
          className={cn(
            "bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 rounded-lg overflow-hidden transition-all mx-auto",
            previewWidth
          )}
          style={{
            backgroundImage: content.background_image ? `url(${content.background_image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="bg-black/40 p-8 md:p-12 text-center text-white">
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              {content.title || 'Título Principal'}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-6">
              {content.subtitle || 'Subtítulo descritivo aqui'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-medium">
                {content.cta_primary || 'Botão Principal'}
              </button>
              <button className="border border-white/50 hover:bg-white/10 px-6 py-3 rounded-lg font-medium">
                {content.cta_secondary || 'Botão Secundário'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (selectedSection === 'info' || selectedSection === 'social') {
      return (
        <div className={cn("bg-white rounded-lg p-6 border border-slate-200 mx-auto", previewWidth)}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {selectedSection === 'info' ? 'Informações de Contato' : 'Redes Sociais'}
          </h3>
          <div className="space-y-3">
            {currentSection.fields.map(field => (
              <div key={field} className="flex items-center gap-3">
                <span className="text-slate-500 capitalize">{field}:</span>
                <span className="text-slate-800">{content[field] || 'Não definido'}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Preview genérico
    return (
      <div className={cn("bg-white rounded-lg p-6 border border-slate-200 mx-auto", previewWidth)}>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{currentSection?.name}</h3>
        <div className="space-y-3">
          {currentSection?.fields.map(field => (
            <div key={field}>
              <span className="text-sm text-slate-500 capitalize">{field.replace(/_/g, ' ')}:</span>
              <p className="text-slate-800">
                {typeof content[field] === 'object' 
                  ? JSON.stringify(content[field]) 
                  : content[field] || 'Não definido'}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span>{platform === 'viajar' ? 'ViajARTur' : 'Descubra MS'}</span>
            <ChevronRight className="h-4 w-4" />
            <span>{currentPage?.name || 'Selecione uma página'}</span>
            {currentSection && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span>{currentSection.name}</span>
              </>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Editor Visual de Conteúdo</h2>
          <p className="text-slate-500 mt-1">Edite o conteúdo das páginas com preview em tempo real</p>
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
        {/* Navegação de Páginas */}
        <Card className="lg:col-span-2 bg-white border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Páginas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pages.map((page) => {
              const Icon = page.icon;
              return (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left border-b border-slate-100 last:border-0",
                    selectedPage === page.id
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {page.name}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Seções e Editor */}
        <div className="lg:col-span-4 space-y-4">
          {/* Seleção de Seção */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Seções</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="flex flex-wrap gap-2">
                {currentPage?.sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={selectedSection === section.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSection(section.id)}
                    className={selectedSection === section.id ? "bg-emerald-600" : ""}
                  >
                    {section.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Editor de Campos */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">{currentSection?.name || 'Selecione uma seção'}</CardTitle>
              <CardDescription>Edite os campos abaixo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentSection?.fields.map(field => renderField(field))}
              {!currentSection && (
                <p className="text-slate-400 text-center py-8">
                  Selecione uma página e seção para editar
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card className="lg:col-span-6 bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-800">Preview</CardTitle>
                <CardDescription>Visualize como ficará no site</CardDescription>
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
            "p-6 bg-slate-100 min-h-[400px] flex items-center justify-center overflow-auto",
            !showPreview && "hidden"
          )}>
            {renderPreview()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

