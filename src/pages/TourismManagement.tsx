import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategicAnalysis } from '@/components/management/StrategicAnalysis';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ReportGenerationService } from '@/services/reports/reportGenerationService';

function TourismManagement() {
  const [analysis, setAnalysis] = useState<any>(null);
  const reportService = new ReportGenerationService();

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!analysis) return;

    const blob = await reportService.generateReport(analysis, {
      title: 'Análise Estratégica do Turismo - Campo Grande',
      format
    });

    // Criar link para download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-turismo-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestão do Turismo</h1>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analysis">
        <TabsList>
          <TabsTrigger value="analysis">Análise Estratégica</TabsTrigger>
          <TabsTrigger value="data">Dados Turísticos</TabsTrigger>
          <TabsTrigger value="community">Comunidade</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <StrategicAnalysis onAnalysisUpdate={setAnalysis} />
        </TabsContent>

        <TabsContent value="data">
          {/* Componente existente de dados turísticos */}
        </TabsContent>

        <TabsContent value="community">
          {/* Futura implementação do engajamento comunitário */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TourismManagement;