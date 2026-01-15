// @ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pdfTemplateService, ReportConfig } from '@/services/reports/pdfTemplateService';
import { ReportAnalysis } from '@/services/reports/reportAnalysisService';
import { useAuth } from '@/hooks/useAuth';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface PDFReportButtonProps {
  reportType: string;
  config: {
    title: string;
    period: { start: Date; end: Date };
    generatedBy?: string;
    customFields?: Array<{ label: string; value: string | number }>;
    tableData?: {
      headers: string[];
      rows: (string | number)[][];
    };
    sections?: Array<{ 
      title: string; 
      content: string | string[] | (string | number)[][] 
    }>;
    // Nova propriedade para análises automáticas
    analysis?: ReportAnalysis;
  };
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "link" | "destructive" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  className?: string;
}

const PDFReportButton: React.FC<PDFReportButtonProps> = ({
  reportType,
  config,
  label = 'Baixar Relatório PDF',
  variant = 'outline',
  size = 'sm',
  className,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const finalConfig: ReportConfig = {
        ...config,
        reportType,
        generatedBy: config.generatedBy || user?.name || 'Usuário Desconhecido',
      };

      const pdfBlob = await pdfTemplateService.generateReport(finalConfig);

      const fileName = `${finalConfig.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
      saveAs(pdfBlob, fileName);

      toast({
        title: 'Sucesso',
        description: 'Relatório PDF gerado e baixado com sucesso!',
      });
    } catch (error: any) {
      console.error('Error generating PDF report:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível gerar o relatório PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      variant={variant}
      size={size}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
};

export default PDFReportButton;
