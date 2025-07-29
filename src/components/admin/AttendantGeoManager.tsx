import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Edit,
  Trash2,
  Navigation,
  UserPlus,
  Settings,
  Eye,
  Copy
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LocationPicker from '@/components/admin/LocationPicker';

interface Attendant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_online: boolean;
  last_checkin?: string;
  assigned_locations: AllowedLocation[];
}

interface AllowedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowed_radius: number;
  working_hours: {
    start: string;
    end: string;
  };
  is_active: boolean;
}

interface CheckIn {
  id: string;
  attendant_id: string;
  attendant_name: string;
  location_name: string;
  checkin_time: string;
  checkout_time?: string;
  is_valid: boolean;
  latitude: number;
  longitude: number;
}

const AttendantGeoManager: React.FC = () => {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [locations, setLocations] = useState<AllowedLocation[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([]);
  const [showCreateAttendant, setShowCreateAttendant] = useState(false);
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [newAttendant, setNewAttendant] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    assigned_locations: [] as string[]
  });

  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    allowed_radius: 100,
    working_hours: {
      start: '08:00',
      end: '18:00'
    }
  });

  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const { user } = useAuth();
  const { toast } = useToast();

  // Gerar credenciais automáticas para atendente
  const generateAttendantCredentials = (name: string) => {
    const firstName = name.split(' ')[0].toLowerCase();
    const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const email = `${firstName}.atendente${randomSuffix}@flowtrip.ms`;
    const password = `Flowtrip${randomSuffix}!`;
    
    return { email, password };
  };

  // Função para selecionar localização via mapa
  const handleLocationSelect = (location) => {
    setNewLocation({
      ...newLocation,
      name: location.name || newLocation.name,
      address: location.address || '',
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    });
    setShowLocationPicker(false);
  };

  useEffect(() => {
    loadAttendants();
    loadLocations();
    loadRecentCheckins();
  }, [user]);

  const loadAttendants = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          phone,
          attendant_location_assignments (
            attendant_allowed_locations (
              id,
              name,
              address,
              latitude,
              longitude,
              allowed_radius,
              working_hours,
              is_active
            )
          )
        `)
        .eq('user_role', 'atendente')
        .eq('city_id', user.city_id);

      if (error) throw error;

      const attendantsData = data?.map(attendant => ({
        ...attendant,
        is_online: false, // Será calculado baseado nos check-ins
        assigned_locations: attendant.attendant_location_assignments
          ?.map(assignment => assignment.attendant_allowed_locations)
          .filter(Boolean) || []
      })) || [];

      setAttendants(attendantsData);
    } catch (error) {
      console.error('Erro ao carregar atendentes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os atendentes",
        variant: "destructive"
      });
    }
  };

  const loadLocations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('attendant_allowed_locations')
        .select('*')
        .eq('city_id', user.city_id)
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
    }
  };

  const loadRecentCheckins = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('attendant_checkins')
        .select(`
          id,
          attendant_id,
          checkin_time,
          checkout_time,
          is_valid,
          latitude,
          longitude,
          user_profiles!attendant_id (name),
          attendant_allowed_locations (name)
        `)
        .eq('client_slug', 'ms')
        .gte('checkin_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 7 dias
        .order('checkin_time', { ascending: false })
        .limit(20);

      if (error) throw error;

      const checkinsData = data?.map(checkin => ({
        id: checkin.id,
        attendant_id: checkin.attendant_id,
        attendant_name: checkin.user_profiles?.name || 'N/A',
        location_name: checkin.attendant_allowed_locations?.name || 'Local removido',
        checkin_time: checkin.checkin_time,
        checkout_time: checkin.checkout_time,
        is_valid: checkin.is_valid,
        latitude: checkin.latitude,
        longitude: checkin.longitude
      })) || [];

      setRecentCheckins(checkinsData);
    } catch (error) {
      console.error('Erro ao carregar check-ins:', error);
    }
  };

  const createAttendant = async () => {
    try {
      // Gerar credenciais automáticas se não fornecidas
      let email = newAttendant.email;
      let password = newAttendant.password;
      
      if (!email || !password) {
        const credentials = generateAttendantCredentials(newAttendant.name);
        email = credentials.email;
        password = credentials.password;
        
        // Salvar credenciais geradas para mostrar ao usuário
        setGeneratedCredentials({ email, password, name: newAttendant.name });
      }

      // 1. Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: newAttendant.name,
          phone: newAttendant.phone,
          user_role: 'atendente',
          city_id: user.city_id,
          client_slug: 'ms'
        }
      });

      if (authError) throw authError;

      // 2. Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: newAttendant.name,
          email: email,
          phone: newAttendant.phone,
          user_role: 'atendente',
          city_id: user.city_id,
          client_slug: 'ms',
          created_by: user.id
        });

      if (profileError) throw profileError;

      // 3. Associar locais
      if (newAttendant.assigned_locations.length > 0) {
        const assignments = newAttendant.assigned_locations.map(locationId => ({
          attendant_id: authData.user.id,
          location_id: locationId,
          assigned_by: user.id
        }));

        const { error: assignmentError } = await supabase
          .from('attendant_location_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      setShowCreateAttendant(false);
      setNewAttendant({
        name: '',
        email: '',
        phone: '',
        password: '',
        assigned_locations: []
      });

      toast({
        title: "Atendente criado!",
        description: `${newAttendant.name} foi adicionado com sucesso.`,
      });

      loadAttendants();
    } catch (error: any) {
      console.error('Erro ao criar atendente:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o atendente",
        variant: "destructive"
      });
    }
  };

  const createLocation = async () => {
    // Validações
    if (!newLocation.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do local é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!newLocation.latitude || !newLocation.longitude) {
      toast({
        title: "Erro", 
        description: "Selecione a localização no mapa ou insira as coordenadas",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('attendant_allowed_locations')
        .insert({
          name: newLocation.name,
          address: newLocation.address,
          latitude: parseFloat(newLocation.latitude),
          longitude: parseFloat(newLocation.longitude),
          allowed_radius: newLocation.allowed_radius,
          working_hours: newLocation.working_hours,
          city_id: user.city_id,
          client_slug: 'ms',
          created_by: user.id
        });

      if (error) throw error;

      setShowCreateLocation(false);
      setNewLocation({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        allowed_radius: 100,
        working_hours: { start: '08:00', end: '18:00' }
      });

      toast({
        title: "Local criado!",
        description: `${newLocation.name} foi adicionado com sucesso.`,
      });

      loadLocations();
    } catch (error: any) {
      console.error('Erro ao criar local:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o local",
        variant: "destructive"
      });
    }
  };

  const toggleLocationStatus = async (locationId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('attendant_allowed_locations')
        .update({ is_active: !isActive })
        .eq('id', locationId);

      if (error) throw error;
      loadLocations();

      toast({
        title: isActive ? "Local desativado" : "Local ativado",
        description: "Status atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao alterar status do local:', error);
    }
  };

  const getOnlineCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return recentCheckins.filter(checkin => 
      checkin.checkin_time.startsWith(today) && !checkin.checkout_time
    ).length;
  };

  const getTodayCheckins = () => {
    const today = new Date().toISOString().split('T')[0];
    return recentCheckins.filter(checkin => 
      checkin.checkin_time.startsWith(today)
    ).length;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestão de Atendentes</h1>
          <p className="text-gray-600 text-lg">Controle de ponto por geolocalização</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showCreateLocation} onOpenChange={setShowCreateLocation}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Novo Local
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Local Autorizado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do local"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                />
                <Input
                  placeholder="Endereço"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                />
                {/* Seleção de Coordenadas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Localização</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLocationPicker(true)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Selecionar no Mapa
                    </Button>
                  </div>
                  
                  {newLocation.latitude && newLocation.longitude ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Localização Selecionada</p>
                          <p className="text-xs text-green-600">
                            {newLocation.latitude}, {newLocation.longitude}
                          </p>
                          {newLocation.address && (
                            <p className="text-xs text-green-600">{newLocation.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Clique em "Selecionar no Mapa" para escolher a localização
                      </p>
                    </div>
                  )}
                  
                  {/* Campos manuais como fallback */}
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      Ou inserir coordenadas manualmente
                    </summary>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <Input
                        placeholder="Latitude"
                        type="number"
                        step="any"
                        value={newLocation.latitude}
                        onChange={(e) => setNewLocation({...newLocation, latitude: e.target.value})}
                      />
                      <Input
                        placeholder="Longitude"
                        type="number"
                        step="any"
                        value={newLocation.longitude}
                        onChange={(e) => setNewLocation({...newLocation, longitude: e.target.value})}
                      />
                    </div>
                  </details>
                </div>
                <Input
                  placeholder="Raio permitido (metros)"
                  type="number"
                  value={newLocation.allowed_radius}
                  onChange={(e) => setNewLocation({...newLocation, allowed_radius: parseInt(e.target.value)})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Início</label>
                    <Input
                      type="time"
                      value={newLocation.working_hours.start}
                      onChange={(e) => setNewLocation({
                        ...newLocation, 
                        working_hours: {...newLocation.working_hours, start: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fim</label>
                    <Input
                      type="time"
                      value={newLocation.working_hours.end}
                      onChange={(e) => setNewLocation({
                        ...newLocation, 
                        working_hours: {...newLocation.working_hours, end: e.target.value}
                      })}
                    />
                  </div>
                </div>
                <Button onClick={createLocation} className="w-full">
                  Criar Local
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateAttendant} onOpenChange={setShowCreateAttendant}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Atendente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Atendente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome completo"
                  value={newAttendant.name}
                  onChange={(e) => setNewAttendant({...newAttendant, name: e.target.value})}
                />
                <Input
                  placeholder="Email (deixe vazio para gerar automaticamente)"
                  type="email"
                  value={newAttendant.email}
                  onChange={(e) => setNewAttendant({...newAttendant, email: e.target.value})}
                />
                <Input
                  placeholder="Telefone (opcional)"
                  value={newAttendant.phone}
                  onChange={(e) => setNewAttendant({...newAttendant, phone: e.target.value})}
                />
                <Input
                  placeholder="Senha (deixe vazio para gerar automaticamente)"
                  type="password"
                  value={newAttendant.password}
                  onChange={(e) => setNewAttendant({...newAttendant, password: e.target.value})}
                />
                
                {/* Dica sobre geração automática */}
                {(!newAttendant.email || !newAttendant.password) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🔐 <strong>Geração Automática:</strong> Se você deixar email ou senha em branco, 
                      o sistema gerará credenciais automaticamente e as mostrará após a criação.
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">Locais Autorizados</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {locations.map(location => (
                      <label key={location.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newAttendant.assigned_locations.includes(location.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAttendant({
                                ...newAttendant,
                                assigned_locations: [...newAttendant.assigned_locations, location.id]
                              });
                            } else {
                              setNewAttendant({
                                ...newAttendant,
                                assigned_locations: newAttendant.assigned_locations.filter(id => id !== location.id)
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{location.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={createAttendant} className="w-full">
                  Criar Atendente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Atendentes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{attendants.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Agora</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{getOnlineCount()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Locais Ativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {locations.filter(l => l.is_active).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Check-ins Hoje</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{getTodayCheckins()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="attendants">Atendentes</TabsTrigger>
          <TabsTrigger value="locations">Locais</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Check-ins Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Check-ins Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCheckins.slice(0, 10).map((checkin) => (
                  <div key={checkin.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        checkin.is_valid ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{checkin.attendant_name}</p>
                        <p className="text-sm text-gray-600">{checkin.location_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(checkin.checkin_time).toLocaleString()}
                      </p>
                      {checkin.checkout_time ? (
                        <p className="text-xs text-gray-500">
                          Saída: {new Date(checkin.checkout_time).toLocaleTimeString()}
                        </p>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Trabalhando
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Atendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendants.map((attendant) => (
                  <div key={attendant.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{attendant.name}</h3>
                          <p className="text-sm text-gray-600">{attendant.email}</p>
                          {attendant.phone && (
                            <p className="text-xs text-gray-500">{attendant.phone}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={attendant.is_online ? "default" : "secondary"}>
                            {attendant.is_online ? 'Online' : 'Offline'}
                          </Badge>
                          {attendant.last_checkin && (
                            <p className="text-xs text-gray-500 mt-1">
                              Último: {new Date(attendant.last_checkin).toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Locais Associados */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Locais Autorizados ({attendant.assigned_locations.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {attendant.assigned_locations.map((location) => (
                          <Badge key={location.id} variant="outline" className="text-xs">
                            📍 {location.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Locais Autorizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locations.map((location) => (
                  <div key={location.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <MapPin className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">{location.name}</h3>
                          <p className="text-sm text-gray-600">{location.address}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Raio: {location.allowed_radius}m
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {location.working_hours.start} - {location.working_hours.end}
                            </Badge>
                          </div>
                          <Badge variant={location.is_active ? "default" : "secondary"}>
                            {location.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleLocationStatus(location.id, location.is_active)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Location Picker */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={
          newLocation.latitude && newLocation.longitude
            ? {
                latitude: parseFloat(newLocation.latitude),
                longitude: parseFloat(newLocation.longitude),
                address: newLocation.address
              }
            : undefined
        }
      />

      {/* Modal de Credenciais Geradas */}
      <Dialog open={!!generatedCredentials} onOpenChange={() => setGeneratedCredentials(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Atendente Criado com Sucesso!
            </DialogTitle>
          </DialogHeader>
          
          {generatedCredentials && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  ✅ {generatedCredentials.name} foi cadastrado(a) com sucesso!
                </h3>
                <p className="text-sm text-green-700">
                  As credenciais de acesso foram geradas automaticamente.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email de Acesso:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
                      {generatedCredentials.email}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCredentials.email);
                        toast({ title: "Email copiado!" });
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Senha:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
                      {generatedCredentials.password}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCredentials.password);
                        toast({ title: "Senha copiada!" });
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  ⚠️ <strong>Importante:</strong> Compartilhe essas credenciais com o atendente de forma segura. 
                  Ele poderá alterá-las no primeiro login se desejar.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    const credentials = `Email: ${generatedCredentials.email}\nSenha: ${generatedCredentials.password}`;
                    navigator.clipboard.writeText(credentials);
                    toast({ title: "Credenciais copiadas!" });
                  }}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Tudo
                </Button>
                <Button
                  onClick={() => setGeneratedCredentials(null)}
                  variant="outline"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendantGeoManager; 