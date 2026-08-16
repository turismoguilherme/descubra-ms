import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Clock, LogIn, LogOut, Timer, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TimesheetEntry {
  id: string;
  cat_location: string;
  clock_in_time: string;
  clock_out_time?: string;
  total_hours?: number;
  notes?: string;
  created_at: string;
}

const AttendantTimesheet: React.FC = () => {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<TimesheetEntry | null>(null);
  const [catLocation, setCatLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTimesheetEntries();
      checkActiveEntry();
    }
  }, [user]);

  const loadTimesheetEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('attendant_timesheet')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const checkActiveEntry = async () => {
    try {
      const { data, error } = await supabase
        .from('attendant_timesheet')
        .select('*')
        .eq('user_id', user?.id)
        .is('clock_out_time', null)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentEntry(data);
    } catch (error) {
      console.error('Erro ao verificar entrada ativa:', error);
    }
  };

  const handleClockIn = async () => {
    if (!catLocation.trim()) {
      toast({
        title: "Local obrigatório",
        description: "Por favor, informe o local do CAT.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendant_timesheet')
        .insert([{
          user_id: user?.id,
          cat_location: catLocation,
          notes: notes || null
        }])
        .select()
        .single();

      if (error) throw error;

      setCurrentEntry(data);
      setCatLocation('');
      setNotes('');
      loadTimesheetEntries();

      toast({
        title: "Entrada registrada",
        description: `Ponto de entrada registrado em ${catLocation}`,
      });
    } catch (error) {
      console.error('Erro ao registrar entrada:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a entrada.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentEntry) return;

    setIsLoading(true);
    try {
      const clockOutTime = new Date().toISOString();
      const clockInTime = new Date(currentEntry.clock_in_time);
      const totalHours = (new Date(clockOutTime).getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('attendant_timesheet')
        .update({
          clock_out_time: clockOutTime,
          total_hours: Math.round(totalHours * 100) / 100,
          notes: notes || currentEntry.notes
        })
        .eq('id', currentEntry.id);

      if (error) throw error;

      setCurrentEntry(null);
      setNotes('');
      loadTimesheetEntries();

      toast({
        title: "Saída registrada",
        description: `Total de horas trabalhadas: ${Math.round(totalHours * 100) / 100}h`,
      });
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a saída.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('pt-BR');
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getCurrentDuration = () => {
    if (!currentEntry) return null;
    const now = new Date();
    const clockIn = new Date(currentEntry.clock_in_time);
    const duration = (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
    return formatDuration(duration);
  };

  return (
    <div className="space-y-6">
      {/* Status atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Timer className="mr-2 h-5 w-5" />
            Status do Ponto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentEntry ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Clock className="mr-1 h-3 w-3" />
                  Trabalhando
                </Badge>
                <span className="text-lg font-semibold">
                  {getCurrentDuration()}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Local:</span> {currentEntry.cat_location}
                </div>
                <div>
                  <span className="font-medium">Entrada:</span> {formatTime(currentEntry.clock_in_time)}
                </div>
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Observações sobre o expediente (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
                <Button 
                  onClick={handleClockOut}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Registrar Saída
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Badge variant="outline" className="text-gray-600">
                <Clock className="mr-1 h-3 w-3" />
                Fora de expediente
              </Badge>
              
              <div className="space-y-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Local do CAT (ex: CAT Centro, CAT Aeroporto)"
                    value={catLocation}
                    onChange={(e) => setCatLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Textarea
                  placeholder="Observações (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
                <Button 
                  onClick={handleClockIn}
                  disabled={isLoading || !catLocation.trim()}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Registrar Entrada
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Histórico de Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum registro de ponto encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div 
                  key={entry.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{entry.cat_location}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(entry.created_at).split(' ')[0]}
                      </div>
                    </div>
                    <Badge 
                      variant={entry.clock_out_time ? 'default' : 'outline'}
                      className={entry.clock_out_time ? '' : 'text-green-600 border-green-600'}
                    >
                      {entry.clock_out_time ? 'Completo' : 'Em andamento'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Entrada:</span><br />
                      {formatTime(entry.clock_in_time).split(' ')[1]}
                    </div>
                    <div>
                      <span className="font-medium">Saída:</span><br />
                      {entry.clock_out_time ? formatTime(entry.clock_out_time).split(' ')[1] : '-'}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span><br />
                      {formatDuration(entry.total_hours)}
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <div className="text-xs text-gray-600 italic">
                      "{entry.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendantTimesheet;