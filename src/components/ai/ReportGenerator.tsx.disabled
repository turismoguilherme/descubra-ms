import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
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
import { reportGeneratorService, ReportConfig, GeneratedReport, ReportSection } from '@/services/ai/ReportGenerator';

interface ReportGeneratorProps {
  className?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const { cityId, regionId } = useRoleBasedAccess();
  
  const [config, setConfig] = useState<ReportConfig>({
    type: 'monthly',
    format: 'pdf',
    sections: [
      { id: 'summary', name: 'Resumo Executivo', title: 'Resumo Executivo', type: 'metrics', enabled: true },
      { id: 'metrics', name: 'Métricas Principais', title: 'Métricas Principais', type: 'metrics', enabled: true },
      { id: 'insights', name: 'Insights Estratégicos', title: 'Insights Estratégicos', type: 'insights', enabled: true },
      { id: 'forecast', name: 'Previsões de Demanda', title: 'Previsões de Demanda', type: 'forecast', enabled: true },
      { id: 'recommendations', name: 'Recomendações', title: 'Recomendações', type: 'recommendations', enabled: true }
    ],
    customRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    period: `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')} - ${new Date().toLocaleDateString('pt-BR')}`,
    recipient: `gestor-${cityId}`
  });

  const [generating, setGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);

  useEffect(() => {
    loadRecentReports();
  }, []);

  const loadRecentReports = async () => {
    // Simular carregamento de relatórios recentes
    const mockReports: GeneratedReport[] = [
      {
        id: 'report_1',
        title: 'Relatório Mensal - Janeiro 2024',
        type: 'monthly',
        period: '01/01/2024 - 31/01/2024',
        metadata: {
          generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          period: '01/01/2024 - 31/01/2024',
          type: 'monthly',
          filters_applied: []
        },
        summary: {
          total_tourists: 1250,
          totalVisitors: 1250,
          total_revenue: 185000,
          satisfaction_rate: 4.2,
          growth_rate: 12.5,
          growthRate: 12.5
        },
        charts: [],
        tables: [],
        insights: [],
        recommendations: []
      },
      {
        id: 'report_2',
        title: 'Relatório Trimestral - Q4 2023',
        type: 'quarterly',
        period: '01/10/2023 - 31/12/2023',
        metadata: {
          generated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          period: '01/10/2023 - 31/12/2023',
          type: 'quarterly',
          filters_applied: []
        },
        charts: [],
        tables: [],
        insights: [],
        recommendations: [],
        summary: {
          total_tourists: 3840,
          totalVisitors: 3840,
          total_revenue: 576000,
          satisfaction_rate: 4.5,
          growth_rate: 18.2,
          growthRate: 18.2
        }
      }
    ];
    
    setRecentReports(mockReports);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    
    try {
      const report = await (reportGeneratorService as any).generateReport(config);
      
      toast({
        title: "✅ Relatório Gerado!",
        description: `${report.title} foi criado com sucesso.`,
      });

      // Atualizar lista de relatórios
      setRecentReports(prev => [report, ...prev]);
      
      // Download automático
      if (report.downloadUrl) {
        const link = document.createElement('a');
        link.href = report.downloadUrl;
        link.download = `${report.title}.${config.format}`;
        link.click();
      }
      
    } catch (error) {
      toast({
        title: "❌ Erro ao Gerar Relatório",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickGenerate = async (type: 'monthly' | 'quarterly' | 'annual') => {
    setGenerating(true);
    
    try {
      const report = await (reportGeneratorService as any).generateAutomaticReport(type, config.recipient);
      
      toast({
        title: "📄 Relatório Automático Gerado!",
        description: `Relatório ${type} criado com sucesso.`,
      });

      setRecentReports(prev => [report, ...prev]);
      
      if (report.downloadUrl) {
        const link = document.createElement('a');
        link.href = report.downloadUrl;
        link.download = `${report.title}.pdf`;
        link.click();
      }
      
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível gerar o relatório automático.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const updateConfig = (updates: Partial<ReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateSection = (sectionId: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, enabled } : section
      )
    }));
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4" />;
      case 'json': return <FileCode className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            Gerador de Relatórios
          </h2>
          <p className="text-gray-600 mt-1">
            Crie relatórios personalizados com insights de turismo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração do Relatório */}
        <div className="lg:col-span-2 space-y-6">
          {/* Geração Rápida */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Geração Rápida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  onClick={() => handleQuickGenerate('monthly')} 
                  disabled={generating}
                  className="h-16 flex flex-col gap-1"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Relatório Mensal</span>
                  <span className="text-xs opacity-80">Último mês</span>
                </Button>
                <Button 
                  onClick={() => handleQuickGenerate('quarterly')} 
                  disabled={generating}
                  variant="outline"
                  className="h-16 flex flex-col gap-1"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Relatório Trimestral</span>
                  <span className="text-xs opacity-80">Último trimestre</span>
                </Button>
                <Button 
                  onClick={() => handleQuickGenerate('annual')} 
                  disabled={generating}
                  variant="outline"
                  className="h-16 flex flex-col gap-1"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Relatório Anual</span>
                  <span className="text-xs opacity-80">Último ano</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuração Personalizada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                Configuração Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo e Formato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Relatório</Label>
                  <Select value={config.type} onValueChange={(value: any) => updateConfig({ type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="format">Formato</Label>
                  <Select value={config.format} onValueChange={(value: any) => updateConfig({ format: value })}>
                    <SelectTrigger>
                      <SelectValue />
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
                          Excel (CSV)
                        </div>
                      </SelectItem>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4" />
                          JSON
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Período */}
              {config.type === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start">Data Início</Label>
                    <Input
                      type="date"
                      value={config.customRange?.start || ''}
                      onChange={(e) => updateConfig({
                        customRange: { ...config.customRange!, start: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end">Data Fim</Label>
                    <Input
                      type="date"
                      value={config.customRange?.end || ''}
                      onChange={(e) => updateConfig({
                        customRange: { ...config.customRange!, end: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  type="email"
                  placeholder="Para envio automático do relatório"
                  value=""
                  onChange={(e) => updateConfig({
                    recipient: e.target.value
                  })}
                />
              </div>

              {/* Seções */}
              <div>
                <Label>Seções do Relatório</Label>
                <div className="space-y-3 mt-2">
                  {config.sections.map((section) => (
                    <div key={section.id} className="flex items-center justify-between">
                      <Label htmlFor={section.id} className="text-sm font-normal">
                        {section.title || section.name}
                      </Label>
                      <Switch
                        id={section.id}
                        checked={section.enabled}
                        onCheckedChange={(checked) => updateSection(section.id, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão Gerar */}
              <Button 
                onClick={handleGenerate} 
                disabled={generating}
                className="w-full h-12"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando Relatório...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Relatório Personalizado
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Relatórios Recentes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                Relatórios Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentReports.length > 0 ? (
                <div className="space-y-3">
                  {recentReports.slice(0, 5).map((report) => (
                    <div key={report.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{report.title}</h4>
                          <p className="text-xs text-gray-500">{report.period}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {report.type}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-2">
                        <p>📊 {report.summary.totalVisitors.toLocaleString()} visitantes</p>
                        <p>📈 {report.summary.growthRate}% crescimento</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {report.downloadUrl && (
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-xs h-7">
                          <Mail className="h-3 w-3 mr-1" />
                          Reenviar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum relatório gerado ainda.</p>
                  <p className="text-sm">Gere seu primeiro relatório!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💡 Dicas</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-gray-600">
              <p>• Relatórios PDF são ideais para apresentações</p>
              <p>• Use CSV para análises em planilhas</p>
              <p>• JSON é perfeito para integrações</p>
              <p>• Configure email para recebimento automático</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator; 