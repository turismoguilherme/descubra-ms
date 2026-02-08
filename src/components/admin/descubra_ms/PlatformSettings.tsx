import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';

export default function PlatformSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    platform_name: 'Descubra MS',
    description: '',
    contact_email: '',
    contact_phone: '',
    ai_enabled: true,
    passport_enabled: true,
    analytics_enabled: true,
    whatsapp_enabled: false,
    whatsapp_phone: '',
    whatsapp_message: '',
  });

  useEffect(() => {
    fetchSettings();
    fetchWhatsAppSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('flowtrip_states')
        .select('*')
        .eq('code', 'MS')
        .single();

      if (data) {
        setSettings(prev => ({
          ...prev,
          platform_name: data.name || 'Descubra MS',
          description: data.description || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const fetchWhatsAppSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('platform', 'ms')
        .in('setting_key', ['ms_whatsapp_enabled', 'ms_whatsapp_phone', 'ms_whatsapp_message']);

      if (data) {
        const newSettings = { ...settings };
        data.forEach((item) => {
          if (item.setting_key === 'ms_whatsapp_enabled') {
            newSettings.whatsapp_enabled = item.setting_value === true || item.setting_value === 'true';
          } else if (item.setting_key === 'ms_whatsapp_phone') {
            newSettings.whatsapp_phone = item.setting_value || '';
          } else if (item.setting_key === 'ms_whatsapp_message') {
            newSettings.whatsapp_message = item.setting_value || '';
          }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do WhatsApp:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Salvar configurações da plataforma
      await supabase
        .from('flowtrip_states')
        .update({
          name: settings.platform_name,
          description: settings.description,
        })
        .eq('code', 'MS');

      // Salvar configurações do WhatsApp
      const whatsappSettings = [
        {
          key: 'ms_whatsapp_enabled',
          value: settings.whatsapp_enabled,
          description: 'Ativar/desativar botão flutuante do WhatsApp'
        },
        {
          key: 'ms_whatsapp_phone',
          value: settings.whatsapp_phone,
          description: 'Número do WhatsApp (formato: 67999999999)'
        },
        {
          key: 'ms_whatsapp_message',
          value: settings.whatsapp_message,
          description: 'Mensagem pré-definida do WhatsApp (opcional)'
        },
      ];

      for (const setting of whatsappSettings) {
        await supabase
          .from('site_settings')
          .upsert({
            platform: 'ms',
            setting_key: setting.key,
            setting_value: setting.value,
            description: setting.description,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'platform,setting_key',
          });
      }

      // Disparar evento para atualizar componentes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('siteSettingsUpdated', {
          detail: { platform: 'ms' }
        }));
      }

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="Configurações da Plataforma"
          description="Configure informações gerais, funcionalidades e contatos da plataforma Descubra MS."
          helpText="Configure informações gerais, funcionalidades e contatos da plataforma Descubra MS."
        />
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>Dados básicos da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="platform_name">Nome da Plataforma</Label>
                <Input
                  id="platform_name"
                  value={settings.platform_name}
                  onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades</CardTitle>
              <CardDescription>Habilitar/desabilitar funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai_enabled">IA Guatá</Label>
                  <p className="text-sm text-gray-500">Assistente virtual inteligente</p>
                </div>
                <Switch
                  id="ai_enabled"
                  checked={settings.ai_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, ai_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="passport_enabled">Passaporte Digital</Label>
                  <p className="text-sm text-gray-500">Sistema de gamificação</p>
                </div>
                <Switch
                  id="passport_enabled"
                  checked={settings.passport_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, passport_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics_enabled">Analytics</Label>
                  <p className="text-sm text-gray-500">Análise de dados e métricas</p>
                </div>
                <Switch
                  id="analytics_enabled"
                  checked={settings.analytics_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, analytics_enabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>Dados de contato da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Telefone</Label>
                <Input
                  id="contact_phone"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Botão Flutuante WhatsApp</CardTitle>
              <CardDescription>
                Configure o botão flutuante do WhatsApp que aparece em todas as páginas da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="whatsapp_enabled">Ativar Botão WhatsApp</Label>
                  <p className="text-sm text-gray-500">Exibir botão flutuante do WhatsApp nas páginas</p>
                </div>
                <Switch
                  id="whatsapp_enabled"
                  checked={settings.whatsapp_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, whatsapp_enabled: checked })}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp_phone">Número do WhatsApp</Label>
                <Input
                  id="whatsapp_phone"
                  value={settings.whatsapp_phone}
                  onChange={(e) => setSettings({ ...settings, whatsapp_phone: e.target.value })}
                  placeholder="67999999999"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Apenas números (ex: 67999999999). O DDI 55 será adicionado automaticamente.
                </p>
              </div>
              <div>
                <Label htmlFor="whatsapp_message">Mensagem Pré-definida (Opcional)</Label>
                <Textarea
                  id="whatsapp_message"
                  value={settings.whatsapp_message}
                  onChange={(e) => setSettings({ ...settings, whatsapp_message: e.target.value })}
                  placeholder="Olá! Gostaria de montar um roteiro personalizado para minha viagem."
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Mensagem que será enviada quando o usuário clicar no botão
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
