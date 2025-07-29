import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Send
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { masterDashboardService } from '@/services/masterDashboardService';

interface Attendant {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  city_name?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  last_sign_in_at?: string;
}

interface City {
  id: string;
  name: string;
  region_id: string;
}

const AttendantManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city_id: '',
    sendInvite: true
  });

  useEffect(() => {
    fetchAttendants();
    fetchCities();
  }, []);

  const fetchAttendants = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          status,
          created_at,
          last_sign_in_at,
          city_id,
          cities(name)
        `)
        .in('role', ['atendente']);

      if (error) throw error;

      const formattedAttendants = data?.map(attendant => ({
        id: attendant.id,
        full_name: attendant.full_name || '',
        email: attendant.email || '',
        phone: attendant.phone || '',
        city_name: attendant.cities?.name || '',
        status: attendant.status || 'active',
        created_at: attendant.created_at,
        last_sign_in_at: attendant.last_sign_in_at
      })) || [];

      setAttendants(formattedAttendants);
    } catch (error) {
      console.error('Erro ao buscar atendentes:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar atendentes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, region_id')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  };

  const handleCreateAttendant = async () => {
    if (!formData.name || !formData.email || !formData.city_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      // Criar usuário via função RPC
      const { data, error } = await supabase.rpc('create_attendant_user', {
        user_email: formData.email,
        user_name: formData.name,
        user_phone: formData.phone || null,
        user_city_id: formData.city_id,
        send_invite: formData.sendInvite
      });

      if (error) throw error;

      // Notificar o Master Dashboard sobre a criação do atendente
      await masterDashboardService.notifyPlatformUpdate({
        update_type: 'content',
        description: 'Novo atendente cadastrado no sistema',
        data: {
          action: 'attendant_created',
          attendant_info: {
            email: formData.email,
            name: formData.name,
            city_id: formData.city_id,
            invite_sent: formData.sendInvite
          }
        }
      });

      toast({
        title: "Sucesso",
        description: formData.sendInvite 
          ? "Atendente criado e convite enviado por email" 
          : "Atendente criado com sucesso",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        city_id: '',
        sendInvite: true
      });

      setIsDialogOpen(false);
      fetchAttendants();

    } catch (error: any) {
      console.error('Erro ao criar atendente:', error);
      
      // Enviar alerta de erro para o Master Dashboard
      await masterDashboardService.sendAlert({
        severity: 'error',
        type: 'user',
        message: 'Falha ao criar atendente',
        details: { 
          error: error.message,
          attendant_email: formData.email,
          attendant_name: formData.name
        },
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Erro",
        description: error.message || "Falha ao criar atendente",
        variant: "destructive"
      });
    }
  };

  const toggleAttendantStatus = async (attendantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: newStatus })
        .eq('id', attendantId);

      if (error) throw error;

      // Notificar o Master Dashboard sobre a mudança de status
      await masterDashboardService.notifyPlatformUpdate({
        update_type: 'content',
        description: `Status de atendente alterado para ${newStatus}`,
        data: {
          action: 'attendant_status_changed',
          attendant_id: attendantId,
          old_status: currentStatus,
          new_status: newStatus
        }
      });

      toast({
        title: "Sucesso",
        description: `Atendente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`,
      });

      fetchAttendants();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      
      // Enviar alerta de erro para o Master Dashboard
      await masterDashboardService.sendAlert({
        severity: 'warning',
        type: 'user',
        message: 'Falha ao alterar status de atendente',
        details: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          attendant_id: attendantId,
          attempted_status: newStatus
        },
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Erro",
        description: "Falha ao alterar status do atendente",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', class: 'bg-green-500' },
      inactive: { label: 'Inativo', class: 'bg-red-500' },
      pending: { label: 'Pendente', class: 'bg-yellow-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <Badge className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredAttendants = attendants.filter(attendant => {
    const matchesSearch = attendant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'all' || attendant.city_name === selectedCity;
    const matchesStatus = selectedStatus === 'all' || attendant.status === selectedStatus;
    
    return matchesSearch && matchesCity && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Gestão de Atendentes</h1>
            <p className="text-muted-foreground">
              Cadastre e gerencie atendentes dos CATs
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Atendente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Atendente</DialogTitle>
              <DialogDescription>
                Preencha os dados do atendente. Um convite será enviado por email.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(67) 99999-9999"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Select 
                    value={formData.city_id} 
                    onValueChange={(value) => setFormData({...formData, city_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendInvite"
                  checked={formData.sendInvite}
                  onChange={(e) => setFormData({...formData, sendInvite: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="sendInvite" className="text-sm">
                  Enviar convite por email automaticamente
                </Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAttendant}>
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar Atendente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{attendants.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {attendants.filter(a => a.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {attendants.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-red-600">
                  {attendants.filter(a => a.status === 'inactive').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Atendentes</CardTitle>
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {[...new Set(attendants.map(a => a.city_name).filter(Boolean))].map((city) => (
                  <SelectItem key={city} value={city!}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAttendants.map((attendant) => (
              <div
                key={attendant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(attendant.status)}
                  <div>
                    <h3 className="font-semibold">{attendant.full_name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {attendant.email}
                      </span>
                      {attendant.phone && (
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {attendant.phone}
                        </span>
                      )}
                      {attendant.city_name && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {attendant.city_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">
                      Criado: {new Date(attendant.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {attendant.last_sign_in_at && (
                      <p className="text-muted-foreground">
                        Último acesso: {new Date(attendant.last_sign_in_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(attendant.status)}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleAttendantStatus(attendant.id, attendant.status)}
                    >
                      {attendant.status === 'active' ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredAttendants.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum atendente encontrado com os filtros aplicados
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendantManager; 