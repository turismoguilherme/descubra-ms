// @ts-nocheck
/**
 * CAT Reports Section
 * Seção de relatórios avançados para atendentes dos CATs
 * Com análises explicativas baseadas em dados reais
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  FileText,
  Calendar,
  TrendingDown,
  Minus
} from 'lucide-react';
import { attendanceService, AttendanceRecord } from '@/services/cat/attendanceService';
import { touristService } from '@/services/cat/touristService';
import PDFReportButton from '@/components/exports/PDFReportButton';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { 
  analyzeCATReport, 
  CATReportData,
  AnalysisContext 
} from '@/services/reports/reportAnalysisService';

interface CATReportsSectionProps {
  catId?: string;
}

const CATReportsSection: React.FC<CATReportsSectionProps> = ({ catId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [previousPeriodRecords, setPreviousPeriodRecords] = useState<AttendanceRecord[]>([]);
  const [touristStats, setTouristStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user, catId]);

  const loadData = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      // Carregar dados dos últimos 60 dias (30 atual + 30 anterior para comparação)
      const currentStart = new Date();
      currentStart.setDate(currentStart.getDate() - 30);
      
      const previousStart = new Date();
      previousStart.setDate(previousStart.getDate() - 60);
      
      const [records, previousRecords, stats] = await Promise.all([
        attendanceService.getAttendanceRecords({
          attendant_id: user.id,
          cat_id: catId,
          startDate: currentStart.toISOString().split('T')[0]
        }),
        attendanceService.getAttendanceRecords({
          attendant_id: user.id,
          cat_id: catId,
          startDate: previousStart.toISOString().split('T')[0],
          endDate: currentStart.toISOString().split('T')[0]
        }),
        touristService.getTouristStats({
          attendant_id: user.id
        })
      ]);

      setAttendanceRecords(records);
      setPreviousPeriodRecords(previousRecords);
      setTouristStats(stats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular métricas
  const todayAttendances = useMemo(() => {
    return attendanceRecords.filter(r => {
      const recordDate = new Date(r.attendance_time);
      const today = new Date();
      return recordDate.toDateString() === today.toDateString();
    }).length;
  }, [attendanceRecords]);

  const weekAttendances = useMemo(() => {
    return attendanceRecords.filter(r => {
      const recordDate = new Date(r.attendance_time);
      const weekAgo = subDays(new Date(), 7);
      return recordDate >= weekAgo;
    }).length;
  }, [attendanceRecords]);

  const monthAttendances = attendanceRecords.length;
  const previousMonthAttendances = previousPeriodRecords.length;

  const averageRating = touristStats?.averageRating || 0;
  const previousAverageRating = touristStats?.previousAverageRating;

  // Calcular origens dos turistas
  const topOrigins = useMemo(() => {
    const originsMap = new Map<string, number>();
    attendanceRecords.forEach(r => {
      if (r.origin) {
        originsMap.set(r.origin, (originsMap.get(r.origin) || 0) + 1);
      }
    });
    return Array.from(originsMap.entries())
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [attendanceRecords]);

  // Calcular duração média
  const averageDuration = useMemo(() => {
    const durations = attendanceRecords
      .filter(r => r.duration_minutes && r.duration_minutes > 0)
      .map(r => r.duration_minutes!);
    return durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;
  }, [attendanceRecords]);

  // Calcular variação mensal
  const monthVariation = useMemo(() => {
    if (previousMonthAttendances === 0) return null;
    return ((monthAttendances - previousMonthAttendances) / previousMonthAttendances) * 100;
  }, [monthAttendances, previousMonthAttendances]);

  // Preparar dados para relatórios PDF com análises
  const getPDFReportConfig = (reportType: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    let startDate: Date;
    let title: string;
    let filteredRecords: AttendanceRecord[];
    let previousPeriodCount: number | undefined;

    switch (reportType) {
      case 'daily':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        title = 'Relatório Diário de Atendimentos';
        filteredRecords = attendanceRecords.filter(r => {
          const recordDate = new Date(r.attendance_time);
          return recordDate.toDateString() === new Date().toDateString();
        });
        // Comparar com ontem
        const yesterday = subDays(new Date(), 1);
        previousPeriodCount = attendanceRecords.filter(r => {
          const recordDate = new Date(r.attendance_time);
          return recordDate.toDateString() === yesterday.toDateString();
        }).length;
        break;
      case 'weekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        title = 'Relatório Semanal de Atendimentos';
        const weekAgo = subDays(new Date(), 7);
        filteredRecords = attendanceRecords.filter(r => {
          const recordDate = new Date(r.attendance_time);
          return recordDate >= weekAgo;
        });
        // Comparar com semana anterior
        const twoWeeksAgo = subDays(new Date(), 14);
        previousPeriodCount = attendanceRecords.filter(r => {
          const recordDate = new Date(r.attendance_time);
          return recordDate >= twoWeeksAgo && recordDate < weekAgo;
        }).length;
        break;
      case 'monthly':
      default:
        startDate = startOfMonth(now);
        title = 'Relatório Mensal de Atendimentos';
        filteredRecords = attendanceRecords;
        previousPeriodCount = previousMonthAttendances;
        break;
    }

    // Preparar dados para análise
    const reportData: CATReportData = {
      attendances: {
        total: filteredRecords.length,
        today: todayAttendances,
        previousPeriod: previousPeriodCount
      },
      averageRating: averageRating > 0 ? averageRating : undefined,
      previousAverageRating: previousAverageRating,
      topOrigins: topOrigins,
      averageDuration: averageDuration > 0 ? averageDuration : undefined
    };

    const analysisContext: AnalysisContext = {
      reportType: `cat_${reportType}`,
      period: { start: startDate, end: new Date() },
      generatedBy: user?.name || 'Atendente',
      userRole: 'cat_attendant'
    };

    // Gerar análise
    const analysis = analyzeCATReport(reportData, analysisContext);

    // Preparar linhas da tabela
    const tableRows = filteredRecords.map(record => [
      format(new Date(record.attendance_time), 'dd/MM/yyyy HH:mm'),
      record.tourist_name || 'N/A',
      record.origin || 'N/A',
      record.attendance_type || 'Presencial',
      record.duration_minutes ? `${record.duration_minutes} min` : 'N/A'
    ]);

    return {
      title,
      period: { start: startDate, end: new Date() },
      customFields: [
        { label: 'Atendente', value: user?.name || 'Atendente' },
        { label: 'CAT', value: catId || 'Não especificado' },
        { label: 'Total de Atendimentos', value: filteredRecords.length },
        { label: 'Avaliação Média', value: averageRating > 0 ? averageRating.toFixed(1) : 'N/A' }
      ],
      tableData: {
        headers: ['Data/Hora', 'Turista', 'Origem', 'Tipo', 'Duração'],
        rows: tableRows
      },
      analysis // Análise gerada automaticamente
    };
  };

  // Renderizar ícone de tendência
  const renderTrendIcon = (variation: number | null) => {
    if (variation === null) return <Minus className="h-4 w-4 text-gray-400" />;
    if (variation > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (variation < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const renderTrendText = (variation: number | null) => {
    if (variation === null) return 'Sem dados anteriores';
    const prefix = variation >= 0 ? '+' : '';
    const colorClass = variation > 0 ? 'text-green-600' : variation < 0 ? 'text-red-600' : 'text-gray-500';
    return <span className={colorClass}>{prefix}{variation.toFixed(1)}% vs mês anterior</span>;
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <Card className="border border-slate-200 bg-white shadow-sm rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <BarChart3 className="h-5 w-5" />
            Métricas de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {todayAttendances}
              </div>
              <div className="text-sm text-slate-600">Atendimentos Hoje</div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {weekAttendances}
              </div>
              <div className="text-sm text-slate-600">Esta Semana</div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {monthAttendances}
              </div>
              <div className="text-sm text-slate-600 mb-1">Este Mês</div>
              <div className="flex items-center justify-center gap-1 text-xs">
                {renderTrendIcon(monthVariation)}
                {renderTrendText(monthVariation)}
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-slate-600">Avaliação Média</div>
            </div>
          </div>

          {/* Estatísticas adicionais */}
          {(topOrigins.length > 0 || averageDuration > 0) && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topOrigins.length > 0 && (
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700">Principais origens: </span>
                    <span className="text-slate-600">
                      {topOrigins.slice(0, 3).map(o => `${o.origin} (${o.count})`).join(', ')}
                    </span>
                  </div>
                )}
                {averageDuration > 0 && (
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700">Duração média: </span>
                    <span className="text-slate-600">{averageDuration.toFixed(0)} minutos</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relatórios Disponíveis */}
      <Card className="border border-slate-200 bg-white shadow-sm rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="h-5 w-5" />
            Relatórios Disponíveis
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Relatórios com análises explicativas baseadas em dados reais
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Relatório Diário */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Relatório Diário</h3>
                  <p className="text-sm text-slate-600">Atividades do dia</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-1">Atendimentos hoje:</div>
                <div className="text-2xl font-bold text-blue-600">{todayAttendances}</div>
              </div>
              <div className="text-xs text-slate-500 mb-3">
                Inclui resumo executivo, insights e recomendações
              </div>
              <PDFReportButton
                reportType="cat_daily"
                config={getPDFReportConfig('daily')}
                label="Gerar Relatório PDF"
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              />
            </div>

            {/* Relatório Semanal */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Relatório Semanal</h3>
                  <p className="text-sm text-slate-600">Performance da semana</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-1">Atendimentos esta semana:</div>
                <div className="text-2xl font-bold text-green-600">{weekAttendances}</div>
              </div>
              <div className="text-xs text-slate-500 mb-3">
                Comparativo com semana anterior
              </div>
              <PDFReportButton
                reportType="cat_weekly"
                config={getPDFReportConfig('weekly')}
                label="Gerar Relatório PDF"
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              />
            </div>

            {/* Relatório Mensal */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Relatório Mensal</h3>
                  <p className="text-sm text-slate-600">Resumo completo do mês</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-1">Atendimentos este mês:</div>
                <div className="text-2xl font-bold text-purple-600">{monthAttendances}</div>
              </div>
              <div className="text-xs text-slate-500 mb-3">
                Análise completa com tendências e origens
              </div>
              <PDFReportButton
                reportType="cat_monthly"
                config={getPDFReportConfig('monthly')}
                label="Gerar Relatório PDF"
                variant="default"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CATReportsSection;
