import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, MessageCircle, Route } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';

export default function WhatsAppSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    whatsapp_enabled: false,
    whatsapp_phone: '',
    whatsapp_message: '',
    // Configurações de Roteiros Personalizados
    roteiro_banner_enabled: true,
    roteiro_contact_type: 'whatsapp' as 'whatsapp' | 'link' | 'both',
    roteiro_external_link: '',
    roteiro_external_link_text: 'Acessar Site',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('platform', 'ms')
        .in('setting_key', [
          'ms_whatsapp_enabled', 
          'ms_whatsapp_phone', 
          'ms_whatsapp_message',
          'ms_roteiro_banner_enabled',
          'ms_roteiro_contact_type',
          'ms_roteiro_external_link',
          'ms_roteiro_external_link_text'
        ]);

      if (error) throw error;

      const newSettings = {
        whatsapp_enabled: false,
        whatsapp_phone: '',
        whatsapp_message: '',
        roteiro_banner_enabled: true,
        roteiro_contact_type: 'whatsapp' as 'whatsapp' | 'link' | 'both',
        roteiro_external_link: '',
        roteiro_external_link_text: 'Acessar Site',
      };

      data?.forEach((item) => {
        const value = typeof item.setting_value === 'string' 
          ? item.setting_value.replace(/^"|"$/g, '') 
          : item.setting_value;

        if (item.setting_key === 'ms_whatsapp_enabled') {
          newSettings.whatsapp_enabled = value === true || value === 'true';
        } else if (item.setting_key === 'ms_whatsapp_phone') {
          newSettings.whatsapp_phone = String(value || '');
        } else if (item.setting_key === 'ms_whatsapp_message') {
          newSettings.whatsapp_message = String(value || '');
        } else if (item.setting_key === 'ms_roteiro_banner_enabled') {
          newSettings.roteiro_banner_enabled = value === true || value === 'true';
        } else if (item.setting_key === 'ms_roteiro_contact_type') {
          newSettings.roteiro_contact_type = (value as 'whatsapp' | 'link' | 'both') || 'whatsapp';
        } else if (item.setting_key === 'ms_roteiro_external_link') {
          newSettings.roteiro_external_link = String(value || '');
        } else if (item.setting_key === 'ms_roteiro_external_link_text') {
          newSettings.roteiro_external_link_text = String(value || 'Acessar Site');
        }
      });

      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações do WhatsApp:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações do WhatsApp',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
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

      const roteiroSettings = [
        {
          key: 'ms_roteiro_banner_enabled',
          value: settings.roteiro_banner_enabled,
          description: 'Ativar/desativar banner de roteiros personalizados'
        },
        {
          key: 'ms_roteiro_contact_type',
          value: settings.roteiro_contact_type,
          description: 'Tipo de contato: whatsapp, link ou both'
        },
        {
          key: 'ms_roteiro_external_link',
          value: settings.roteiro_external_link,
          description: 'URL do site externo para contato'
        },
        {
          key: 'ms_roteiro_external_link_text',
          value: settings.roteiro_external_link_text,
          description: 'Texto do botão para link externo'
        },
      ];

      const allSettings = [...whatsappSettings, ...roteiroSettings];

      for (const setting of allSettings) {
        const { error } = await supabase
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

        if (error) throw error;
      }

      // Disparar evento para atualizar o botão flutuante
      window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar configurações do WhatsApp',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="Configurações do WhatsApp"
          description="Configure o botão flutuante do WhatsApp e opções de contato para roteiros personalizados."
          helpText="Configure o botão flutuante do WhatsApp e opções de contato para roteiros personalizados."
        />
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Botão Flutuante WhatsApp</CardTitle>
          <CardDescription>
            Configure o botão flutuante do WhatsApp que aparece em todas as páginas da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="whatsapp_enabled" className="text-base font-medium">
                Ativar Botão WhatsApp
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Exibir botão flutuante do WhatsApp nas páginas da plataforma
              </p>
            </div>
            <Switch
              id="whatsapp_enabled"
              checked={settings.whatsapp_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, whatsapp_enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_phone">Número do WhatsApp</Label>
            <Input
              id="whatsapp_phone"
              value={settings.whatsapp_phone}
              onChange={(e) => setSettings({ ...settings, whatsapp_phone: e.target.value.replace(/\D/g, '') })}
              placeholder="67999999999"
              type="tel"
            />
            <p className="text-sm text-gray-500">
              Apenas números (ex: 67999999999). O DDI 55 será adicionado automaticamente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_message">Mensagem Pré-definida (Opcional)</Label>
            <Textarea
              id="whatsapp_message"
              value={settings.whatsapp_message}
              onChange={(e) => setSettings({ ...settings, whatsapp_message: e.target.value })}
              placeholder="Olá! Gostaria de montar um roteiro personalizado para minha viagem."
              rows={4}
            />
            <p className="text-sm text-gray-500">
              Mensagem que será enviada quando o usuário clicar no botão do WhatsApp
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Roteiros Personalizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-blue-500" />
            Banner de Roteiros Personalizados
          </CardTitle>
          <CardDescription>
            Configure o banner "Montamos seu roteiro personalizado" que aparece na página inicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="roteiro_banner_enabled" className="text-base font-medium">
                Ativar Banner de Roteiros
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Exibir o banner de roteiros personalizados na página inicial
              </p>
            </div>
            <Switch
              id="roteiro_banner_enabled"
              checked={settings.roteiro_banner_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, roteiro_banner_enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roteiro_contact_type">Tipo de Contato</Label>
            <Select
              value={settings.roteiro_contact_type}
              onValueChange={(value: 'whatsapp' | 'link' | 'both') => 
                setSettings({ ...settings, roteiro_contact_type: value })
              }
            >
              <SelectTrigger id="roteiro_contact_type">
                <SelectValue placeholder="Selecione o tipo de contato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">Apenas WhatsApp</SelectItem>
                <SelectItem value="link">Apenas Link Externo</SelectItem>
                <SelectItem value="both">WhatsApp e Link Externo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Escolha como os visitantes podem entrar em contato para solicitar roteiros personalizados
            </p>
          </div>

          {(settings.roteiro_contact_type === 'link' || settings.roteiro_contact_type === 'both') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="roteiro_external_link">Link Externo (URL)</Label>
                <Input
                  id="roteiro_external_link"
                  value={settings.roteiro_external_link}
                  onChange={(e) => setSettings({ ...settings, roteiro_external_link: e.target.value })}
                  placeholder="https://exemplo.com/roteiros"
                  type="url"
                />
                <p className="text-sm text-gray-500">
                  URL completa do site externo (ex: https://www.exemplo.com/roteiros)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roteiro_external_link_text">Texto do Botão Link Externo</Label>
                <Input
                  id="roteiro_external_link_text"
                  value={settings.roteiro_external_link_text}
                  onChange={(e) => setSettings({ ...settings, roteiro_external_link_text: e.target.value })}
                  placeholder="Acessar Site"
                />
                <p className="text-sm text-gray-500">
                  Texto que aparecerá no botão do link externo (ex: "Acessar Site", "Solicitar Roteiro")
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

