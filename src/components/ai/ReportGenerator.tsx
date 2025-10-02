import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Calendar,
  Settings,
  Mail,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  FileCode,
  Loader2
} from 'lucide-react';

interface ReportGeneratorProps {
  className?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ className = '' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('monthly');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGenerating(false);
    
    // Simular download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `relatorio-turismo-${reportType}.${reportFormat}`;
    link.click();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerador de Relatórios</h2>
          <p className="text-gray-600 mt-1">
            Gere relatórios personalizados sobre o turismo da sua região
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Relatórios Inteligentes
        </Badge>
      </div>

      {/* Configurações do Relatório */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="report-type">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Relatório Diário</SelectItem>
                  <SelectItem value="weekly">Relatório Semanal</SelectItem>
                  <SelectItem value="monthly">Relatório Mensal</SelectItem>
                  <SelectItem value="quarterly">Relatório Trimestral</SelectItem>
                  <SelectItem value="yearly">Relatório Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="report-format">Formato</Label>
              <Select value={reportFormat} onValueChange={setReportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      CSV
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-report">Enviar por Email</Label>
                <p className="text-sm text-gray-500">
                  Receba o relatório automaticamente por email
                </p>
              </div>
              <Switch
                id="email-report"
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>

            {emailEnabled && (
              <div>
                <Label htmlFor="email-address">Endereço de Email</Label>
                <Input
                  id="email-address"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seções do Relatório */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Seções do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 'summary', name: 'Resumo Executivo', enabled: true },
                { id: 'metrics', name: 'Métricas Principais', enabled: true },
                { id: 'insights', name: 'Insights Estratégicos', enabled: true },
                { id: 'forecast', name: 'Previsões de Demanda', enabled: false },
                { id: 'recommendations', name: 'Recomendações', enabled: true }
              ].map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`h-4 w-4 ${section.enabled ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm font-medium">{section.name}</span>
                  </div>
                  <Badge variant={section.enabled ? 'default' : 'secondary'}>
                    {section.enabled ? 'Incluído' : 'Opcional'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Gerar Relatório</h3>
              <p className="text-sm text-gray-600 mt-1">
                Clique no botão abaixo para gerar o relatório com as configurações selecionadas
              </p>
            </div>
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Relatórios Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Relatório Mensal - Setembro 2024', date: '2024-09-30', format: 'PDF', size: '2.4 MB' },
              { name: 'Relatório Semanal - Semana 39', date: '2024-09-23', format: 'Excel', size: '1.8 MB' },
              { name: 'Relatório Trimestral - Q3 2024', date: '2024-09-15', format: 'PDF', size: '5.2 MB' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-gray-500">{report.date} • {report.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{report.format}</Badge>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;




