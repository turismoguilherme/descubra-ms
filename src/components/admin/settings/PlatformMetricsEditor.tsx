/**
 * Platform Metrics Editor
 * Permite editar métricas públicas da plataforma (override manual)
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  MapPin, 
  Award,
  Info,
  CheckCircle2
} from 'lucide-react';
import { platformMetricsService, PlatformMetrics } from '@/services/public/platformMetricsService';
import { useToast } from '@/hooks/use-toast';

export default function PlatformMetricsEditor() {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    tourists_impacted: 0,
    satisfaction_percentage: 0,
    tourist_spots: 0,
    partners: 0,
  });
  const [autoMetrics, setAutoMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState<'auto' | 'manual'>('auto');
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const currentMetrics = await platformMetricsService.getMetrics();
      setMetrics({
        tourists_impacted: currentMetrics.tourists_impacted,
        satisfaction_percentage: currentMetrics.satisfaction_percentage,
        tourist_spots: currentMetrics.tourist_spots,
        partners: currentMetrics.partners,
      });
      setSource(currentMetrics.source);

      // Carregar também as métricas automáticas para comparação
      const auto = await platformMetricsService.calculateAutoMetrics();
      setAutoMetrics(auto);
    } catch (error: any) {
      console.error('Erro ao carregar métricas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar métricas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await platformMetricsService.saveManualMetrics(metrics);
      setSource('manual');
      toast({
        title: 'Sucesso',
        description: 'Métricas salvas com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao salvar métricas:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar métricas',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUseAuto = async () => {
    if (!autoMetrics) {
      const auto = await platformMetricsService.calculateAutoMetrics();
      setAutoMetrics(auto);
      setMetrics(auto);
      setSource('auto');
    } else {
      setMetrics(autoMetrics);
      setSource('auto');
    }
    toast({
      title: 'Métricas automáticas aplicadas',
      description: 'Os valores foram atualizados com os dados do banco',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando métricas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Métricas Públicas</h2>
        <p className="text-muted-foreground mt-1">
          Configure as métricas exibidas na página "Casos de Sucesso"
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema Híbrido:</strong> Se você definir valores manuais, eles serão usados. 
          Caso contrário, as métricas serão calculadas automaticamente a partir do banco de dados.
          Você pode usar "Usar Valores Automáticos" para atualizar com os dados reais.
        </AlertDescription>
      </Alert>

      {/* Source Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Fonte atual:</span>
        <Badge variant={source === 'manual' ? 'default' : 'secondary'}>
          {source === 'manual' ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Manual
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Automático
            </>
          )}
        </Badge>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Turistas Impactados */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-viajar-cyan" />
              <CardTitle className="text-lg">Turistas Impactados</CardTitle>
            </div>
            <CardDescription>
              Total de turistas que utilizaram a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tourists">Valor</Label>
              <Input
                id="tourists"
                type="number"
                value={metrics.tourists_impacted}
                onChange={(e) => setMetrics({
                  ...metrics,
                  tourists_impacted: parseInt(e.target.value) || 0,
                })}
                placeholder="Ex: 50000"
              />
              {autoMetrics && (
                <p className="text-xs text-muted-foreground">
                  Automático: {platformMetricsService.formatNumber(autoMetrics.tourists_impacted)}
                </p>
              )}
              <p className="text-sm font-medium">
                Exibido como: {platformMetricsService.formatNumber(metrics.tourists_impacted)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Satisfação */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-lg">Satisfação</CardTitle>
            </div>
            <CardDescription>
              Percentual de satisfação dos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="satisfaction">Percentual (0-100)</Label>
              <Input
                id="satisfaction"
                type="number"
                min="0"
                max="100"
                value={metrics.satisfaction_percentage}
                onChange={(e) => setMetrics({
                  ...metrics,
                  satisfaction_percentage: parseInt(e.target.value) || 0,
                })}
                placeholder="Ex: 95"
              />
              {autoMetrics && (
                <p className="text-xs text-muted-foreground">
                  Automático: {platformMetricsService.formatPercentage(autoMetrics.satisfaction_percentage)}
                </p>
              )}
              <p className="text-sm font-medium">
                Exibido como: {platformMetricsService.formatPercentage(metrics.satisfaction_percentage)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pontos Turísticos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-viajar-blue" />
              <CardTitle className="text-lg">Pontos Turísticos</CardTitle>
            </div>
            <CardDescription>
              Total de destinos e atrativos cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="spots">Valor</Label>
              <Input
                id="spots"
                type="number"
                value={metrics.tourist_spots}
                onChange={(e) => setMetrics({
                  ...metrics,
                  tourist_spots: parseInt(e.target.value) || 0,
                })}
                placeholder="Ex: 200"
              />
              {autoMetrics && (
                <p className="text-xs text-muted-foreground">
                  Automático: {autoMetrics.tourist_spots}
                </p>
              )}
              <p className="text-sm font-medium">
                Exibido como: {metrics.tourist_spots}+
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Parceiros */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Parceiros</CardTitle>
            </div>
            <CardDescription>
              Total de parceiros ativos na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="partners">Valor</Label>
              <Input
                id="partners"
                type="number"
                value={metrics.partners}
                onChange={(e) => setMetrics({
                  ...metrics,
                  partners: parseInt(e.target.value) || 0,
                })}
                placeholder="Ex: 150"
              />
              {autoMetrics && (
                <p className="text-xs text-muted-foreground">
                  Automático: {autoMetrics.partners}
                </p>
              )}
              <p className="text-sm font-medium">
                Exibido como: {metrics.partners}+
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Valores Manuais'}
            </Button>
            <Button
              onClick={handleUseAuto}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Usar Valores Automáticos
            </Button>
            <Button
              onClick={loadMetrics}
              variant="ghost"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
