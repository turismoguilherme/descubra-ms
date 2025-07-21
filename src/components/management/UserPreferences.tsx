import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface UserPreferences {
  defaultReportFormat: 'pdf' | 'csv';
  autoRefreshInterval: number;
  showCommunityData: boolean;
  showEconomicData: boolean;
  defaultView: 'insights' | 'recommendations' | 'metrics';
  notificationsEnabled: boolean;
  customSections: string[];
}

export function UserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultReportFormat: 'pdf',
    autoRefreshInterval: 30,
    showCommunityData: true,
    showEconomicData: true,
    defaultView: 'insights',
    notificationsEnabled: true,
    customSections: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences,
          updated_at: new Date()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando preferências...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Análise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formato de Relatório */}
        <div className="space-y-2">
          <Label>Formato Padrão de Relatório</Label>
          <Select
            value={preferences.defaultReportFormat}
            onValueChange={(value: 'pdf' | 'csv') => 
              setPreferences(prev => ({ ...prev, defaultReportFormat: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Intervalo de Atualização */}
        <div className="space-y-2">
          <Label>Intervalo de Atualização (minutos)</Label>
          <Input
            type="number"
            value={preferences.autoRefreshInterval}
            onChange={(e) => 
              setPreferences(prev => ({ 
                ...prev, 
                autoRefreshInterval: parseInt(e.target.value) || 30 
              }))
            }
            min={5}
            max={120}
          />
        </div>

        {/* Visualização de Dados */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={preferences.showCommunityData}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, showCommunityData: checked }))
              }
            />
            <Label>Mostrar Dados da Comunidade</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={preferences.showEconomicData}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, showEconomicData: checked }))
              }
            />
            <Label>Mostrar Dados Econômicos</Label>
          </div>
        </div>

        {/* Visualização Padrão */}
        <div className="space-y-2">
          <Label>Visualização Padrão</Label>
          <Select
            value={preferences.defaultView}
            onValueChange={(value: 'insights' | 'recommendations' | 'metrics') =>
              setPreferences(prev => ({ ...prev, defaultView: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="insights">Insights</SelectItem>
              <SelectItem value="recommendations">Recomendações</SelectItem>
              <SelectItem value="metrics">Métricas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notificações */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={preferences.notificationsEnabled}
            onCheckedChange={(checked) =>
              setPreferences(prev => ({ ...prev, notificationsEnabled: checked }))
            }
          />
          <Label>Ativar Notificações</Label>
        </div>

        {/* Botão Salvar */}
        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </CardContent>
    </Card>
  );
} 