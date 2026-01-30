import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Save, Loader2, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Globe, Plus, Trash2, Edit, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export interface PartnerLogo {
  id: string;
  name: string;
  logo_url: string;
  alt_text?: string;
  order: number;
}

interface FooterSettings {
  email?: string;
  phone?: string;
  address?: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  copyright?: string;
  business_hours?: {
    weekdays?: string;
    saturday?: string;
    sunday?: string;
  };
  partner_logos?: PartnerLogo[];
  viajar_link?: string;
  disclaimer?: string;
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
  const [kodaSettings, setKodaSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'ms' | 'viajar' | 'koda'>('ms');
  const [lastSaved, setLastSaved] = useState<{ platform: string; timestamp: Date | null }>({ platform: '', timestamp: null });
  
  // Estados para gerenciamento de logos de parceiros
  const [editingLogo, setEditingLogo] = useState<PartnerLogo | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [newLogoName, setNewLogoName] = useState('');
  const [newLogoAlt, setNewLogoAlt] = useState('');

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
        const loadedSettings = msData.setting_value as unknown as FooterSettings;
        // Garantir que partner_logos existe
        if (!loadedSettings.partner_logos) {
          loadedSettings.partner_logos = [];
        }
        setMsSettings(loadedSettings);
      } else {
        console.log('ℹ️ [FooterSettingsManager] Nenhum setting MS encontrado no banco, usando padrão');
        setMsSettings({ ...DEFAULT_SETTINGS, partner_logos: [] });
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
        const loadedSettings = viajarData.setting_value as unknown as FooterSettings;
        // Garantir que partner_logos existe
        if (!loadedSettings.partner_logos) {
          loadedSettings.partner_logos = [];
        }
        setViajarSettings(loadedSettings);
      } else {
        console.log('ℹ️ [FooterSettingsManager] Nenhum setting ViaJAR encontrado no banco, usando padrão');
        setViajarSettings({ ...DEFAULT_SETTINGS, partner_logos: [] });
      }

      // Carregar settings do Koda
      const { data: kodaData, error: kodaError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('platform', 'koda')
        .eq('setting_key', 'footer')
        .maybeSingle();

      if (kodaError) {
        console.error('❌ [FooterSettingsManager] Erro ao carregar settings Koda:', kodaError);
      } else if (kodaData?.setting_value) {
        console.log('✅ [FooterSettingsManager] Settings Koda carregados:', kodaData.setting_value);
        const loadedSettings = kodaData.setting_value as unknown as FooterSettings;
        setKodaSettings(loadedSettings);
      } else {
        console.log('ℹ️ [FooterSettingsManager] Nenhum setting Koda encontrado no banco, usando padrão');
        setKodaSettings({ ...DEFAULT_SETTINGS });
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (platform: 'ms' | 'viajar' | 'koda', settings: FooterSettings) => {
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
        business_hours: settings.business_hours || {},
        partner_logos: settings.partner_logos || [],
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
          setting_value: settingsToSave as any,
          description: `Configurações do footer para ${platform === 'ms' ? 'Descubra MS' : 'ViaJAR'}`,
          updated_at: new Date().toISOString(),
          updated_by: authUser.id,
        } as any, {
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [FooterSettingsManager] Erro geral ao salvar:', err);
      
      let errorMessage = 'Erro ao salvar configurações';
      if (err.message) {
        errorMessage = err.message;
      } else if ((error as any)?.details) {
        errorMessage = (error as any).details;
      } else if ((error as any)?.hint) {
        errorMessage = (error as any).hint;
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

  // Função para gerar UUID simples
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const BUCKET_NAME = 'site-assets';
  const currentPlatform = activeTab;

  // Função para upload de logo
  const uploadLogoFile = async (): Promise<string | null> => {
    if (!logoFile) return null;

    try {
      setUploadingLogo(true);
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `footer-logos/${currentPlatform}/${generateId()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          toast({
            title: 'Aviso',
            description: 'Bucket de imagens não encontrado. Você pode usar uma URL manualmente.',
            variant: 'default',
          });
          return null;
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || null;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro no upload:', err);
      toast({
        title: 'Erro no upload',
        description: err.message || 'Não foi possível fazer upload da imagem.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  // Função para abrir dialog de edição/criação de logo
  const openLogoDialog = (logo?: PartnerLogo) => {
    if (logo) {
      setEditingLogo(logo);
      setLogoPreview(logo.logo_url);
      setLogoFile(null);
      setNewLogoName('');
      setNewLogoAlt('');
    } else {
      setEditingLogo(null);
      setLogoPreview(null);
      setLogoFile(null);
      setNewLogoName('');
      setNewLogoAlt('');
    }
    setLogoDialogOpen(true);
  };

  // Função para salvar logo (criar ou editar)
  const handleSaveLogo = async (currentSettings: FooterSettings, setCurrentSettings: React.Dispatch<React.SetStateAction<FooterSettings>>) => {
    if (!logoFile && !editingLogo?.logo_url) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma imagem para o logo.',
        variant: 'destructive',
      });
      return;
    }

    let logoUrl = editingLogo?.logo_url || '';
    
    // Se houver novo arquivo, fazer upload
    if (logoFile) {
      const uploadedUrl = await uploadLogoFile();
      if (!uploadedUrl) return;
      logoUrl = uploadedUrl;
    }

    const currentLogos = currentSettings.partner_logos || [];
    let updatedLogos: PartnerLogo[];

    if (editingLogo) {
      // Editar logo existente
      updatedLogos = currentLogos.map(logo => 
        logo.id === editingLogo.id 
          ? { ...logo, name: editingLogo.name, logo_url: logoUrl, alt_text: editingLogo.alt_text }
          : logo
      );
    } else {
      // Adicionar novo logo
      if (!newLogoName.trim()) {
        toast({
          title: 'Erro',
          description: 'Por favor, informe o nome do parceiro.',
          variant: 'destructive',
        });
        return;
      }
      const maxOrder = currentLogos.length > 0 
        ? Math.max(...currentLogos.map(l => l.order)) 
        : 0;
      const newLogo: PartnerLogo = {
        id: generateId(),
        name: newLogoName.trim(),
        logo_url: logoUrl,
        alt_text: newLogoAlt.trim() || newLogoName.trim(),
        order: maxOrder + 1
      };
      updatedLogos = [...currentLogos, newLogo];
    }

    setCurrentSettings({ ...currentSettings, partner_logos: updatedLogos });
    setLogoDialogOpen(false);
    setEditingLogo(null);
    setLogoFile(null);
    setLogoPreview(null);
    setNewLogoName('');
    setNewLogoAlt('');
  };

  // Função para excluir logo
  const handleDeleteLogo = (logoId: string, currentSettings: FooterSettings, setCurrentSettings: React.Dispatch<React.SetStateAction<FooterSettings>>) => {
    const currentLogos = currentSettings.partner_logos || [];
    const updatedLogos = currentLogos.filter(logo => logo.id !== logoId);
    setCurrentSettings({ ...currentSettings, partner_logos: updatedLogos });
    toast({
      title: 'Logo removido',
      description: 'O logo foi removido. Não esqueça de salvar as configurações.',
    });
  };

  // Função para reordenar logos
  const handleReorderLogo = (logoId: string, direction: 'up' | 'down', currentSettings: FooterSettings, setCurrentSettings: React.Dispatch<React.SetStateAction<FooterSettings>>) => {
    const currentLogos = [...(currentSettings.partner_logos || [])].sort((a, b) => a.order - b.order);
    const index = currentLogos.findIndex(logo => logo.id === logoId);
    
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentLogos.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = currentLogos[index].order;
    currentLogos[index].order = currentLogos[newIndex].order;
    currentLogos[newIndex].order = temp;

    setCurrentSettings({ ...currentSettings, partner_logos: currentLogos });
  };

  // Função para selecionar arquivo de logo
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo de imagem.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Renderizar seção de logos de parceiros
  const renderPartnerLogosSection = (
    settings: FooterSettings, 
    setSettings: React.Dispatch<React.SetStateAction<FooterSettings>>, 
    platform: 'ms' | 'viajar'
  ) => {
    const logos = (settings.partner_logos || []).sort((a, b) => a.order - b.order);
    const maxLogos = 4;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logos de Parceiros
          </CardTitle>
          <CardDescription>
            Gerencie os logos de parceiros que aparecem no rodapé (máximo {maxLogos} logos)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum logo adicionado ainda.</p>
              <p className="text-sm">Clique em "Adicionar Logo" para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logos.map((logo, index) => (
                <div key={logo.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <img 
                      src={logo.logo_url} 
                      alt={logo.alt_text || logo.name}
                      className="h-16 w-auto object-contain max-w-[120px]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml,${encodeURIComponent(`<svg width="120" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="60" fill="#e5e7eb"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">Logo não disponível</text></svg>`)}`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{logo.name || 'Sem nome'}</p>
                    <p className="text-sm text-muted-foreground truncate">Ordem: {logo.order}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorderLogo(logo.id, 'up', settings, setSettings)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorderLogo(logo.id, 'down', settings, setSettings)}
                      disabled={index === logos.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLogoDialog(logo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover este logo?')) {
                          handleDeleteLogo(logo.id, settings, setSettings);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={() => openLogoDialog()}
            disabled={logos.length >= maxLogos}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {logos.length >= maxLogos ? `Limite de ${maxLogos} logos atingido` : 'Adicionar Logo'}
          </Button>

          {/* Dialog para adicionar/editar logo */}
          <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingLogo ? 'Editar Logo' : 'Adicionar Logo'}</DialogTitle>
                <DialogDescription>
                  {editingLogo 
                    ? 'Atualize as informações do logo de parceiro'
                    : 'Adicione um novo logo de parceiro para aparecer no rodapé'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logo-name">Nome do Parceiro</Label>
                  <Input
                    id="logo-name"
                    value={editingLogo ? editingLogo.name : newLogoName}
                    onChange={(e) => {
                      if (editingLogo) {
                        setEditingLogo({ ...editingLogo, name: e.target.value });
                      } else {
                        setNewLogoName(e.target.value);
                      }
                    }}
                    placeholder="Ex: Fecomércio MS"
                  />
                </div>
                <div>
                  <Label htmlFor="logo-alt">Texto Alternativo (Alt)</Label>
                  <Input
                    id="logo-alt"
                    value={editingLogo ? (editingLogo.alt_text || '') : newLogoAlt}
                    onChange={(e) => {
                      if (editingLogo) {
                        setEditingLogo({ ...editingLogo, alt_text: e.target.value });
                      } else {
                        setNewLogoAlt(e.target.value);
                      }
                    }}
                    placeholder="Logo do Fecomércio MS"
                  />
                </div>
                <div>
                  <Label htmlFor="logo-file">Imagem do Logo</Label>
                  <Input
                    id="logo-file"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileSelect}
                    className="cursor-pointer"
                  />
                  {logoPreview && (
                    <div className="mt-2">
                      <img 
                        src={logoPreview} 
                        alt="Preview" 
                        className="h-20 w-auto object-contain border rounded"
                      />
                    </div>
                  )}
                  {!logoFile && editingLogo?.logo_url && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-1">Logo atual:</p>
                      <img 
                        src={editingLogo.logo_url} 
                        alt={editingLogo.alt_text || editingLogo.name}
                        className="h-20 w-auto object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setLogoDialogOpen(false);
                    setEditingLogo(null);
                    setLogoFile(null);
                    setLogoPreview(null);
                    setNewLogoName('');
                    setNewLogoAlt('');
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    const currentSettings = platform === 'ms' ? msSettings : viajarSettings;
                    const setCurrentSettings = platform === 'ms' ? setMsSettings : setViajarSettings;
                    handleSaveLogo(currentSettings, setCurrentSettings);
                  }} disabled={uploadingLogo}>
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Fazendo upload...
                      </>
                    ) : (
                      'Salvar Logo'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  };

  const renderKodaSettingsForm = (settings: FooterSettings, setSettings: React.Dispatch<React.SetStateAction<FooterSettings>>) => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Link ViajARTur</CardTitle>
          <CardDescription>URL do site ViajARTur para exibir no rodapé</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="viajar_link">
              <Globe className="inline h-4 w-4 mr-2" />
              URL ViajARTur
            </Label>
            <Input
              id="viajar_link"
              value={settings.viajar_link || ''}
              onChange={(e) => setSettings({ ...settings, viajar_link: e.target.value })}
              placeholder="https://viajartur.com"
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
            <Label htmlFor="koda_facebook">
              <Facebook className="inline h-4 w-4 mr-2" />
              Facebook
            </Label>
            <Input
              id="koda_facebook"
              value={settings.social_media.facebook || ''}
              onChange={(e) => setSettings({
                ...settings,
                social_media: { ...settings.social_media, facebook: e.target.value }
              })}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <Label htmlFor="koda_instagram">
              <Instagram className="inline h-4 w-4 mr-2" />
              Instagram
            </Label>
            <Input
              id="koda_instagram"
              value={settings.social_media.instagram || ''}
              onChange={(e) => setSettings({
                ...settings,
                social_media: { ...settings.social_media, instagram: e.target.value }
              })}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <Label htmlFor="koda_twitter">
              <Twitter className="inline h-4 w-4 mr-2" />
              Twitter
            </Label>
            <Input
              id="koda_twitter"
              value={settings.social_media.twitter || ''}
              onChange={(e) => setSettings({
                ...settings,
                social_media: { ...settings.social_media, twitter: e.target.value }
              })}
              placeholder="https://twitter.com/..."
            />
          </div>
          <div>
            <Label htmlFor="koda_linkedin">
              <Linkedin className="inline h-4 w-4 mr-2" />
              LinkedIn
            </Label>
            <Input
              id="koda_linkedin"
              value={settings.social_media.linkedin || ''}
              onChange={(e) => setSettings({
                ...settings,
                social_media: { ...settings.social_media, linkedin: e.target.value }
              })}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Texto de Aviso</CardTitle>
          <CardDescription>Aviso de independência do projeto</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="disclaimer">Disclaimer (EN)</Label>
            <Input
              id="disclaimer"
              value={settings.disclaimer || ''}
              onChange={(e) => setSettings({ ...settings, disclaimer: e.target.value })}
              placeholder="Independent project by ViajARTur, not affiliated with the Government of Canada"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Copyright</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="koda_copyright">Texto de Copyright</Label>
            <Input
              id="koda_copyright"
              value={settings.copyright || ''}
              onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
              placeholder="© 2025 Koda. All rights reserved."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveSettings('koda', settings)}
          disabled={saving}
          className="w-full sm:w-auto"
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horário de Atendimento</CardTitle>
          <CardDescription>Configure os horários de atendimento que aparecerão na página de contato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="business_hours_weekdays">Segunda a Sexta</Label>
            <Input
              id="business_hours_weekdays"
              value={settings.business_hours?.weekdays || ''}
              onChange={(e) => setSettings({ 
                ...settings, 
                business_hours: { 
                  ...settings.business_hours, 
                  weekdays: e.target.value 
                } 
              })}
              placeholder="8h às 18h"
            />
          </div>
          <div>
            <Label htmlFor="business_hours_saturday">Sábado</Label>
            <Input
              id="business_hours_saturday"
              value={settings.business_hours?.saturday || ''}
              onChange={(e) => setSettings({ 
                ...settings, 
                business_hours: { 
                  ...settings.business_hours, 
                  saturday: e.target.value 
                } 
              })}
              placeholder="9h às 13h"
            />
          </div>
          <div>
            <Label htmlFor="business_hours_sunday">Domingo</Label>
            <Input
              id="business_hours_sunday"
              value={settings.business_hours?.sunday || ''}
              onChange={(e) => setSettings({ 
                ...settings, 
                business_hours: { 
                  ...settings.business_hours, 
                  sunday: e.target.value 
                } 
              })}
              placeholder="Fechado"
            />
          </div>
        </CardContent>
      </Card>

      {renderPartnerLogosSection(settings, setSettings, platform)}

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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ms' | 'viajar' | 'koda')}>
        <TabsList>
          <TabsTrigger value="ms">Descubra MS</TabsTrigger>
          <TabsTrigger value="viajar">ViaJAR</TabsTrigger>
          <TabsTrigger value="koda">Koda</TabsTrigger>
        </TabsList>
        <TabsContent value="ms">
          {renderSettingsForm(msSettings, setMsSettings, 'ms')}
        </TabsContent>
        <TabsContent value="viajar">
          {renderSettingsForm(viajarSettings, setViajarSettings, 'viajar')}
        </TabsContent>
        <TabsContent value="koda">
          {renderKodaSettingsForm(kodaSettings, setKodaSettings)}
        </TabsContent>
      </Tabs>
    </div>
  );
}




