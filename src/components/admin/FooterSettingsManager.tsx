import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Save, Loader2, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Globe } from 'lucide-react';

interface FooterSettings {
  email: string;
  phone: string;
  address: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  copyright?: string;
}

const DEFAULT_SETTINGS: FooterSettings = {
  email: '',
  phone: '',
  address: '',
  social_media: {},
  copyright: '',
};

export default function FooterSettingsManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [msSettings, setMsSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);
  const [viajarSettings, setViajarSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'ms' | 'viajar'>('ms');
  const [lastSaved, setLastSaved] = useState<{ platform: string; timestamp: Date | null }>({ platform: '', timestamp: null });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    console.log('📥 [FooterSettingsManager] Carregando settings do banco...');
    try {
      // Carregar settings do Descubra MS
      const { data: msData, error: msError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('platform', 'ms')
        .eq('setting_key', 'footer')
        .maybeSingle();

      if (msError) {
        console.error('❌ [FooterSettingsManager] Erro ao carregar settings MS:', msError);
      } else if (msData?.setting_value) {
        console.log('✅ [FooterSettingsManager] Settings MS carregados:', msData.setting_value);
        setMsSettings(msData.setting_value as FooterSettings);
      } else {
        console.log('ℹ️ [FooterSettingsManager] Nenhum setting MS encontrado no banco, usando padrão');
      }

      // Carregar settings do ViaJAR
      const { data: viajarData, error: viajarError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('platform', 'viajar')
        .eq('setting_key', 'footer')
        .maybeSingle();

      if (viajarError) {
        console.error('❌ [FooterSettingsManager] Erro ao carregar settings ViaJAR:', viajarError);
      } else if (viajarData?.setting_value) {
        console.log('✅ [FooterSettingsManager] Settings ViaJAR carregados:', viajarData.setting_value);
        setViajarSettings(viajarData.setting_value as FooterSettings);
      } else {
        console.log('ℹ️ [FooterSettingsManager] Nenhum setting ViaJAR encontrado no banco, usando padrão');
      }
    } catch (error: any) {
      console.error('Erro ao carregar settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (platform: 'ms' | 'viajar', settings: FooterSettings) => {
    setSaving(true);
    try {
      // Verificar se usuário está autenticado
      if (!user) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log(`💾 [FooterSettingsManager] Salvando configurações do footer para ${platform}:`, settings);

      // Obter ID do usuário atual
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        throw new Error('Não foi possível obter informações do usuário');
      }

      // Garantir que setting_value é um objeto válido
      const settingsToSave = {
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        social_media: settings.social_media || {},
        copyright: settings.copyright || '',
      };

      console.log(`💾 [FooterSettingsManager] Dados a serem salvos:`, {
        platform,
        setting_key: 'footer',
        setting_value: settingsToSave,
        updated_by: authUser.id,
      });

      const { data, error } = await supabase
        .from('site_settings')
        .upsert({
          platform,
          setting_key: 'footer',
          setting_value: settingsToSave,
          description: `Configurações do footer para ${platform === 'ms' ? 'Descubra MS' : 'ViaJAR'}`,
          updated_at: new Date().toISOString(),
          updated_by: authUser.id,
        }, {
          onConflict: 'platform,setting_key'
        })
        .select();

      if (error) {
        console.error('❌ [FooterSettingsManager] Erro ao salvar:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log('✅ [FooterSettingsManager] Configurações salvas com sucesso:', data);

      // Verificar se os dados foram realmente salvos no banco
      const { data: verifyData, error: verifyError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('platform', platform)
        .eq('setting_key', 'footer')
        .maybeSingle();

      if (verifyError) {
        console.error('❌ [FooterSettingsManager] Erro ao verificar dados salvos:', verifyError);
      } else if (verifyData) {
        console.log('✅ [FooterSettingsManager] Dados verificados no banco:', verifyData.setting_value);
      }

      // Atualizar estado local imediatamente para feedback visual
      if (platform === 'ms') {
        setMsSettings(settings);
      } else {
        setViajarSettings(settings);
      }

      // Recarregar settings do banco para garantir sincronização
      await loadSettings();

      // Invalidar cache global para forçar reload nos componentes que usam o hook
      const cacheKey = `footer_${platform}`;
      if (typeof window !== 'undefined') {
        // Disparar evento customizado para notificar outros componentes
        console.log(`📢 [FooterSettingsManager] Disparando evento footerSettingsUpdated para plataforma: ${platform}`);
        const event = new CustomEvent('footerSettingsUpdated', { 
          detail: { platform, settings } 
        });
        window.dispatchEvent(event);
        console.log(`✅ [FooterSettingsManager] Evento disparado com sucesso`);
        
        // Também disparar um evento global para garantir que seja capturado
        window.dispatchEvent(new Event('siteSettingsUpdated'));
        console.log(`✅ [FooterSettingsManager] Evento global siteSettingsUpdated também disparado`);
      }

      // Mostrar toast de sucesso com informações detalhadas
      toast({
        title: '✅ Configurações salvas com sucesso!',
        description: `As configurações do footer ${platform === 'ms' ? 'Descubra MS' : 'ViaJAR'} foram salvas no banco de dados. ${verifyData ? 'Dados verificados e confirmados.' : ''} As mudanças aparecerão no footer em até 5 segundos.`,
        duration: 8000,
      });

      // Atualizar timestamp de última salvamento
      setLastSaved({ platform, timestamp: new Date() });

      // Mostrar alerta visual adicional no console para debug
      console.log(`✅✅✅ [FooterSettingsManager] SALVAMENTO CONCLUÍDO PARA ${platform.toUpperCase()}`);
      console.log(`📋 Dados salvos:`, settings);
      if (verifyData) {
        console.log(`✅ Dados confirmados no banco:`, verifyData.setting_value);
      }
    } catch (error: any) {
      console.error('❌ [FooterSettingsManager] Erro geral ao salvar:', error);
      
      let errorMessage = 'Erro ao salvar configurações';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      } else if (error.hint) {
        errorMessage = error.hint;
      }

      toast({
        title: 'Erro ao salvar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderSettingsForm = (settings: FooterSettings, setSettings: React.Dispatch<React.SetStateAction<FooterSettings>>, platform: 'ms' | 'viajar') => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">
              <Mail className="inline h-4 w-4 mr-2" />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="contato@exemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">
              <Phone className="inline h-4 w-4 mr-2" />
              Telefone
            </Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="(67) 3318-7600"
            />
          </div>
          <div>
            <Label htmlFor="address">
              <MapPin className="inline h-4 w-4 mr-2" />
              Endereço
            </Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Endereço completo"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Redes Sociais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="facebook">
              <Facebook className="inline h-4 w-4 mr-2" />
              Facebook
            </Label>
            <Input
              id="facebook"
              value={settings.social_media.facebook || ''}
              onChange={(e) => setSettings({
                ...settings,
                social_media: { ...settings.social_media, facebook: e.target.value }
              })}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <Label htmlFor="instagram">
              <Instagram className="inline h-4 w-4 mr-2" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={settings.social_media.instagram || ''}
              onChange={(e) => setSettings({
                ...settings,
                social_media: { ...settings.social_media, instagram: e.target.value }
              })}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <Label htmlFor="twitter">
              <Twitter className="inline h-4 w-4 mr-2" />
              Twitter
            </Label>
            <Input
              id="twitter"
              value={settings.social_media.twitter || ''}
              onChange={(e) => setSettings({
                ...settings,
                social_media: { ...settings.social_media, twitter: e.target.value }
              })}
              placeholder="https://twitter.com/..."
            />
          </div>
          <div>
            <Label htmlFor="linkedin">
              <Linkedin className="inline h-4 w-4 mr-2" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={settings.social_media.linkedin || ''}
              onChange={(e) => setSettings({
                ...settings,
                social_media: { ...settings.social_media, linkedin: e.target.value }
              })}
              placeholder="https://linkedin.com/..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Outros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="copyright">Copyright</Label>
            <Input
              id="copyright"
              value={settings.copyright || ''}
              onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
              placeholder="© 2025 Descubra Mato Grosso do Sul. Todos os direitos reservados."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center border-t pt-4 mt-4">
        <div className="text-sm text-muted-foreground">
          {saving ? (
            <span className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando no banco de dados...
            </span>
          ) : lastSaved.platform === platform && lastSaved.timestamp ? (
            <span className="flex items-center gap-2 text-green-600">
              <Save className="h-4 w-4" />
              Salvo em {lastSaved.timestamp.toLocaleTimeString('pt-BR')} - As mudanças aparecerão no footer em até 5 segundos
            </span>
          ) : (
            <span>Clique em "Salvar" para aplicar as alterações</span>
          )}
        </div>
        <Button
          onClick={() => saveSettings(platform, settings)}
          disabled={saving}
          size="lg"
          className="min-w-[220px]"
          variant={saving ? "secondary" : "default"}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Configurações do Footer</h2>
        <p className="text-muted-foreground">Gerencie as informações de contato e redes sociais do footer</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ms' | 'viajar')}>
        <TabsList>
          <TabsTrigger value="ms">Descubra MS</TabsTrigger>
          <TabsTrigger value="viajar">ViaJAR</TabsTrigger>
        </TabsList>
        <TabsContent value="ms">
          {renderSettingsForm(msSettings, setMsSettings, 'ms')}
        </TabsContent>
        <TabsContent value="viajar">
          {renderSettingsForm(viajarSettings, setViajarSettings, 'viajar')}
        </TabsContent>
      </Tabs>
    </div>
  );
}




