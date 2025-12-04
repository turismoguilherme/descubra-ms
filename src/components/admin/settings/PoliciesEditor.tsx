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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [activePolicy, setActivePolicy] = useState<string>('terms_of_use');
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

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
        // Usar dados padrão se a tabela não existir
        const defaultData = DEFAULT_POLICIES.map((p, index) => ({
          ...p,
          id: `local-${index}`,
          last_updated: new Date().toISOString(),
        }));
        setPolicies(defaultData);
        
        // Salvar no localStorage como fallback
        localStorage.setItem('platform_policies', JSON.stringify(defaultData));
      } else if (data && data.length > 0) {
        setPolicies(data);
      } else {
        // Criar políticas padrão
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
      // Tentar carregar do localStorage
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
        description: `${updatedPolicy.title} atualizado para versão ${updatedPolicy.version}`,
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

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'viajar':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">ViajARTur</Badge>;
      case 'descubra_ms':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Descubra MS</Badge>;
      default:
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Ambas</Badge>;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Políticas e Termos</h2>
          <p className="text-zinc-400 mt-1">Gerencie todos os documentos legais das plataformas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de políticas */}
        <Card className="lg:col-span-1 bg-[#1A1D27] border-[#2D3348]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">Documentos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 p-2">
              {policies.map((policy) => {
                const Icon = POLICY_ICONS[policy.key] || FileText;
                return (
                  <button
                    key={policy.key}
                    onClick={() => {
                      setActivePolicy(policy.key);
                      setEditMode(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activePolicy === policy.key
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'text-zinc-400 hover:text-white hover:bg-[#27272A]'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{policy.title}</span>
                    {policy.is_published ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-3 bg-[#1A1D27] border-[#2D3348]">
          {currentPolicy && (
            <>
              <CardHeader className="border-b border-[#27272A]">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-white">{currentPolicy.title}</CardTitle>
                      {getPlatformBadge(currentPolicy.platform)}
                    </div>
                    <CardDescription className="flex items-center gap-4 text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Atualizado: {format(new Date(currentPolicy.last_updated), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <span>Versão: {currentPolicy.version}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="publish" className="text-sm text-zinc-400">Publicado</Label>
                      <Switch
                        id="publish"
                        checked={currentPolicy.is_published}
                        onCheckedChange={() => handleTogglePublish(currentPolicy.key)}
                      />
                    </div>
                    {editMode ? (
                      <>
                        <Button variant="outline" size="sm" onClick={cancelEditing}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSavePolicy} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {previewMode ? 'Ocultar Preview' : 'Preview'}
                        </Button>
                        <Button size="sm" onClick={startEditing}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-zinc-400 mb-2 block">Conteúdo (suporta Markdown)</Label>
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[500px] bg-[#141720] border-[#27272A] font-mono text-sm"
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
                            className="bg-[#141720] p-6 rounded-lg border border-[#27272A]"
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
                          <pre className="whitespace-pre-wrap text-zinc-400 font-mono text-sm bg-[#141720] p-6 rounded-lg border border-[#27272A]">
                            {currentPolicy.content}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-400 mb-2">Documento vazio</h3>
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
    </div>
  );
}

