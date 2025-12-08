import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const [msSettings, setMsSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);
  const [viajarSettings, setViajarSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'ms' | 'viajar'>('ms');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Carregar settings do Descubra MS
      const { data: msData, error: msError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('platform', 'ms')
        .eq('setting_key', 'footer')
        .maybeSingle();

      if (msError) {
        console.error('Erro ao carregar settings MS:', msError);
      } else if (msData?.setting_value) {
        setMsSettings(msData.setting_value as FooterSettings);
      }

      // Carregar settings do ViaJAR
      const { data: viajarData, error: viajarError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('platform', 'viajar')
        .eq('setting_key', 'footer')
        .maybeSingle();

      if (viajarError) {
        console.error('Erro ao carregar settings ViaJAR:', viajarError);
      } else if (viajarData?.setting_value) {
        setViajarSettings(viajarData.setting_value as FooterSettings);
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
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          platform,
          setting_key: 'footer',
          setting_value: settings,
          description: `Configurações do footer para ${platform === 'ms' ? 'Descubra MS' : 'ViaJAR'}`,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'platform,setting_key'
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Configurações do footer ${platform === 'ms' ? 'Descubra MS' : 'ViaJAR'} salvas com sucesso!`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar configurações',
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

      <div className="flex justify-end">
        <Button
          onClick={() => saveSettings(platform, settings)}
          disabled={saving}
          size="lg"
        >
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
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




