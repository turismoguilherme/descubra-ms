// @ts-nocheck
/**
 * Reports Section Component
 * Seção para gerar e baixar relatório completo do negócio
 */

import React, { useState } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  FileJson,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CompleteBusinessReportService } from '@/services/private/completeBusinessReportService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { QuestionnaireAnswers } from '@/types/diagnostic';
import type { AnalysisResult } from '@/services/diagnostic/analysisService';

interface ReportsSectionProps {
  diagnosticAnswers?: QuestionnaireAnswers;
  analysisResult?: AnalysisResult;
  businessType?: string | null;
}

const ReportsSection: React.FC<ReportsSectionProps> = ({
  diagnosticAnswers,
  analysisResult,
  businessType
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);
  const completeReportService = new CompleteBusinessReportService();

  const handleGenerateReport = async (format: 'pdf' | 'excel' | 'json') => {
    if (!user?.id || !user?.email) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(format);

    try {
      // Gerar relatório consolidado - busca todos os dados
      const blob = await completeReportService.generateCompleteReport(
        user.id,
        user.email,
        format
      );

      // Verificar se o blob foi gerado corretamente
      if (!blob || blob.size === 0) {
        throw new Error('Relatório gerado está vazio. Verifique se há dados disponíveis.');
      }

      // Download do arquivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.style.display = 'none';
      
      const extension = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'json';
      const dateStr = format(new Date(), 'yyyy-MM-dd', { locale: ptBR });
      link.download = `Relatorio_Completo_${dateStr}.${extension}`;
      
      document.body.appendChild(link);
      
      // Forçar download
      link.click();
      
      // Limpar após um pequeno delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: 'Sucesso',
        description: `Relatório ${format.toUpperCase()} gerado e baixado com sucesso!`,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao gerar relatório:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao gerar relatório. Verifique se há dados disponíveis e tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <SectionWrapper
      variant="default"
      title="Relatório Completo do Negócio"
      subtitle="Gere um relatório completo com todos os dados da plataforma"
    >
      <CardBox className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2 text-lg">
              Relatório Completo do Negócio
            </h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              Este relatório inclui: Diagnóstico completo, Revenue Optimizer, Market Intelligence, 
              Competitive Benchmark, Histórico de Evolução, Metas, Documentos anexados e Dados Regionais.
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
              handleGenerateReport('pdf');
            }}
            disabled={!!generating}
            className="flex-1 bg-white hover:bg-gray-50 border-blue-300 text-blue-700 border-2"
          >
            {generating === 'pdf' ? (
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
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Botão Baixar Excel clicado');
              handleGenerateReport('excel');
            }}
            disabled={!!generating}
            className="flex-1 bg-white hover:bg-gray-50 border-green-300 text-green-700 border-2"
          >
            {generating === 'excel' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Baixar Excel
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Botão Baixar JSON clicado');
              handleGenerateReport('json');
            }}
            disabled={!!generating}
            className="flex-1 bg-white hover:bg-gray-50 border-yellow-300 text-yellow-700 border-2"
          >
            {generating === 'json' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileJson className="h-4 w-4 mr-2" />
                Baixar JSON
              </>
            )}
          </Button>
        </div>
      </CardBox>
    </SectionWrapper>
  );
};

export default ReportsSection;
