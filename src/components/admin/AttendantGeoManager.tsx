import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  MapPin,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Trash2
} from 'lucide-react';

interface CatLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  working_hours: string;
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
}

interface AttendantTimesheet {
  id: string;
  user_id: string;
  cat_location: string;
  clock_in_time: string;
  clock_out_time: string | null;
  total_hours: number | null;
  notes: string | null;
  created_at: string;
}

const AttendantGeoManager = () => {
  const [catLocations, setCatLocations] = useState<CatLocation[]>([]);
  const [timesheets, setTimesheets] = useState<AttendantTimesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    city: '',
    region: '',
    working_hours: '08:00-17:00',
    contact_email: '',
    contact_phone: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Buscar localizações CAT
      const { data: locationsData, error: locationsError } = await supabase
        .from('cat_locations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (locationsError) throw locationsError;
      setCatLocations(locationsData || []);

      // Buscar folhas de ponto dos atendentes
      const { data: timesheetsData, error: timesheetsError } = await supabase
        .from('attendant_timesheet')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (timesheetsError) throw timesheetsError;
      setTimesheets(timesheetsData || []);
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao buscar dados:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos atendentes e localizações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!newLocation.name || !newLocation.city) {
      toast({
        title: "Erro",
        description: "Nome e cidade são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cat_locations')
        .insert([newLocation]);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Localização CAT criada com sucesso!",
        variant: "default",
      });
      
      setNewLocation({
        name: '',
        address: '',
        city: '',
        region: '',
        working_hours: '08:00-17:00',
        contact_email: '',
        contact_phone: ''
      });
      
      fetchData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao criar localização:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar localização CAT.",
        variant: "destructive",
      });
    }
  };

  const handleToggleLocationStatus = async (locationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('cat_locations')
        .update({ is_active: !currentStatus })
        .eq('id', locationId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Localização ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`,
        variant: "default",
      });
      
      fetchData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao atualizar status:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da localização.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Carregando dados dos atendentes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Localizações</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{catLocations.length}</div>
            <p className="text-xs text-muted-foreground">
              {catLocations.filter(l => l.is_active).length} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timesheets.filter(t => 
                new Date(t.created_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {timesheets.filter(t => !t.clock_out_time).length} em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timesheets.reduce((total, t) => total + (t.total_hours || 0), 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Criar Nova Localização CAT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PlusCircle className="w-5 h-5 mr-2" />
            Criar Nova Localização CAT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Localização</Label>
              <Input
                id="name"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="Ex: CAT Centro"
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={newLocation.city}
                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                placeholder="Ex: Campo Grande"
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={newLocation.address}
                onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>
            <div>
              <Label htmlFor="region">Região</Label>
              <Input
                id="region"
                value={newLocation.region}
                onChange={(e) => setNewLocation({ ...newLocation, region: e.target.value })}
                placeholder="Ex: Centro"
              />
            </div>
            <div>
              <Label htmlFor="working_hours">Horário de Funcionamento</Label>
              <Input
                id="working_hours"
                value={newLocation.working_hours}
                onChange={(e) => setNewLocation({ ...newLocation, working_hours: e.target.value })}
                placeholder="08:00-17:00"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email de Contato</Label>
              <Input
                id="contact_email"
                type="email"
                value={newLocation.contact_email}
                onChange={(e) => setNewLocation({ ...newLocation, contact_email: e.target.value })}
                placeholder="contato@cat.ms.gov.br"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleCreateLocation}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Criar Localização
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Localizações CAT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Localizações CAT ({catLocations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {catLocations.length === 0 ? (
            <p>Nenhuma localização CAT encontrada.</p>
          ) : (
            <div className="grid gap-4">
              {catLocations.map((location) => (
                <div key={location.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {location.name}
                        <Badge 
                          variant={location.is_active ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {location.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </h3>
                      <p className="text-sm text-gray-600">{location.address}</p>
                      <p className="text-sm text-gray-500">
                        {location.city} - {location.region}
                      </p>
                      <p className="text-sm text-gray-500">
                        Horário: {location.working_hours}
                      </p>
                      {location.contact_email && (
                        <p className="text-sm text-gray-500">
                          Email: {location.contact_email}
                        </p>
                      )}
                    </div>
                    <Button
                      variant={location.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleToggleLocationStatus(location.id, location.is_active)}
                    >
                      {location.is_active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Folhas de Ponto Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Folhas de Ponto Recentes ({timesheets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timesheets.length === 0 ? (
            <p>Nenhuma folha de ponto encontrada.</p>
          ) : (
            <div className="space-y-3">
              {timesheets.map((timesheet) => (
                <div key={timesheet.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {timesheet.cat_location}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Entrada: {new Date(timesheet.clock_in_time).toLocaleString()}
                      </p>
                      {timesheet.clock_out_time && (
                        <p className="text-sm text-gray-600">
                          Saída: {new Date(timesheet.clock_out_time).toLocaleString()}
                        </p>
                      )}
                      {timesheet.total_hours && (
                        <p className="text-sm text-gray-600">
                          Total: {timesheet.total_hours.toFixed(2)} horas
                        </p>
                      )}
                      {timesheet.notes && (
                        <p className="text-sm text-gray-500">
                          Observações: {timesheet.notes}
                        </p>
                      )}
                    </div>
                    <Badge variant={timesheet.clock_out_time ? "default" : "outline"}>
                      {timesheet.clock_out_time ? "Finalizado" : "Em andamento"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendantGeoManager;