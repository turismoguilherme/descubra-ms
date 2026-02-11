// @ts-nocheck
/**
 * Diagnostic Reports Tab Component
 * Aba de relatórios dentro do diagnóstico (Opção B)
 * Permite gerar e baixar relatórios em diferentes formatos
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CardBox from '@/components/ui/CardBox';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  Loader2,
  CheckCircle,
  AlertCircle,
  Brain,
  TrendingUp,
  Target
} from 'lucide-react';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult } from '@/services/diagnostic/analysisService';
import { useBusinessType } from '@/hooks/useBusinessType';
import { useAuth } from '@/hooks/useAuth';
import { privateReportGenerationService } from '@/services/private/reportGenerationService';

interface DiagnosticReportsTabProps {
  answers: QuestionnaireAnswers | null;
  analysisResult: AnalysisResult | null;
  businessType?: string | null;
}

const DiagnosticReportsTab: React.FC<DiagnosticReportsTabProps> = ({
  answers,
  analysisResult,
  businessType
}) => {
  const { user } = useAuth();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerateReport = async (type: 'diagnostic' | 'revenue' | 'market' | 'benchmark' | 'consolidated', format: 'pdf' | 'excel' | 'json') => {
    if (!answers || !analysisResult) {
      alert('Complete o diagnóstico primeiro para gerar relatórios');
      return;
    }

    setGenerating(`${type}-${format}`);

    try {
      // Preparar dados do relatório
      const reportData = {
        type,
        format,
        answers,
        analysisResult,
        businessType,
        user: user?.email || 'Usuário',
        generatedAt: new Date().toISOString(),
        dataSources: getDataSources(businessType),
        metadata: {
          platform: 'ViaJAR',
          version: '1.0',
          reportId: `${type}-${Date.now()}`
        }
      };

      // Gerar relatório baseado no formato
      if (format === 'json') {
        generateJSONReport(reportData, type);
      } else if (format === 'pdf') {
        await generatePDFReport(reportData, type);
      } else if (format === 'excel') {
        await generateExcelReport(reportData, type);
      }
    } catch (error: unknown) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGenerating(null);
    }
  };

  const getDataSources = (businessType: string | null | undefined): string[] => {
    const sources: string[] = [];
    
    // Sempre incluir dados do diagnóstico e upload
    sources.push('Dados do Diagnóstico (Questionário)');
    sources.push('Dados Anexados (Upload de Documentos)');
    
    // Adicionar fonte regional baseada no estado
    // TODO: Detectar estado do usuário
    const userState = 'MS'; // Por enquanto, assumir MS (deve vir do perfil)
    
    if (userState === 'MS') {
      sources.push('ALUMIA - Plataforma do Governo de Mato Grosso do Sul');
    } else {
      sources.push('Google Scholar - Pesquisa Acadêmica');
      sources.push('IBGE - Instituto Brasileiro de Geografia e Estatística');
    }
    
    return sources;
  };

  const generateJSONReport = (data: unknown, type: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePDFReport = async (data: unknown, type: string) => {
    try {
      const blob = await privateReportGenerationService.generatePDF(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const generateExcelReport = async (data: unknown, type: string) => {
    try {
      const blob = await privateReportGenerationService.generateExcel(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error('Erro ao gerar Excel:', error);
      alert('Erro ao gerar Excel. Tente novamente.');
    }
  };

  const reportTypes = [
    {
      id: 'diagnostic',
      name: 'Relatório de Diagnóstico',
      description: 'Análise completa do diagnóstico com score, recomendações e plano de implementação',
      icon: <Brain className="h-5 w-5" />
    },
    {
      id: 'revenue',
      name: 'Revenue Optimizer',
      description: 'Análise de receita, precificação e otimização de preços',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'market',
      name: 'Market Intelligence',
      description: 'Inteligência de mercado, tendências e análise competitiva',
      icon: <Target className="h-5 w-5" />
    },
    {
      id: 'benchmark',
      name: 'Competitive Benchmark',
      description: 'Comparação com concorrentes e análise de posicionamento',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'consolidated',
      name: 'Relatório Consolidado',
      description: 'Relatório completo com todos os módulos e análises',
      icon: <FileText className="h-5 w-5" />
    }
  ];

  if (!answers || !analysisResult) {
    return (
      <CardBox>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <p className="text-slate-600 mb-2 font-medium">
            Complete o diagnóstico primeiro
          </p>
          <p className="text-sm text-slate-500">
            Você precisa completar o questionário e a análise para gerar relatórios.
          </p>
        </div>
      </CardBox>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informações sobre fontes de dados */}
      <CardBox className="border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900 mb-2">Fontes de Dados dos Relatórios</p>
            <ul className="text-sm text-blue-700 space-y-1">
              {getDataSources(businessType).map((source, index) => (
                <li key={index}>• {source}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardBox>

      {/* Lista de tipos de relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((reportType) => (
          <CardBox key={reportType.id}>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                {reportType.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">{reportType.name}</h3>
                <p className="text-sm text-slate-600">{reportType.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateReport(reportType.id as any, 'pdf')}
                disabled={!!generating}
                className="flex-1 rounded-full text-xs"
              >
                {generating === `${reportType.id}-pdf` ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-1" />
                )}
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateReport(reportType.id as any, 'excel')}
                disabled={!!generating}
                className="flex-1 rounded-full text-xs"
              >
                {generating === `${reportType.id}-excel` ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                )}
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateReport(reportType.id as any, 'json')}
                disabled={!!generating}
                className="flex-1 rounded-full text-xs"
              >
                {generating === `${reportType.id}-json` ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <FileJson className="h-4 w-4 mr-1" />
                )}
                JSON
              </Button>
            </div>
          </CardBox>
        ))}
      </div>

      {/* Histórico de relatórios gerados (futuro) */}
      <CardBox>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">Relatórios Gerados</h3>
        </div>
        <div className="text-center py-8 text-slate-500 text-sm">
          <p>Seus relatórios gerados aparecerão aqui em breve.</p>
          <p className="text-xs mt-2">Funcionalidade em desenvolvimento.</p>
        </div>
      </CardBox>
    </div>
  );
};

export default DiagnosticReportsTab;

