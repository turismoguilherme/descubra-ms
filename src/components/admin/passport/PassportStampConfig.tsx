import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { passportAdminService } from '@/services/admin/passportAdminService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PassportStampConfig: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [formData, setFormData] = useState({
    stamp_theme: 'onca' as 'onca' | 'tuiuiu' | 'jacare' | 'arara',
    stamp_fragments: 5,
    video_url: '',
    description: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routesRes, configsRes] = await Promise.all([
        supabase.from('routes').select('*').eq('is_active', true),
        passportAdminService.getConfigurations(),
      ]);

      if (routesRes.error) throw routesRes.error;
      setRoutes(routesRes.data || []);
      setConfigs(configsRes);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRoute) {
      toast({
        title: 'Selecione uma rota',
        variant: 'destructive',
      });
      return;
    }

    try {
      const existing = configs.find(c => c.route_id === selectedRoute);
      if (existing) {
        await passportAdminService.updateConfiguration(selectedRoute, formData);
      } else {
        await passportAdminService.createConfiguration({
          route_id: selectedRoute,
          ...formData,
          map_config: {},
          is_active: true,
        });
      }
      toast({
        title: 'Configuração salva',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Carimbos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Rota</Label>
          <Select value={selectedRoute} onValueChange={setSelectedRoute}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma rota" />
            </SelectTrigger>
            <SelectContent>
              {routes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRoute && (
          <>
            <div>
              <Label>Tema do Carimbo</Label>
              <Select
                value={formData.stamp_theme}
                onValueChange={(v: any) => setFormData({ ...formData, stamp_theme: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onca">🐆 Onça-Pintada</SelectItem>
                  <SelectItem value="tuiuiu">🦅 Tuiuiú</SelectItem>
                  <SelectItem value="jacare">🐊 Jacaré</SelectItem>
                  <SelectItem value="arara">🦜 Arara-Azul</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Número de Fragmentos</Label>
              <Input
                type="number"
                min="1"
                value={formData.stamp_fragments}
                onChange={(e) =>
                  setFormData({ ...formData, stamp_fragments: parseInt(e.target.value) || 5 })
                }
              />
            </div>

            <div>
              <Label>URL do Vídeo (opcional)</Label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do roteiro..."
              />
            </div>

            <Button onClick={handleSave}>Salvar Configuração</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PassportStampConfig;

