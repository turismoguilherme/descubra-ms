/**
 * Report Generator Component for Public Sector
 * Componente para geração de relatórios municipais
 * Layout padronizado conforme regras definitivas ViaJAR
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { publicReportService, ReportOptions } from '@/services/public/reportService';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Loader2,
  Calendar,
  BarChart3,
  Building2,
  MapPin,
  Calendar as CalendarIcon,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ReportType = 'all' | 'cats' | 'events' | 'inventory' | 'metrics';

const ReportGenerator: React.FC = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<ReportType>('all');
  const [reportConfig, setReportConfig] = useState<ReportOptions>({
    title: 'Relatório Municipal de Turismo',
    period: {
      start: subMonths(new Date(), 1),
      end: new Date()
    },
    includeMetrics: true,
    includeCATs: true,
    includeAttractions: true,
    includeEvents: true,
    includeCharts: true
  });

  const periodPresets = [
    {
      label: 'Última Semana',
      value: 'week',
      getPeriod: () => ({
        start: subDays(new Date(), 7),
        end: new Date()
      })
    },
    {
      label: 'Último Mês',
      value: 'month',
      getPeriod: () => ({
        start: subMonths(new Date(), 1),
        end: new Date()
      })
    },
    {
      label: 'Último Trimestre',
      value: 'quarter',
      getPeriod: () => ({
        start: subMonths(new Date(), 3),
        end: new Date()
      })
    },
    {
      label: 'Último Ano',
      value: 'year',
      getPeriod: () => ({
        start: subYears(new Date(), 1),
        end: new Date()
      })
    }
  ];

  const handlePresetSelect = (preset: typeof periodPresets[0]) => {
    setReportConfig({
      ...reportConfig,
      period: preset.getPeriod()
    });
  };

  const handleReportTypeChange = (type: ReportType) => {
    setReportType(type);
    // Atualizar configuração baseado no tipo
    const config: ReportOptions = {
      ...reportConfig,
      includeMetrics: type === 'all' || type === 'metrics',
      includeCATs: type === 'all' || type === 'cats',
      includeAttractions: type === 'all' || type === 'inventory',
      includeEvents: type === 'all' || type === 'events',
    };
    
    // Atualizar título
    const titles: Record<ReportType, string> = {
      all: 'Relatório Completo Municipal',
      cats: 'Relatório de CATs',
      events: 'Relatório de Eventos',
      inventory: 'Relatório de Inventário Turístico',
      metrics: 'Relatório de Métricas'
    };
    config.title = titles[type];
    
    setReportConfig(config);
  };

  const handleGenerate = async () => {
    if (!user?.id) {
      setError('Você precisa estar logado para gerar relatórios');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      await publicReportService.downloadReport(reportConfig);
      // Sucesso - não precisa mostrar alerta, o download já foi iniciado
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      const errorMessage = error?.message || error?.toString() || 'Erro ao gerar relatório. Verifique sua conexão e tente novamente.';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <SectionWrapper variant="default" title="Gerador de Relatórios" subtitle="Gere relatórios completos em PDF">
        <CardBox>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <p className="text-slate-600 font-medium mb-2">Acesso Restrito</p>
            <p className="text-sm text-slate-500">Você precisa estar logado para gerar relatórios.</p>
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      variant="default"
      title="Relatório Completo Municipal"
      subtitle="Gere um relatório completo com todos os dados da plataforma"
    >
      {error && (
        <CardBox className="border-red-200 bg-red-50 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </CardBox>
      )}

      <div className="space-y-6">
        {/* Seleção de Tipo de Relatório */}
        <CardBox className="bg-gradient-to-br from-white to-blue-50/30 border-blue-200 shadow-md">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Tipo de Relatório
            </h3>
            <p className="text-sm text-slate-600">Selecione o tipo de relatório que deseja gerar</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => handleReportTypeChange('all')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'all'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className={`h-6 w-6 ${reportType === 'all' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${reportType === 'all' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Completo
                </span>
                <span className="text-xs text-gray-500 text-center">Todos os dados</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleReportTypeChange('cats')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'cats'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Building2 className={`h-6 w-6 ${reportType === 'cats' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${reportType === 'cats' ? 'text-blue-700' : 'text-gray-700'}`}>
                  CATs
                </span>
                <span className="text-xs text-gray-500 text-center">Apenas CATs</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleReportTypeChange('events')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'events'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <CalendarIcon className={`h-6 w-6 ${reportType === 'events' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${reportType === 'events' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Eventos
                </span>
                <span className="text-xs text-gray-500 text-center">Apenas eventos</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleReportTypeChange('inventory')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'inventory'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <MapPin className={`h-6 w-6 ${reportType === 'inventory' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${reportType === 'inventory' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Inventário
                </span>
                <span className="text-xs text-gray-500 text-center">Apenas atrações</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleReportTypeChange('metrics')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'metrics'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className={`h-6 w-6 ${reportType === 'metrics' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${reportType === 'metrics' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Métricas
                </span>
                <span className="text-xs text-gray-500 text-center">Apenas métricas</span>
              </div>
            </button>
          </div>
        </CardBox>

        {/* Período e Configurações */}
        <CardBox className="bg-gradient-to-br from-white to-slate-50/30 border-slate-200 shadow-md">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Período do Relatório
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {periodPresets.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant="outline"
                onClick={() => handlePresetSelect(preset)}
                className="h-auto py-3 flex flex-col items-center gap-1"
              >
                <span className="text-sm font-medium">{preset.label}</span>
                <span className="text-xs text-gray-500">
                  {format(preset.getPeriod().start, 'dd/MM')} - {format(preset.getPeriod().end, 'dd/MM')}
                </span>
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Info className="h-4 w-4" />
              <span>Período selecionado:</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              {format(reportConfig.period.start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} até{' '}
              {format(reportConfig.period.end, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </CardBox>

        {/* Botão de Geração */}
        <CardBox className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1 text-lg">
                {reportConfig.title}
              </h3>
              <p className="text-sm text-blue-700">
                {reportType === 'all' && 'Inclui todas as seções: Métricas, CATs, Eventos, Inventário e Análises'}
                {reportType === 'cats' && 'Inclui apenas dados dos Centros de Atendimento ao Turista'}
                {reportType === 'events' && 'Inclui apenas eventos programados e realizados'}
                {reportType === 'inventory' && 'Inclui apenas o inventário turístico (atrações e pontos de interesse)'}
                {reportType === 'metrics' && 'Inclui apenas métricas e indicadores principais'}
              </p>
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGenerate();
              }}
              disabled={isGenerating}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white shadow-md px-6 py-3 h-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Baixar PDF
                </>
              )}
            </Button>
          </div>
        </CardBox>
      </div>
    </SectionWrapper>
  );
};

export default ReportGenerator;
