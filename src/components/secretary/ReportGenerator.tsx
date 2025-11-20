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

      <CardBox className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2 text-lg">
              Relatório Completo Municipal
            </h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              Este relatório inclui: Métricas principais, Performance dos CATs, Atrações turísticas, 
              Eventos programados, Análises de turistas e Dados regionais.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Botão Baixar PDF clicado');
              handleGenerate();
            }}
            disabled={!!isGenerating}
            className="flex-1 bg-white hover:bg-gray-50 border-blue-300 text-blue-700 border-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </>
            )}
          </Button>
        </div>
      </CardBox>
    </SectionWrapper>
  );
};

export default ReportGenerator;
