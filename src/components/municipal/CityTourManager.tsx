
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Settings } from "lucide-react";

interface CityTourBooking {
  id: string;
  city: string;
  tour_date: string;
  tour_time: string;
  max_capacity: number;
  current_bookings: number;
  description: string;
  meeting_point: string;
  is_active: boolean;
}

interface CityTourSettings {
  id: string;
  city: string;
  is_public: boolean;
}

interface CityTourManagerProps {
  cityId: string;
}

const CityTourManager = ({ cityId }: CityTourManagerProps) => {
  const [bookings, setBookings] = useState<CityTourBooking[]>([]);
  const [settings, setSettings] = useState<CityTourSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tour_date: "",
    tour_time: "",
    max_capacity: 30,
    description: "",
    meeting_point: "",
  });

  const [settingsData, setSettingsData] = useState({
    is_public: false,
  });

  const fetchBookings = useCallback(async () => {
    if (!cityId) return;
    try {
      const { data, error } = await supabase
        .from('city_tour_bookings')
        .select('*')
        .eq('city', cityId) // Filtra por city
        .order('tour_date', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [cityId, toast]);

  const fetchSettings = useCallback(async () => {
    if (!cityId) return;
    try {
      const { data, error } = await supabase
        .from('city_tour_settings')
        .select('*')
        .eq('city', cityId) // Filtra por city
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return;
      }
      if (data) {
        setSettings(data);
        setSettingsData({ is_public: data.is_public });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, [cityId, toast]);

  useEffect(() => {
    fetchBookings();
    fetchSettings();
  }, [fetchBookings, fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tour_date || !formData.tour_time || !formData.description || !formData.meeting_point) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('city_tour_bookings')
        .insert([{
          city: cityId || 'default',
          tour_date: formData.tour_date,
          tour_time: formData.tour_time,
          max_capacity: formData.max_capacity,
          description: formData.description,
          meeting_point: formData.meeting_point,
        }]);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso",
      });

      setFormData({
        tour_date: "",
        tour_time: "",
        max_capacity: 30,
        description: "",
        meeting_point: "",
      });
      setIsDialogOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento",
        variant: "destructive",
      });
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('city_tour_settings')
        .upsert([{
          city: cityId || 'default',
          is_public: settingsData.is_public,
        }], { onConflict: 'city' });

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });

      setIsSettingsOpen(false);
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Controle de City Tour</CardTitle>
          <div className="flex gap-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurações de Visibilidade</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSettingsSubmit} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_public"
                      checked={settingsData.is_public}
                      onCheckedChange={(checked) => setSettingsData({ ...settingsData, is_public: checked })}
                    />
                    <Label htmlFor="is_public">
                      Tornar City Tour visível publicamente no app
                    </Label>
                  </div>
                  <Button type="submit" className="w-full">
                    Salvar Configurações
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Agendamento de City Tour</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tour_date">Data</Label>
                      <Input
                        id="tour_date"
                        type="date"
                        value={formData.tour_date}
                        onChange={(e) => setFormData({ ...formData, tour_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tour_time">Horário</Label>
                      <Input
                        id="tour_time"
                        type="time"
                        value={formData.tour_time}
                        onChange={(e) => setFormData({ ...formData, tour_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="max_capacity">Capacidade Máxima</Label>
                    <Input
                      id="max_capacity"
                      type="number"
                      value={formData.max_capacity}
                      onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="meeting_point">Ponto de Encontro</Label>
                    <Input
                      id="meeting_point"
                      value={formData.meeting_point}
                      onChange={(e) => setFormData({ ...formData, meeting_point: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Criar Agendamento
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {settings && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status de Visibilidade Pública:</span>
                <Badge variant={settings.is_public ? "default" : "secondary"}>
                  {settings.is_public ? "Público" : "Privado"}
                </Badge>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">Carregando agendamentos...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Reservas</TableHead>
                  <TableHead>Ponto de Encontro</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.city}</TableCell>
                    <TableCell>{new Date(booking.tour_date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{booking.tour_time}</TableCell>
                    <TableCell>{booking.max_capacity}</TableCell>
                    <TableCell>
                      <Badge variant={(booking.current_bookings || 0) >= booking.max_capacity ? "destructive" : "default"}>
                        {booking.current_bookings || 0}/{booking.max_capacity}
                      </Badge>
                    </TableCell>
                    <TableCell>{booking.meeting_point}</TableCell>
                    <TableCell>
                      <Badge variant={booking.is_active ? "default" : "secondary"}>
                        {booking.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CityTourManager;
