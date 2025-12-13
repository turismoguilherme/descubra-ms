import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Shield, 
  Cookie, 
  Scale, 
  RefreshCw, 
  Save, 
  Eye,
  Edit3,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Building2,
  Link as LinkIcon,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { policyContentImporter } from '@/services/admin/policyContentImporter';

interface PolicyDocument {
  id: string;
  key: string;
  title: string;
  content: string;
  platform: 'viajar' | 'descubra_ms' | 'both';
  is_published: boolean;
  version: number;
  last_updated: string;
  updated_by?: string;
}

const DEFAULT_POLICIES: Omit<PolicyDocument, 'id' | 'last_updated'>[] = [
  {
    key: 'terms_of_use',
    title: 'Termos de Uso',
    content: '',
    platform: 'both',
    is_published: true,
    version: 1,
  },
  {
    key: 'privacy_policy',
    title: 'Política de Privacidade',
    content: '',
    platform: 'both',
    is_published: true,
    version: 1,
  },
  {
    key: 'cookie_policy',
    title: 'Política de Cookies',
    content: '',
    platform: 'both',
    is_published: true,
    version: 1,
  },
  {
    key: 'refund_policy',
    title: 'Política de Reembolso',
    content: '',
    platform: 'viajar',
    is_published: true,
    version: 1,
  },
  {
    key: 'subscription_terms',
    title: 'Termos de Assinatura',
    content: '',
    platform: 'viajar',
    is_published: true,
    version: 1,
  },
  {
    key: 'partner_terms',
    title: 'Termos para Parceiros',
    content: '',
    platform: 'descubra_ms',
    is_published: true,
    version: 1,
  },
  {
    key: 'event_terms',
    title: 'Termos para Eventos',
    content: '',
    platform: 'descubra_ms',
    is_published: true,
    version: 1,
  },
];

const POLICY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  terms_of_use: Scale,
  privacy_policy: Shield,
  cookie_policy: Cookie,
  refund_policy: RefreshCw,
  subscription_terms: FileText,
  partner_terms: FileText,
  event_terms: FileText,
};

export default function PoliciesEditor() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'descubra_ms' | 'viajar'>('descubra_ms');
  const [activePolicy, setActivePolicy] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    // Selecionar primeira política da plataforma ativa
    const platformPolicies = getPoliciesForPlatform(activePlatform);
    if (platformPolicies.length > 0 && !activePolicy) {
      setActivePolicy(platformPolicies[0].key);
    } else if (activePolicy) {
      // Verificar se a política ativa pertence à plataforma atual
      const currentPolicy = policies.find(p => p.key === activePolicy);
      if (currentPolicy && currentPolicy.platform !== 'both' && currentPolicy.platform !== activePlatform) {
        // Se não pertence, selecionar primeira da plataforma atual
        if (platformPolicies.length > 0) {
          setActivePolicy(platformPolicies[0].key);
        }
      }
    }
  }, [activePlatform, policies]);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      // Tentar carregar do banco de dados
      const { data, error } = await supabase
        .from('platform_policies')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Tabela platform_policies não existe, usando dados locais');
        const defaultData = DEFAULT_POLICIES.map((p, index) => ({
          ...p,
          id: `local-${index}`,
          last_updated: new Date().toISOString(),
        }));
        setPolicies(defaultData);
        localStorage.setItem('platform_policies', JSON.stringify(defaultData));
      } else if (data && data.length > 0) {
        setPolicies(data);
      } else {
        const defaultData = DEFAULT_POLICIES.map((p, index) => ({
          ...p,
          id: `local-${index}`,
          last_updated: new Date().toISOString(),
        }));
        setPolicies(defaultData);
        localStorage.setItem('platform_policies', JSON.stringify(defaultData));
      }
    } catch (error) {
      console.error('Erro ao carregar políticas:', error);
      const cached = localStorage.getItem('platform_policies');
      if (cached) {
        setPolicies(JSON.parse(cached));
      } else {
        const defaultData = DEFAULT_POLICIES.map((p, index) => ({
          ...p,
          id: `local-${index}`,
          last_updated: new Date().toISOString(),
        }));
        setPolicies(defaultData);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPoliciesForPlatform = (platform: 'descubra_ms' | 'viajar') => {
    return policies.filter(p => 
      p.platform === platform || p.platform === 'both'
    );
  };

  const handleSavePolicy = async () => {
    setSaving(true);
    try {
      const policyIndex = policies.findIndex(p => p.key === activePolicy);
      if (policyIndex === -1) return;

      const updatedPolicy = {
        ...policies[policyIndex],
        content: editedContent,
        version: policies[policyIndex].version + 1,
        last_updated: new Date().toISOString(),
      };

      // Se a política é compartilhada, atualizar para ambas as plataformas
      if (updatedPolicy.platform === 'both') {
        // Manter platform: 'both' para indicar que é compartilhada
      }

      // Tentar salvar no banco
      try {
        const { error } = await supabase
          .from('platform_policies')
          .upsert({
            key: updatedPolicy.key,
            title: updatedPolicy.title,
            content: updatedPolicy.content,
            platform: updatedPolicy.platform,
            is_published: updatedPolicy.is_published,
            version: updatedPolicy.version,
            updated_at: updatedPolicy.last_updated,
          }, { onConflict: 'key' });

        if (error) throw error;
      } catch (dbError) {
        console.warn('Salvando no localStorage:', dbError);
      }

      // Atualizar estado local
      const newPolicies = [...policies];
      newPolicies[policyIndex] = updatedPolicy;
      setPolicies(newPolicies);
      localStorage.setItem('platform_policies', JSON.stringify(newPolicies));

      setEditMode(false);
      toast({
        title: 'Salvo com sucesso!',
        description: `${updatedPolicy.title} atualizado para versão ${updatedPolicy.version}${updatedPolicy.platform === 'both' ? ' (aplicado para ambas as plataformas)' : ''}`,
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (policyKey: string) => {
    const policyIndex = policies.findIndex(p => p.key === policyKey);
    if (policyIndex === -1) return;

    const newPolicies = [...policies];
    newPolicies[policyIndex] = {
      ...newPolicies[policyIndex],
      is_published: !newPolicies[policyIndex].is_published,
      last_updated: new Date().toISOString(),
    };
    setPolicies(newPolicies);
    localStorage.setItem('platform_policies', JSON.stringify(newPolicies));

    toast({
      title: newPolicies[policyIndex].is_published ? 'Publicado' : 'Despublicado',
      description: `${newPolicies[policyIndex].title} foi ${newPolicies[policyIndex].is_published ? 'publicado' : 'despublicado'}`,
    });
  };

  const currentPolicy = policies.find(p => p.key === activePolicy);
  const platformPolicies = getPoliciesForPlatform(activePlatform);

  const startEditing = () => {
    if (currentPolicy) {
      setEditedContent(currentPolicy.content);
      setEditMode(true);
    }
  };

  const cancelEditing = () => {
    setEditMode(false);
    setEditedContent('');
  };

  const handleImportFromFile = () => {
    if (!currentPolicy) return;
    
    const importedContent = policyContentImporter.getContentFromFile(
      currentPolicy.key,
      activePlatform
    );
    
    if (importedContent) {
      setEditedContent(importedContent);
      setEditMode(true);
      toast({
        title: 'Conteúdo importado',
        description: 'O conteúdo do arquivo .tsx foi importado com sucesso. Revise e ajuste conforme necessário.',
      });
    } else {
      toast({
        title: 'Conteúdo não encontrado',
        description: 'Não foi possível encontrar o conteúdo para esta política no arquivo .tsx.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Políticas e Termos</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Gerencie todos os documentos legais das plataformas</p>
        </div>
      </div>

      {/* Abas por Plataforma */}
      <Tabs value={activePlatform} onValueChange={(value) => setActivePlatform(value as 'descubra_ms' | 'viajar')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="descubra_ms" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Descubra MS
          </TabsTrigger>
          <TabsTrigger value="viajar" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            ViajARTur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="descubra_ms" className="mt-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
            {/* Lista de políticas - Descubra MS */}
            <Card className="lg:col-span-1 bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  Documentos - Descubra MS
                </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
                <div className="space-y-1 p-3">
                  {platformPolicies.map((policy) => {
                const Icon = POLICY_ICONS[policy.key] || FileText;
                    const isShared = policy.platform === 'both';
                return (
                  <button
                    key={policy.key}
                    onClick={() => {
                      setActivePolicy(policy.key);
                      setEditMode(false);
                    }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                      activePolicy === policy.key
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{policy.title}</span>
                        <div className="flex items-center gap-1">
                          {isShared && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0 border-purple-300 text-purple-600 bg-purple-50">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              Compartilhado
                            </Badge>
                          )}
                    {policy.is_published ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                    )}
                        </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
            <Card className="lg:col-span-3 bg-white border-gray-200 shadow-sm">
          {currentPolicy && (
            <>
                  <CardHeader className="border-b border-gray-200 bg-gray-50/50 px-4 py-5 sm:px-6 sm:py-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div className="space-y-3 flex-1 min-w-0 pr-4">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <CardTitle className="text-gray-900 text-lg sm:text-xl break-words min-w-0">{currentPolicy.title}</CardTitle>
                          {currentPolicy.platform === 'descubra_ms' && (
                            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs whitespace-nowrap flex-shrink-0">
                              <MapPin className="h-3 w-3 mr-1" />
                              Apenas Descubra MS
                            </Badge>
                          )}
                        </div>
                        {currentPolicy.platform === 'both' && (
                          <div className="w-full mt-1">
                            <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 text-xs whitespace-nowrap">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Compartilhado (afeta ambas as plataformas)</span>
                              <span className="sm:hidden">Compartilhado</span>
                            </Badge>
                          </div>
                        )}
                        <CardDescription className="flex flex-wrap items-center gap-2 sm:gap-4 text-zinc-500 text-xs sm:text-sm">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                            <span className="hidden sm:inline">Atualizado: {format(new Date(currentPolicy.last_updated), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            <span className="sm:hidden">{format(new Date(currentPolicy.last_updated), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </span>
                          <span className="whitespace-nowrap">Versão: {currentPolicy.version}</span>
                    </CardDescription>
                  </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                          <Label htmlFor={`publish-${activePlatform}`} className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Publicado</Label>
                          <Switch
                            id={`publish-${activePlatform}`}
                            checked={currentPolicy.is_published}
                            onCheckedChange={() => handleTogglePublish(currentPolicy.key)}
                          />
                    </div>
                    {editMode ? (
                      <>
                            <Button variant="outline" size="sm" onClick={cancelEditing} className="text-xs sm:text-sm">
                              <span className="hidden sm:inline">Cancelar</span>
                              <span className="sm:hidden">Cancelar</span>
                        </Button>
                            <Button size="sm" onClick={handleSavePolicy} disabled={saving} className="text-xs sm:text-sm">
                              <Save className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">{saving ? 'Salvando...' : 'Salvar'}</span>
                        </Button>
                      </>
                    ) : (
                      <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleImportFromFile}
                              title="Importar conteúdo do arquivo .tsx"
                              className="text-xs sm:text-sm"
                            >
                              <Download className="h-4 w-4 sm:mr-2" />
                              <span className="hidden md:inline">Importar do .tsx</span>
                              <span className="md:hidden">Importar</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)} className="text-xs sm:text-sm">
                              <Eye className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">{previewMode ? 'Ocultar Preview' : 'Preview'}</span>
                            </Button>
                            <Button size="sm" onClick={startEditing} className="text-xs sm:text-sm">
                              <Edit3 className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Editar</span>
                        </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 max-h-[calc(100vh-320px)] overflow-y-auto min-h-0">
                    {editMode ? (
                      <div className="space-y-4">
                        {currentPolicy.platform === 'both' && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <LinkIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-purple-900">Política Compartilhada</p>
                                <p className="text-xs text-purple-700 mt-1">
                                  Esta política é compartilhada entre Descubra MS e ViajARTur. 
                                  Qualquer alteração será aplicada para ambas as plataformas.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div>
                          <Label className="text-gray-600 mb-2 block">Conteúdo (suporta Markdown)</Label>
                          <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="min-h-[500px] bg-white border-gray-200 font-mono text-sm"
                            placeholder={`# ${currentPolicy.title}\n\nDigite o conteúdo aqui...\n\n## Seção 1\n\nTexto da seção...\n\n## Seção 2\n\nMais conteúdo...`}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span>Dica: Use # para títulos, ## para subtítulos, **texto** para negrito</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentPolicy.content ? (
                          <div className="prose prose-invert max-w-none">
                            {previewMode ? (
                              <div 
                                className="bg-white p-6 rounded-lg border border-gray-200"
                                dangerouslySetInnerHTML={{ 
                                  __html: currentPolicy.content
                                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                                    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                                    .replace(/\*(.*)\*/gim, '<em>$1</em>')
                                    .replace(/\n/gim, '<br />')
                                }}
                              />
                            ) : (
                              <pre className="whitespace-pre-wrap text-gray-600 font-mono text-sm bg-white p-6 rounded-lg border border-gray-200">
                                {currentPolicy.content}
                              </pre>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Documento vazio</h3>
                            <p className="text-sm text-zinc-500 mb-4">
                              Este documento ainda não possui conteúdo.
                            </p>
                            <Button onClick={startEditing}>
                          <Edit3 className="h-4 w-4 mr-2" />
                              Começar a escrever
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="viajar" className="mt-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
            {/* Lista de políticas - ViajARTur */}
            <Card className="lg:col-span-1 bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Documentos - ViajARTur
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 p-3">
                  {getPoliciesForPlatform('viajar').map((policy) => {
                    const Icon = POLICY_ICONS[policy.key] || FileText;
                    const isShared = policy.platform === 'both';
                    return (
                      <button
                        key={policy.key}
                        onClick={() => {
                          setActivePolicy(policy.key);
                          setEditMode(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                          activePolicy === policy.key
                            ? 'bg-blue-500/10 text-blue-700 border border-blue-500/30'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{policy.title}</span>
                        <div className="flex items-center gap-1">
                          {isShared && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0 border-purple-300 text-purple-600 bg-purple-50">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              Compartilhado
                            </Badge>
                          )}
                          {policy.is_published ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Editor */}
            <Card className="lg:col-span-3 bg-white border-gray-200 shadow-sm min-w-0 overflow-hidden">
              {currentPolicy && (
                <>
                  <CardHeader className="border-b border-gray-200 bg-gray-50/50 px-4 py-5 sm:px-6 sm:py-6 flex-shrink-0">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between w-full sm:gap-6">
                      <div className="space-y-3 flex-1 min-w-0 max-w-full pr-4">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <CardTitle className="text-gray-900 text-lg sm:text-xl break-words min-w-0">{currentPolicy.title}</CardTitle>
                          {currentPolicy.platform === 'viajar' && (
                            <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-xs whitespace-nowrap flex-shrink-0">
                              <Building2 className="h-3 w-3 mr-1" />
                              Apenas ViajARTur
                            </Badge>
                          )}
                        </div>
                        {currentPolicy.platform === 'both' && (
                          <div className="w-full mt-1">
                            <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 text-xs whitespace-nowrap">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Compartilhado (afeta ambas as plataformas)</span>
                              <span className="sm:hidden">Compartilhado</span>
                            </Badge>
                          </div>
                        )}
                        <CardDescription className="flex flex-wrap items-center gap-2 sm:gap-4 text-zinc-500 text-xs sm:text-sm">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            <span className="hidden sm:inline">Atualizado: {format(new Date(currentPolicy.last_updated), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            <span className="sm:hidden">{format(new Date(currentPolicy.last_updated), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </span>
                          <span className="whitespace-nowrap">Versão: {currentPolicy.version}</span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="publish-viajar" className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Publicado</Label>
                          <Switch
                            id="publish-viajar"
                            checked={currentPolicy.is_published}
                            onCheckedChange={() => handleTogglePublish(currentPolicy.key)}
                          />
                        </div>
                        {editMode ? (
                          <>
                            <Button variant="outline" size="sm" onClick={cancelEditing} className="text-xs sm:text-sm">
                              <span className="hidden sm:inline">Cancelar</span>
                              <span className="sm:hidden">Cancelar</span>
                            </Button>
                            <Button size="sm" onClick={handleSavePolicy} disabled={saving} className="text-xs sm:text-sm">
                              <Save className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">{saving ? 'Salvando...' : 'Salvar'}</span>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleImportFromFile}
                              title="Importar conteúdo do arquivo .tsx"
                              className="text-xs sm:text-sm"
                            >
                              <Download className="h-4 w-4 sm:mr-2" />
                              <span className="hidden md:inline">Importar do .tsx</span>
                              <span className="md:hidden">Importar</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)} className="text-xs sm:text-sm">
                              <Eye className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">{previewMode ? 'Ocultar Preview' : 'Preview'}</span>
                            </Button>
                            <Button size="sm" onClick={startEditing} className="text-xs sm:text-sm">
                              <Edit3 className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Editar</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
                  <CardContent className="p-4 sm:p-6 max-h-[calc(100vh-320px)] overflow-y-auto min-h-0">
                {editMode ? (
                  <div className="space-y-4">
                        {currentPolicy.platform === 'both' && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <LinkIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-purple-900">Política Compartilhada</p>
                                <p className="text-xs text-purple-700 mt-1">
                                  Esta política é compartilhada entre Descubra MS e ViajARTur. 
                                  Qualquer alteração será aplicada para ambas as plataformas.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                    <div>
                      <Label className="text-gray-600 mb-2 block">Conteúdo (suporta Markdown)</Label>
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[500px] bg-white border-gray-200 font-mono text-sm"
                        placeholder={`# ${currentPolicy.title}\n\nDigite o conteúdo aqui...\n\n## Seção 1\n\nTexto da seção...\n\n## Seção 2\n\nMais conteúdo...`}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>Dica: Use # para títulos, ## para subtítulos, **texto** para negrito</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentPolicy.content ? (
                      <div className="prose prose-invert max-w-none">
                        {previewMode ? (
                          <div 
                            className="bg-white p-6 rounded-lg border border-gray-200"
                            dangerouslySetInnerHTML={{ 
                              __html: currentPolicy.content
                                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                                .replace(/\n/gim, '<br />')
                            }}
                          />
                        ) : (
                          <pre className="whitespace-pre-wrap text-gray-600 font-mono text-sm bg-white p-6 rounded-lg border border-gray-200">
                            {currentPolicy.content}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Documento vazio</h3>
                        <p className="text-sm text-zinc-500 mb-4">
                          Este documento ainda não possui conteúdo.
                        </p>
                        <Button onClick={startEditing}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Começar a escrever
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}