import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, MessageCircle } from 'lucide-react';

export default function WhatsAppSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    whatsapp_enabled: false,
    whatsapp_phone: '',
    whatsapp_message: '',
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
        .in('setting_key', ['ms_whatsapp_enabled', 'ms_whatsapp_phone', 'ms_whatsapp_message']);

      if (error) throw error;

      const newSettings = {
        whatsapp_enabled: false,
        whatsapp_phone: '',
        whatsapp_message: '',
      };

      data?.forEach((item) => {
        if (item.setting_key === 'ms_whatsapp_enabled') {
          newSettings.whatsapp_enabled = item.setting_value === true || item.setting_value === 'true';
        } else if (item.setting_key === 'ms_whatsapp_phone') {
          newSettings.whatsapp_phone = item.setting_value || '';
        } else if (item.setting_key === 'ms_whatsapp_message') {
          newSettings.whatsapp_message = item.setting_value || '';
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

      for (const setting of whatsappSettings) {
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
        description: 'Configurações do WhatsApp salvas com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar configurações do WhatsApp',
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-green-500" />
            Configurações do WhatsApp
          </h2>
          <p className="text-gray-600 mt-1">Configure o botão flutuante do WhatsApp</p>
        </div>
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
    </div>
  );
}

