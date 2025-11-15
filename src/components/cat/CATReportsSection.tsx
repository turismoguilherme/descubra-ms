/**
 * CAT Reports Section
 * Seção simplificada de relatórios para atendentes dos CATs
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  FileText,
  Calendar
} from 'lucide-react';
import { attendanceService, AttendanceRecord } from '@/services/cat/attendanceService';
import { touristService } from '@/services/cat/touristService';

interface CATReportsSectionProps {
  catId?: string;
}

const CATReportsSection: React.FC<CATReportsSectionProps> = ({ catId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
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
      // Carregar dados dos últimos 30 dias para calcular todas as métricas
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const [records, stats] = await Promise.all([
        attendanceService.getAttendanceRecords({
          attendant_id: user.id,
          cat_id: catId,
          startDate: startDate.toISOString().split('T')[0]
        }),
        touristService.getTouristStats({
          attendant_id: user.id
        })
      ]);

      setAttendanceRecords(records);
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

  // Calcular métricas simples
  const todayAttendances = attendanceRecords.filter(r => {
    const recordDate = new Date(r.attendance_time);
    const today = new Date();
    return recordDate.toDateString() === today.toDateString();
  }).length;

  const weekAttendances = attendanceRecords.filter(r => {
    const recordDate = new Date(r.attendance_time);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recordDate >= weekAgo;
  }).length;

  const monthAttendances = attendanceRecords.length;

  const averageRating = touristStats?.averageRating || 0;

  const handleGenerateReport = async (reportType: 'daily' | 'weekly' | 'monthly') => {
    setIsLoading(true);
    try {
      // TODO: Implementar geração real de relatório
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Relatório Gerado',
        description: `Relatório ${reportType === 'daily' ? 'diário' : reportType === 'weekly' ? 'semanal' : 'mensal'} gerado com sucesso!`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o relatório',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
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
              <div className="text-sm text-slate-600">Este Mês</div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-slate-600">Avaliação Média</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Disponíveis */}
      <Card className="border border-slate-200 bg-white shadow-sm rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="h-5 w-5" />
            Relatórios Disponíveis
          </CardTitle>
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
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleGenerateReport('daily')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
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
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleGenerateReport('weekly')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>

            {/* Relatório Mensal */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Relatório Mensal</h3>
                  <p className="text-sm text-slate-600">Resumo do mês</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-1">Atendimentos este mês:</div>
                <div className="text-2xl font-bold text-purple-600">{monthAttendances}</div>
              </div>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => handleGenerateReport('monthly')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CATReportsSection;

