import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Palette, 
  Globe, 
  Upload, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Eye,
  Code,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { masterDashboardService } from '@/services/masterDashboardService';

interface PlatformConfig {
  id: string;
  name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  is_active: boolean;
  contact_email: string;
  contact_phone: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  features: {
    ai_enabled: boolean;
    community_enabled: boolean;
    rewards_enabled: boolean;
    analytics_enabled: boolean;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string;
  };
}

interface SystemStatus {
  database_status: 'healthy' | 'warning' | 'error';
  api_status: 'healthy' | 'warning' | 'error';
  storage_status: 'healthy' | 'warning' | 'error';
  last_backup: string;
  version: string;
}

const PlatformConfigCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchPlatformConfig();
    fetchSystemStatus();
  }, []);

  const fetchPlatformConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('flowtrip_states')
        .select('*')
        .eq('code', 'MS')
        .single();

      if (error) throw error;

      const formattedConfig: PlatformConfig = {
        id: data.id,
        name: data.name,
        logo_url: data.logo_url || '',
        primary_color: data.primary_color || '#1e40af',
        secondary_color: data.secondary_color || '#3b82f6',
        accent_color: data.accent_color || '#10b981',
        is_active: data.is_active,
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        social_media: data.social_media || {},
        features: data.features || {
          ai_enabled: true,
          community_enabled: true,
          rewards_enabled: true,
          analytics_enabled: true
        },
        seo: data.seo || {
          meta_title: '',
          meta_description: '',
          keywords: ''
        }
      };

      setConfig(formattedConfig);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar configurações da plataforma",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      // Simular verificação de status do sistema
      // Em produção, implementar verificações reais
      const status: SystemStatus = {
        database_status: 'healthy',
        api_status: 'healthy',
        storage_status: 'healthy',
        last_backup: new Date().toISOString(),
        version: '1.0.0'
      };

      setSystemStatus(status);
    } catch (error) {
      console.error('Erro ao buscar status do sistema:', error);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('flowtrip_states')
        .update({
          name: config.name,
          logo_url: config.logo_url,
          primary_color: config.primary_color,
          secondary_color: config.secondary_color,
          accent_color: config.accent_color,
          contact_email: config.contact_email,
          contact_phone: config.contact_phone,
          social_media: config.social_media,
          features: config.features,
          seo: config.seo,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;

      // Notificar o Master Dashboard sobre a atualização
      await masterDashboardService.notifyPlatformUpdate({
        update_type: 'config',
        description: 'Configurações da plataforma atualizadas',
        data: {
          updated_fields: ['branding', 'features', 'contact', 'seo'],
          features_status: config.features,
          contact_info: {
            email: config.contact_email,
            phone: config.contact_phone
          }
        }
      });

      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso",
      });

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      
      // Enviar alerta de erro para o Master Dashboard
      await masterDashboardService.sendAlert({
        severity: 'error',
        type: 'system',
        message: 'Falha ao atualizar configurações da plataforma',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (colorType: 'primary_color' | 'secondary_color' | 'accent_color', value: string) => {
    if (config) {
      setConfig({
        ...config,
        [colorType]: value
      });
    }
  };

  const handleFeatureToggle = (feature: keyof PlatformConfig['features'], enabled: boolean) => {
    if (config) {
      setConfig({
        ...config,
        features: {
          ...config.features,
          [feature]: enabled
        }
      });
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    const config = {
      healthy: { label: 'Saudável', class: 'bg-green-500' },
      warning: { label: 'Atenção', class: 'bg-yellow-500' },
      error: { label: 'Erro', class: 'bg-red-500' }
    };

    const statusConfig = config[status];
    return (
      <Badge className={statusConfig.class}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Não foi possível carregar as configurações da plataforma.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Central de Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie configurações e informações da plataforma
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchPlatformConfig}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleSaveConfig} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Status do Sistema */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(systemStatus.database_status)}
                <div>
                  <p className="font-medium">Banco de Dados</p>
                  {getStatusBadge(systemStatus.database_status)}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon(systemStatus.api_status)}
                <div>
                  <p className="font-medium">API</p>
                  {getStatusBadge(systemStatus.api_status)}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon(systemStatus.storage_status)}
                <div>
                  <p className="font-medium">Storage</p>
                  {getStatusBadge(systemStatus.storage_status)}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Versão</p>
                  <p className="text-sm text-muted-foreground">{systemStatus.version}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="branding">Visual</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="platform-name">Nome da Plataforma</Label>
                  <Input
                    id="platform-name"
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logo-url">URL da Logo</Label>
                  <Input
                    id="logo-url"
                    value={config.logo_url}
                    onChange={(e) => setConfig({...config, logo_url: e.target.value})}
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="platform-active"
                    checked={config.is_active}
                    onCheckedChange={(checked) => setConfig({...config, is_active: checked})}
                  />
                  <Label htmlFor="platform-active">Plataforma Ativa</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => handleColorChange('primary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.primary_color}
                      onChange={(e) => handleColorChange('primary_color', e.target.value)}
                      placeholder="#1e40af"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={config.secondary_color}
                      onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.secondary_color}
                      onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accent-color">Cor de Destaque</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={config.accent_color}
                      onChange={(e) => handleColorChange('accent_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.accent_color}
                      onChange={(e) => handleColorChange('accent_color', e.target.value)}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Prévia das Cores</h4>
                <div className="flex space-x-4">
                  <div 
                    className="w-16 h-16 rounded-lg" 
                    style={{ backgroundColor: config.primary_color }}
                    title="Cor Primária"
                  ></div>
                  <div 
                    className="w-16 h-16 rounded-lg" 
                    style={{ backgroundColor: config.secondary_color }}
                    title="Cor Secundária"
                  ></div>
                  <div 
                    className="w-16 h-16 rounded-lg" 
                    style={{ backgroundColor: config.accent_color }}
                    title="Cor de Destaque"
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades da Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Inteligência Artificial</p>
                      <p className="text-sm text-muted-foreground">
                        Chatbot e recomendações inteligentes
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.features.ai_enabled}
                    onCheckedChange={(checked) => handleFeatureToggle('ai_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Comunidade</p>
                      <p className="text-sm text-muted-foreground">
                        Sugestões e interação da comunidade
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.features.community_enabled}
                    onCheckedChange={(checked) => handleFeatureToggle('community_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Sistema de Recompensas</p>
                      <p className="text-sm text-muted-foreground">
                        Passaporte digital e gamificação
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.features.rewards_enabled}
                    onCheckedChange={(checked) => handleFeatureToggle('rewards_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Analytics Avançado</p>
                      <p className="text-sm text-muted-foreground">
                        Relatórios e análises detalhadas
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.features.analytics_enabled}
                    onCheckedChange={(checked) => handleFeatureToggle('analytics_enabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contact-email">Email de Contato</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={config.contact_email}
                    onChange={(e) => setConfig({...config, contact_email: e.target.value})}
                    placeholder="contato@exemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact-phone">Telefone de Contato</Label>
                  <Input
                    id="contact-phone"
                    value={config.contact_phone}
                    onChange={(e) => setConfig({...config, contact_phone: e.target.value})}
                    placeholder="(67) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Redes Sociais</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Facebook URL"
                      value={config.social_media.facebook || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        social_media: { ...config.social_media, facebook: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="Instagram URL"
                      value={config.social_media.instagram || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        social_media: { ...config.social_media, instagram: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="Twitter URL"
                      value={config.social_media.twitter || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        social_media: { ...config.social_media, twitter: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="YouTube URL"
                      value={config.social_media.youtube || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        social_media: { ...config.social_media, youtube: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="meta-title">Título da Página (Meta Title)</Label>
                  <Input
                    id="meta-title"
                    value={config.seo.meta_title}
                    onChange={(e) => setConfig({
                      ...config,
                      seo: { ...config.seo, meta_title: e.target.value }
                    })}
                    placeholder="Descubra Mato Grosso do Sul - Turismo Oficial"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="meta-description">Descrição (Meta Description)</Label>
                  <Textarea
                    id="meta-description"
                    value={config.seo.meta_description}
                    onChange={(e) => setConfig({
                      ...config,
                      seo: { ...config.seo, meta_description: e.target.value }
                    })}
                    placeholder="Descubra os melhores destinos turísticos de Mato Grosso do Sul..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="keywords">Palavras-chave (separadas por vírgula)</Label>
                  <Textarea
                    id="keywords"
                    value={config.seo.keywords}
                    onChange={(e) => setConfig({
                      ...config,
                      seo: { ...config.seo, keywords: e.target.value }
                    })}
                    placeholder="turismo, mato grosso do sul, pantanal, bonito, destinos..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformConfigCenter; 