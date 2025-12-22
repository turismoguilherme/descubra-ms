/**
 * SegmentedMetricsInput
 * Componente de entrada de métricas adaptável por segmento de negócio
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useBusinessSegment } from '@/hooks/useBusinessSegment';
import { businessMetricsService, MetricType } from '@/services/viajar/businessMetricsService';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SegmentedMetricsInputProps {
  onSave?: () => void;
}

export function SegmentedMetricsInput({ onSave }: SegmentedMetricsInputProps) {
  const auth = useAuth();
  const { user } = auth || { user: null };
  const { config, category, isLoading: segmentLoading } = useBusinessSegment();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (segmentLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-600">Carregando configuração...</span>
        </CardContent>
      </Card>
    );
  }

  if (!config || !category) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Por favor, configure o tipo de negócio no seu perfil para poder inserir métricas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleMetricChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setMetrics(prev => ({
      ...prev,
      [metricId]: numValue,
    }));
    setSaveStatus('idle');
    setErrorMessage(null);
  };

  const handleSave = async () => {
    if (!user?.id) {
      setErrorMessage('Usuário não identificado');
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage(null);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const savedMetrics: Promise<any>[] = [];

      // Salvar cada métrica preenchida
      for (const [metricId, value] of Object.entries(metrics)) {
        if (value > 0) {
          // Mapear metricId para metric_type do banco
          const metricType = mapMetricIdToType(metricId, category);
          if (metricType) {
            savedMetrics.push(
              businessMetricsService.saveMetric(
                user.id,
                dateStr,
                metricType,
                value,
                'manual'
              )
            );
          }
        }
      }

      if (savedMetrics.length === 0) {
        setErrorMessage('Preencha pelo menos uma métrica');
        setSaveStatus('error');
        return;
      }

      await Promise.all(savedMetrics);

      setSaveStatus('success');
      setMetrics({});
      setTimeout(() => {
        setSaveStatus('idle');
        onSave?.();
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao salvar métricas:', error);
      setErrorMessage(error.message || 'Erro ao salvar métricas');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Mapear metricId do config para metric_type do banco
  const mapMetricIdToType = (metricId: string, category: string): MetricType | null => {
    const mapping: Record<string, Record<string, MetricType>> = {
      hotel: {
        occupancy_rate: 'occupancy',
        adr: 'adr',
        revpar: 'revpar',
      },
      pousada: {
        occupancy_rate: 'occupancy',
        adr: 'adr',
      },
      restaurante: {
        avg_ticket: 'ticket_avg',
        tables_turnover: 'table_turnover',
        occupancy_rate: 'occupancy',
      },
      agencia: {
        bookings: 'pax',
        avg_package_value: 'revenue',
      },
      atracao: {
        visitors: 'visitors',
        avg_ticket: 'ticket_avg',
        occupancy_rate: 'occupancy',
      },
    };

    return mapping[category]?.[metricId] || null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inserir Métricas</CardTitle>
        <CardDescription>
          Preencha as métricas do seu negócio para o dia selecionado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seletor de Data */}
        <div className="space-y-2">
          <Label>Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Campos de Métricas */}
        <div className="space-y-4">
          {config.metrics.map((metric) => {
            const value = metrics[metric.id] || '';
            return (
              <div key={metric.id} className="space-y-2">
                <Label htmlFor={metric.id}>
                  {metric.label}
                  {metric.unit && <span className="text-gray-500 ml-1">({metric.unit})</span>}
                </Label>
                {metric.description && (
                  <p className="text-xs text-gray-500">{metric.description}</p>
                )}
                <Input
                  id={metric.id}
                  type="number"
                  step="0.01"
                  min="0"
                  value={value}
                  onChange={(e) => handleMetricChange(metric.id, e.target.value)}
                  placeholder="0"
                />
              </div>
            );
          })}
        </div>

        {/* Status de Salvamento */}
        {saveStatus === 'success' && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Métricas salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === 'error' && errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Botão de Salvar */}
        <Button
          onClick={handleSave}
          disabled={isSaving || Object.keys(metrics).length === 0}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Métricas
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

