import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Mail, Play, Pause, Edit, Trash2, Plus } from 'lucide-react';
import { reportService } from '@/services/reports/reportService';
import { ReportSchedule } from '@/types/reports';
import { useOverflowOneAuth } from '@/hooks/useOverflowOneAuth';
import { useToast } from '@/hooks/use-toast';

const ReportSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useOverflowOneAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSchedules();
    }
  }, [user]);

  const loadSchedules = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await reportService.getSchedules(user.id);
      setSchedules(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      await reportService.updateSchedule(scheduleId, { is_active: !isActive });
      setSchedules(schedules.map(s => 
        s.id === scheduleId ? { ...s, is_active: !isActive } : s
      ));
      toast({
        title: "Sucesso",
        description: `Agendamento ${!isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await reportService.deleteSchedule(scheduleId);
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive",
      });
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Diário';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensal';
      case 'quarterly':
        return 'Trimestral';
      default:
        return frequency;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getNextRunLabel = (schedule: ReportSchedule) => {
    const nextRun = new Date(schedule.next_run);
    const now = new Date();
    const diffMs = nextRun.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Atrasado';
    } else if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Amanhã';
    } else {
      return `Em ${diffDays} dias`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Relatórios Agendados</h2>
          <p className="text-gray-600 text-sm">
            Gerencie relatórios que são executados automaticamente
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold">{schedule.name}</h3>
                    <Badge variant={schedule.is_active ? "default" : "secondary"}>
                      {schedule.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{getFrequencyLabel(schedule.frequency)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{schedule.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Próxima execução: {getNextRunLabel(schedule)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{schedule.recipients.length} destinatários</span>
                    </div>
                  </div>

                  {schedule.last_run && (
                    <div className="mt-2 text-xs text-gray-500">
                      Última execução: {formatDate(schedule.last_run)}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Switch
                    checked={schedule.is_active}
                    onCheckedChange={() => handleToggleSchedule(schedule.id, schedule.is_active)}
                  />
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum agendamento encontrado.</p>
          <p className="text-sm">Crie seu primeiro agendamento para relatórios automáticos.</p>
        </div>
      )}
    </div>
  );
};

export default ReportSchedules;
