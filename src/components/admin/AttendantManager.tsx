import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Attendant {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city_name: string;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  last_sign_in_at: string | null;
}

interface City {
  id: string;
  name: string;
}

const AttendantManager: React.FC = () => {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const { toast } = useToast();

  const [newAttendant, setNewAttendant] = useState({
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
      // Simplified fetch - just get user profiles with atendente role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'atendente');

      if (roleError) throw roleError;

      const userIds = roleData?.map(r => r.user_id) || [];

      if (userIds.length === 0) {
        setAttendants([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, phone, created_at')
        .in('user_id', userIds);

      if (error) throw error;

      const formattedAttendants = data?.map(attendant => ({
        id: attendant.user_id,
        full_name: attendant.full_name || '',
        email: 'email@example.com', // Placeholder since email is not in user_profiles
        phone: attendant.phone || '',
        city_name: 'Cidade não especificada',
        status: 'active' as const,
        created_at: attendant.created_at,
        last_sign_in_at: null
      })) || [];

      setAttendants(formattedAttendants);
    } catch (error: any) {
      console.error('Erro ao buscar atendentes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar atendentes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar cidades:', error);
    }
  };

  const handleCreateAttendant = async () => {
    try {
      // Create user profile first
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: crypto.randomUUID(),
          full_name: newAttendant.name,
          phone: newAttendant.phone,
          user_type: 'collaborator'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Assign atendente role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: profileData.user_id,
          role: 'atendente'
        });

      if (roleError) throw roleError;

      toast({
        title: "Sucesso",
        description: "Atendente criado com sucesso!",
        variant: "default",
      });

      setIsDialogOpen(false);
      setNewAttendant({
        name: '',
        email: '',
        phone: '',
        city_id: '',
        sendInvite: true
      });
      
      fetchAttendants();
    } catch (error: any) {
      console.error('Erro ao criar atendente:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar atendente.",
        variant: "destructive",
      });
    }
  };

  const toggleAttendantStatus = async (attendantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      // Update user role status
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          role: newStatus === 'active' ? 'atendente' : 'inactive_atendente'
        })
        .eq('user_id', attendantId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Atendente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`,
        variant: "default",
      });

      fetchAttendants();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do atendente.",
        variant: "destructive",
      });
    }
  };

  const filteredAttendants = attendants.filter(attendant => {
    const matchesSearch = attendant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || attendant.status === statusFilter;
    const matchesCity = cityFilter === 'all' || attendant.city_name.includes(cityFilter);
    
    return matchesSearch && matchesStatus && matchesCity;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Atendentes</h1>
          <p className="text-muted-foreground">Gerencie os atendentes dos Centros de Atendimento ao Turista</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Atendente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Atendente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={newAttendant.name}
                  onChange={(e) => setNewAttendant({...newAttendant, name: e.target.value})}
                  placeholder="Nome completo do atendente"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAttendant.email}
                  onChange={(e) => setNewAttendant({...newAttendant, email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newAttendant.phone}
                  onChange={(e) => setNewAttendant({...newAttendant, phone: e.target.value})}
                  placeholder="(67) 99999-9999"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Select value={newAttendant.city_id} onValueChange={(value) => setNewAttendant({...newAttendant, city_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cidade" />
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAttendant}>
                Criar Atendente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendants.filter(a => a.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {attendants.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {attendants.filter(a => a.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendants List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Atendentes</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
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
          {filteredAttendants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum atendente encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAttendants.map((attendant) => (
                <div key={attendant.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{attendant.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{attendant.email}</p>
                    <p className="text-sm text-muted-foreground">{attendant.phone}</p>
                    <p className="text-sm text-muted-foreground">{attendant.city_name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={attendant.status === 'active' ? 'default' : attendant.status === 'pending' ? 'secondary' : 'destructive'}>
                      {attendant.status === 'active' ? 'Ativo' : attendant.status === 'pending' ? 'Pendente' : 'Inativo'}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAttendantStatus(attendant.id, attendant.status)}
                      >
                        {attendant.status === 'active' ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
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

export default AttendantManager;