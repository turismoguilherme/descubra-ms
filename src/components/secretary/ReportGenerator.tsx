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

const ReportGenerator: React.FC = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      title="Gerador de Relatórios"
      subtitle="Gere relatórios completos em PDF com dados do município"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 mb-1">Erro ao gerar relatório</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Informativo */}
        <CardBox>
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-1">Relatórios Municipais</h3>
              <p className="text-sm text-gray-600">
                Gere relatórios completos em PDF com dados do município, incluindo métricas, 
                performance dos CATs, atrações, eventos e análises de turistas.
              </p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Dados atualizados do Supabase</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Formato PDF profissional</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Personalização de seções</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Download automático</span>
            </div>
          </div>
        </CardBox>

        {/* Card de Configuração */}
        <CardBox>
          <h3 className="font-semibold text-slate-800 mb-4">Configuração do Relatório</h3>
          
          <div className="space-y-4">
            {/* Título */}
            <div>
              <Label htmlFor="title">Título do Relatório</Label>
              <Input
                id="title"
                value={reportConfig.title}
                onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
                placeholder="Ex: Relatório Municipal de Turismo - Janeiro 2024"
                className="mt-1"
              />
            </div>

            {/* Período - Presets */}
            <div>
              <Label>Período - Seleção Rápida</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {periodPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelect(preset)}
                    className="text-xs"
                  >
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Período - Datas Customizadas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={format(reportConfig.period.start, 'yyyy-MM-dd')}
                  onChange={(e) => setReportConfig({
                    ...reportConfig,
                    period: {
                      ...reportConfig.period,
                      start: new Date(e.target.value)
                    }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={format(reportConfig.period.end, 'yyyy-MM-dd')}
                  onChange={(e) => setReportConfig({
                    ...reportConfig,
                    period: {
                      ...reportConfig.period,
                      end: new Date(e.target.value)
                    }
                  })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Preview do Período */}
            <CardBox className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-800">Período Selecionado:</p>
              </div>
              <p className="text-sm text-blue-800">
                {format(reportConfig.period.start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} a{' '}
                {format(reportConfig.period.end, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </CardBox>
          </div>
        </CardBox>

        {/* Card de Seções */}
        <CardBox className="md:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Seções a Incluir</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeMetrics"
                checked={reportConfig.includeMetrics}
                onCheckedChange={(checked) => 
                  setReportConfig({ ...reportConfig, includeMetrics: checked as boolean })
                }
              />
              <Label htmlFor="includeMetrics" className="flex items-center gap-2 cursor-pointer">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Métricas Principais
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCATs"
                checked={reportConfig.includeCATs}
                onCheckedChange={(checked) => 
                  setReportConfig({ ...reportConfig, includeCATs: checked as boolean })
                }
              />
              <Label htmlFor="includeCATs" className="flex items-center gap-2 cursor-pointer">
                <Building2 className="h-4 w-4 text-green-600" />
                Performance dos CATs
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeAttractions"
                checked={reportConfig.includeAttractions}
                onCheckedChange={(checked) => 
                  setReportConfig({ ...reportConfig, includeAttractions: checked as boolean })
                }
              />
              <Label htmlFor="includeAttractions" className="flex items-center gap-2 cursor-pointer">
                <MapPin className="h-4 w-4 text-purple-600" />
                Atrações Turísticas
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeEvents"
                checked={reportConfig.includeEvents}
                onCheckedChange={(checked) => 
                  setReportConfig({ ...reportConfig, includeEvents: checked as boolean })
                }
              />
              <Label htmlFor="includeEvents" className="flex items-center gap-2 cursor-pointer">
                <Calendar className="h-4 w-4 text-orange-600" />
                Eventos Programados
              </Label>
            </div>
          </div>
        </CardBox>

        {/* Botão de Gerar */}
        <CardBox className="md:col-span-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Gerar e Baixar Relatório PDF
              </>
            )}
          </Button>
        </CardBox>
      </div>
    </SectionWrapper>
  );
};

export default ReportGenerator;
