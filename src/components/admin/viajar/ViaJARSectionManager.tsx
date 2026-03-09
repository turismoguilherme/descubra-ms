import React, { useState } from 'react';
import { useViaJARSectionControls } from '@/hooks/useViaJARSectionControls';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { Loader2, Eye, EyeOff, Save, BarChart3, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const sectionDescriptions: Record<string, string> = {
  hero_stats: 'Estatísticas exibidas no hero (ex: +100K Usuários, 98% Satisfação)',
  what_we_do: 'Seção "O que a ViajARTur faz" com cards de produtos',
  platform_in_action: 'Dashboard interativo mostrando a plataforma funcionando',
  benefits: 'Grid de benefícios da plataforma para gestores',
  benefits_stats: 'Números de resultados na seção de benefícios (ex: 300% eficiência)',
  success_cases: 'Cases de sucesso (Descubra MS, Koda)',
  video_section: 'Seção com vídeo embed do YouTube',
  cta_section: 'Seção final com call-to-action'
};

export default function ViaJARSectionManager() {
  const { sections, metrics, loading, toggleSection, toggleMetric, updateMetric } = useViaJARSectionControls();
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [metricEdits, setMetricEdits] = useState<Record<string, { display_value: string; label: string }>>({});

  const handleToggleSection = async (key: string, active: boolean) => {
    try {
      await toggleSection(key, active);
      toast.success(`Seção "${sectionDescriptions[key] || key}" ${active ? 'ativada' : 'desativada'}`);
    } catch {
      toast.error('Erro ao atualizar seção');
    }
  };

  const handleToggleMetric = async (key: string, active: boolean) => {
    try {
      await toggleMetric(key, active);
      toast.success(`Métrica ${active ? 'ativada' : 'desativada'}`);
    } catch {
      toast.error('Erro ao atualizar métrica');
    }
  };

  const handleSaveMetric = async (metricKey: string) => {
    const edits = metricEdits[metricKey];
    if (!edits) return;
    try {
      await updateMetric(metricKey, edits);
      setEditingMetric(null);
      toast.success('Métrica atualizada');
    } catch {
      toast.error('Erro ao salvar métrica');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Agrupar métricas por seção
  const metricsBySection = metrics.reduce((acc, m) => {
    if (!acc[m.section_key]) acc[m.section_key] = [];
    acc[m.section_key].push(m);
    return acc;
  }, {} as Record<string, typeof metrics>);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Controle de Seções"
        description="Ative ou desative seções e métricas da landing page ViajARTur"
        helpText="Controle a visibilidade de cada seção da página principal. Métricas com ⚠️ são projeções/metas, não dados reais."
      />

      {/* Seções */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Seções da Landing Page</h3>
        <div className="grid gap-4">
          {sections.map(section => (
            <div
              key={section.section_key}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {section.is_active ? (
                  <Eye className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{section.section_title}</p>
                  <p className="text-sm text-gray-500">
                    {sectionDescriptions[section.section_key] || section.section_key}
                  </p>
                </div>
              </div>
              <Switch
                checked={section.is_active}
                onCheckedChange={(checked) => handleToggleSection(section.section_key, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Métricas por seção */}
      {Object.entries(metricsBySection).map(([sectionKey, sectionMetrics]) => {
        const sectionControl = sections.find(s => s.section_key === sectionKey);
        return (
          <div key={sectionKey} className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Métricas: {sectionControl?.section_title || sectionKey}
              </h3>
              {!sectionControl?.is_active && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Seção desativada
                </span>
              )}
            </div>

            <div className="grid gap-3">
              {sectionMetrics
                .sort((a, b) => a.display_order - b.display_order)
                .map(metric => (
                  <div
                    key={metric.metric_key}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Switch
                        checked={metric.is_active}
                        onCheckedChange={(checked) => handleToggleMetric(metric.metric_key, checked)}
                      />
                      
                      {editingMetric === metric.metric_key ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={metricEdits[metric.metric_key]?.display_value ?? metric.display_value}
                            onChange={(e) => setMetricEdits(prev => ({
                              ...prev,
                              [metric.metric_key]: {
                                ...(prev[metric.metric_key] || { display_value: metric.display_value, label: metric.label }),
                                display_value: e.target.value
                              }
                            }))}
                            className="w-24"
                            placeholder="Valor"
                          />
                          <Input
                            value={metricEdits[metric.metric_key]?.label ?? metric.label}
                            onChange={(e) => setMetricEdits(prev => ({
                              ...prev,
                              [metric.metric_key]: {
                                ...(prev[metric.metric_key] || { display_value: metric.display_value, label: metric.label }),
                                label: e.target.value
                              }
                            }))}
                            className="flex-1"
                            placeholder="Rótulo"
                          />
                          <Button size="sm" onClick={() => handleSaveMetric(metric.metric_key)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingMetric(null)}>
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => {
                          setEditingMetric(metric.metric_key);
                          setMetricEdits(prev => ({
                            ...prev,
                            [metric.metric_key]: { display_value: metric.display_value, label: metric.label }
                          }));
                        }}>
                          <span className="text-2xl font-bold text-gray-900">{metric.display_value}</span>
                          <span className="text-gray-600">{metric.label}</span>
                          {metric.is_projected && (
                            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                              <AlertTriangle className="h-3 w-3" />
                              Projeção
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
