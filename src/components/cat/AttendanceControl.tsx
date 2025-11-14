/**
 * Controle de Ponto para Atendentes de CAT
 * Sistema de check-in/check-out com geolocalização
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Timer, 
  Calendar,
  User,
  Building2,
  Wifi,
  WifiOff,
  AlertCircle,
  History,
  Download,
  Upload
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  attendantId: string;
  attendantName: string;
  catLocation: string;
  checkInTime: Date;
  checkOutTime?: Date;
  totalHours?: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  notes?: string;
  status: 'active' | 'completed';
  createdAt: Date;
}

interface AttendanceStats {
  totalHours: number;
  totalDays: number;
  averageHours: number;
  currentStreak: number;
  thisWeek: number;
  thisMonth: number;
}

const AttendanceControl: React.FC = () => {
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalHours: 0,
    totalDays: 0,
    averageHours: 0,
    currentStreak: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [notes, setNotes] = useState('');

  // Dados mock para demonstração
  useEffect(() => {
    const mockHistory: AttendanceRecord[] = [
      {
        id: '1',
        attendantId: 'att-001',
        attendantName: 'Maria Silva',
        catLocation: 'CAT Bonito - Centro',
        checkInTime: new Date('2024-10-15T08:00:00'),
        checkOutTime: new Date('2024-10-15T17:00:00'),
        totalHours: 9,
        location: {
          lat: -21.1261,
          lng: -56.4816,
          address: 'Rua da Liberdade, 123, Bonito - MS'
        },
        notes: 'Turno normal',
        status: 'completed',
        createdAt: new Date('2024-10-15T08:00:00')
      },
      {
        id: '2',
        attendantId: 'att-001',
        attendantName: 'Maria Silva',
        catLocation: 'CAT Bonito - Centro',
        checkInTime: new Date('2024-10-16T08:00:00'),
        checkOutTime: new Date('2024-10-16T17:30:00'),
        totalHours: 9.5,
        location: {
          lat: -21.1261,
          lng: -56.4816,
          address: 'Rua da Liberdade, 123, Bonito - MS'
        },
        notes: 'Atendimento intenso',
        status: 'completed',
        createdAt: new Date('2024-10-16T08:00:00')
      },
      {
        id: '3',
        attendantId: 'att-001',
        attendantName: 'Maria Silva',
        catLocation: 'CAT Bonito - Centro',
        checkInTime: new Date('2024-10-17T08:00:00'),
        status: 'active',
        location: {
          lat: -21.1261,
          lng: -56.4816,
          address: 'Rua da Liberdade, 123, Bonito - MS'
        },
        createdAt: new Date('2024-10-17T08:00:00')
      }
    ];

    setAttendanceHistory(mockHistory);
    
    // Encontrar registro ativo (apenas se existir)
    const activeRecord = mockHistory.find(record => record.status === 'active');
    setCurrentRecord(activeRecord || null);

    // Calcular estatísticas
    const completedRecords = mockHistory.filter(record => record.status === 'completed');
    const totalHours = completedRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const totalDays = completedRecords.length;
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0;

    setStats({
      totalHours,
      totalDays,
      averageHours,
      currentStreak: 3,
      thisWeek: 18.5,
      thisMonth: 75
    });
  }, []);

  // Obter localização atual com geolocalização melhorada
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        // Opções para melhor precisão
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            
            // Verificar se a precisão é aceitável (menos de 100 metros)
            if (accuracy <= 100) {
              setLocation({
                lat: latitude,
                lng: longitude,
                address: `Localização precisa (${Math.round(accuracy)}m)`
              });
            } else {
              setLocation({
                lat: latitude,
                lng: longitude,
                address: `Localização aproximada (${Math.round(accuracy)}m)`
              });
            }
          },
          (error) => {
            console.error('Erro ao obter localização:', error);
            let errorMessage = 'Erro ao obter localização';
            
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Permissão de localização negada';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Localização indisponível';
                break;
              case error.TIMEOUT:
                errorMessage = 'Timeout na localização';
                break;
            }
            
            setLocation({
              lat: -21.1261,
              lng: -56.4816,
              address: `CAT Bonito - Centro (${errorMessage})`
            });
          },
          options
        );
      } else {
        setLocation({
          lat: -21.1261,
          lng: -56.4816,
          address: 'CAT Bonito - Centro (Geolocalização não suportada)'
        });
      }
    };

    getCurrentLocation();
  }, []);

  const handleCheckIn = async () => {
    if (!location) {
      alert('Localização não disponível. Verifique as permissões do navegador.');
      return;
    }

    setIsLoading(true);
    
    // Simular delay de processamento
    setTimeout(() => {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        attendantId: 'att-001',
        attendantName: 'Maria Silva',
        catLocation: 'CAT Bonito - Centro',
        checkInTime: new Date(),
        location: location,
        notes: notes,
        status: 'active',
        createdAt: new Date()
      };

      setCurrentRecord(newRecord);
      setAttendanceHistory(prev => [newRecord, ...prev]);
      setNotes('');
      setIsLoading(false);
    }, 1000);
  };

  const handleCheckOut = async () => {
    if (!currentRecord) return;

    setIsLoading(true);
    
    // Simular delay de processamento
    setTimeout(() => {
      const checkOutTime = new Date();
      const totalHours = (checkOutTime.getTime() - currentRecord.checkInTime.getTime()) / (1000 * 60 * 60);
      
      const updatedRecord: AttendanceRecord = {
        ...currentRecord,
        checkOutTime: checkOutTime,
        totalHours: Math.round(totalHours * 10) / 10,
        status: 'completed'
      };

      setAttendanceHistory(prev => 
        prev.map(record => record.id === currentRecord.id ? updatedRecord : record)
      );
      setCurrentRecord(null);
      setIsLoading(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCurrentDuration = () => {
    if (!currentRecord) return '00:00:00';
    
    const now = new Date();
    const checkInTime = currentRecord.checkInTime;
    
    // Verificar se o check-in foi hoje
    const today = new Date();
    const checkInDate = new Date(checkInTime);
    const isToday = checkInDate.toDateString() === today.toDateString();
    
    if (!isToday) {
      // Se não foi hoje, mostrar 00:00:00
      return '00:00:00';
    }
    
    // Calcular tempo trabalhado hoje
    const diff = now.getTime() - checkInTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Controle de Ponto</h2>
          <p className="text-gray-600">Gerencie seu horário de trabalho</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            Histórico
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Status Atual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Status */}
        <Card className={currentRecord ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {currentRecord ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 text-gray-400" />
              )}
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentRecord ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {getCurrentDuration()}
                  </div>
                  <p className="text-sm text-gray-600">Tempo trabalhado hoje</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Entrada: {formatTime(currentRecord.checkInTime)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">{currentRecord.location.address}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCheckOut}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <Timer className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Check-out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 mb-2">
                    Fora de Serviço
                  </div>
                  <p className="text-sm text-gray-600">Clique para iniciar o turno</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Adicione observações sobre o turno..."
                      rows={2}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCheckIn}
                    disabled={isLoading || !location}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <Timer className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Check-in
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {location ? (
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Wifi className="h-4 w-4 mr-2 text-green-600" />
                  <span>Localização detectada</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Endereço:</strong> {location.address}</p>
                  <p><strong>Coordenadas:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Ver no Mapa
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <WifiOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Obtendo localização...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Horas</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dias Trabalhados</p>
                <p className="text-2xl font-bold">{stats.totalDays}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média Diária</p>
                <p className="text-2xl font-bold">{stats.averageHours.toFixed(1)}h</p>
              </div>
              <Timer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sequência</p>
                <p className="text-2xl font-bold">{stats.currentStreak} dias</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Histórico Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceHistory.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    record.status === 'active' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {record.status === 'active' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {formatDate(record.checkInTime)} - {formatTime(record.checkInTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.status === 'active' 
                        ? 'Em andamento' 
                        : `Saída: ${formatTime(record.checkOutTime!)} (${record.totalHours}h)`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
                    {record.status === 'active' ? 'Ativo' : 'Concluído'}
                  </Badge>
                  {record.notes && (
                    <Button variant="ghost" size="sm">
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {attendanceHistory.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline">
                Ver Histórico Completo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceControl;


