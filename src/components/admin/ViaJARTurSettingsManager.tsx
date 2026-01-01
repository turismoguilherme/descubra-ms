import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Save, Loader2, Building2, Landmark, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlanSettings {
  professional_price: string;
  professional_name: string;
  professional_description: string;
  professional_payment_link: string;
  government_price: string;
  government_name: string;
  government_description: string;
  government_payment_link: string;
}

export default function ViaJARTurSettingsManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlanSettings>({
    professional_price: '200.00',
    professional_name: 'Plano Empresários',
    professional_description: 'Para hotéis, pousadas, agências e operadores de turismo',
    professional_payment_link: '',
    government_price: '2000.00',
    government_name: 'Plano Secretárias',
    government_description: 'Para secretarias de turismo e órgãos públicos',
    government_payment_link: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const keys = [
        'viajar_professional_price',
        'viajar_professional_name',
        'viajar_professional_description',
        'viajar_professional_payment_link',
        'viajar_government_price',
        'viajar_government_name',
        'viajar_government_description',
        'viajar_government_payment_link',
      ];

      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('platform', 'viajar')
        .in('setting_key', keys);

      if (error) {
        console.error('Erro ao carregar configurações ViaJARTur:', error);
      }

      if (data && data.length > 0) {
        const newSettings = { ...settings };
        data.forEach((item) => {
          const key = item.setting_key.replace('viajar_', '') as keyof PlanSettings;
          if (key in newSettings) {
            newSettings[key] = String(item.setting_value || '');
          }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof PlanSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Validar preços
    const professionalPrice = parseFloat(settings.professional_price);
    const governmentPrice = parseFloat(settings.government_price);

    if (isNaN(professionalPrice) || professionalPrice <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'O valor do Plano Empresários deve ser um número maior que zero',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(governmentPrice) || governmentPrice <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'O valor do Plano Secretárias deve ser um número maior que zero',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Salvar todas as configurações
      const settingsToSave = [
        { key: 'viajar_professional_price', value: settings.professional_price, description: 'Valor mensal do Plano Empresários (R$)' },
        { key: 'viajar_professional_name', value: settings.professional_name, description: 'Nome do Plano Empresários' },
        { key: 'viajar_professional_description', value: settings.professional_description, description: 'Descrição do Plano Empresários' },
        { key: 'viajar_professional_payment_link', value: settings.professional_payment_link, description: 'Payment Link do Stripe para Plano Empresários' },
        { key: 'viajar_government_price', value: settings.government_price, description: 'Valor mensal do Plano Secretárias (R$)' },
        { key: 'viajar_government_name', value: settings.government_name, description: 'Nome do Plano Secretárias' },
        { key: 'viajar_government_description', value: settings.government_description, description: 'Descrição do Plano Secretárias' },
        { key: 'viajar_government_payment_link', value: settings.government_payment_link, description: 'Payment Link do Stripe para Plano Secretárias' },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            platform: 'viajar',
            setting_key: setting.key,
            setting_value: setting.value,
            description: setting.description,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'platform,setting_key',
          });

        if (error) throw error;
      }

      // Disparar evento customizado para notificar outros componentes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('siteSettingsUpdated', { 
          detail: { platform: 'viajar' } 
        }));
      }

      toast({
        title: 'Salvo com sucesso!',
        description: 'As configurações do ViaJARTur foram atualizadas. As mudanças serão refletidas em alguns segundos.',
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as alterações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aviso importante */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Importante:</strong> Os valores aqui são apenas para exibição na plataforma. 
          Para alterar o valor <strong>cobrado</strong>, você deve atualizar também no 
          <strong> Dashboard do Stripe</strong> (Payment Links ou Products).
        </AlertDescription>
      </Alert>

      {/* Plano Empresários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Plano Empresários (Professional)
          </CardTitle>
          <CardDescription>
            Configurações do plano para hotéis, pousadas, agências e operadores de turismo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="professional_name">Nome do Plano</Label>
              <Input
                id="professional_name"
                value={settings.professional_name}
                onChange={(e) => handleChange('professional_name', e.target.value)}
                placeholder="Plano Empresários"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professional_price">Valor Mensal (R$)</Label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">R$</span>
                <Input
                  id="professional_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.professional_price}
                  onChange={(e) => handleChange('professional_price', e.target.value)}
                  placeholder="200.00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional_description">Descrição</Label>
            <Textarea
              id="professional_description"
              value={settings.professional_description}
              onChange={(e) => handleChange('professional_description', e.target.value)}
              placeholder="Para hotéis, pousadas, agências e operadores de turismo"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional_payment_link">Payment Link do Stripe</Label>
            <div className="flex items-center gap-2">
              <Input
                id="professional_payment_link"
                type="url"
                value={settings.professional_payment_link}
                onChange={(e) => handleChange('professional_payment_link', e.target.value)}
                placeholder="https://buy.stripe.com/..."
                className="flex-1"
              />
              {settings.professional_payment_link && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(settings.professional_payment_link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Cole aqui o link de pagamento criado no Stripe Dashboard
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plano Secretárias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-green-600" />
            Plano Secretárias (Government)
          </CardTitle>
          <CardDescription>
            Configurações do plano para secretarias de turismo e órgãos públicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="government_name">Nome do Plano</Label>
              <Input
                id="government_name"
                value={settings.government_name}
                onChange={(e) => handleChange('government_name', e.target.value)}
                placeholder="Plano Secretárias"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="government_price">Valor Mensal (R$)</Label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">R$</span>
                <Input
                  id="government_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.government_price}
                  onChange={(e) => handleChange('government_price', e.target.value)}
                  placeholder="2000.00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="government_description">Descrição</Label>
            <Textarea
              id="government_description"
              value={settings.government_description}
              onChange={(e) => handleChange('government_description', e.target.value)}
              placeholder="Para secretarias de turismo e órgãos públicos"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="government_payment_link">Payment Link do Stripe</Label>
            <div className="flex items-center gap-2">
              <Input
                id="government_payment_link"
                type="url"
                value={settings.government_payment_link}
                onChange={(e) => handleChange('government_payment_link', e.target.value)}
                placeholder="https://buy.stripe.com/..."
                className="flex-1"
              />
              {settings.government_payment_link && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(settings.government_payment_link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Cole aqui o link de pagamento criado no Stripe Dashboard
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

