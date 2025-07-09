import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Eye, EyeOff, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  visibility_end_date?: string | null;
  is_visible?: boolean;
  auto_hide?: boolean;
  image_url: string | null;
  created_at: string;
}

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (eventId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_visible: !currentVisibility } as any)
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, is_visible: !currentVisibility }
          : event
      ));

      toast({
        title: "Sucesso",
        description: `Evento ${!currentVisibility ? 'exibido' : 'ocultado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a visibilidade do evento.",
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "visible") return matchesSearch && event.is_visible !== false;
    if (statusFilter === "hidden") return matchesSearch && event.is_visible === false;
    if (statusFilter === "expired") {
      const now = new Date();
      const visibilityEnd = event.visibility_end_date ? new Date(event.visibility_end_date) : null;
      return matchesSearch && visibilityEnd && visibilityEnd < now;
    }
    
    return matchesSearch;
  });

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : null;
    const visibilityEnd = event.visibility_end_date ? new Date(event.visibility_end_date) : null;

    if (event.is_visible === false) return { label: "Oculto", variant: "secondary" as const };
    if (visibilityEnd && visibilityEnd < now) return { label: "Expirado", variant: "destructive" as const };
    if (endDate && endDate < now) return { label: "Finalizado", variant: "outline" as const };
    if (startDate > now) return { label: "Futuro", variant: "default" as const };
    return { label: "Ativo", variant: "default" as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ms-primary-blue">Gestão de Eventos</h1>
          <p className="text-gray-600">Gerencie todos os eventos da plataforma</p>
        </div>
        <Button 
          onClick={() => navigate('/event-editor/new')}
          className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
        >
          <Plus size={20} className="mr-2" />
          Novo Evento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="visible">Visíveis</SelectItem>
                <SelectItem value="hidden">Ocultos</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Data do Evento</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => {
                const status = getEventStatus(event);
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {format(new Date(event.start_date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.visibility_end_date ? (
                        format(new Date(event.visibility_end_date), "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Sem expiração"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/event-editor/${event.id}`)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleVisibility(event.id, event.is_visible || false)}
                        >
                          {event.is_visible !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== "all" 
                ? "Nenhum evento encontrado com os filtros aplicados."
                : "Nenhum evento cadastrado ainda."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsList;