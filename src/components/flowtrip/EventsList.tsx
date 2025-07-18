import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Users, Clock, Search, Filter, ExternalLink } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  image_url?: string;
  is_visible: boolean;
}

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'ongoing'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { addPoints, addStamp, currentState } = useFlowTrip();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [currentState]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filterType]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_visible', true)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    const now = new Date();
    if (filterType === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.start_date) > now);
    } else if (filterType === 'ongoing') {
      filtered = filtered.filter(event => 
        new Date(event.start_date) <= now && 
        new Date(event.end_date || event.start_date) >= now
      );
    }

    setFilteredEvents(filtered);
  };

  const handleEventInteraction = async (eventId: string, interactionType: 'interest' | 'participation') => {
    try {
      const points = interactionType === 'interest' ? 5 : 20;
      const activityType = interactionType === 'interest' ? 'event_interest' : 'event_participation';

      await addStamp({
        destination_id: eventId, // Usando destination_id como workaround
        activity_type: activityType,
        points_earned: points
      });

      toast({
        title: `+${points} pontos!`,
        description: `Você ganhou pontos por demonstrar ${interactionType === 'interest' ? 'interesse' : 'participar'} no evento.`
      });
    } catch (error) {
      console.error('Error adding event interaction:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar sua interação.',
        variant: 'destructive'
      });
    }
  };

  const getEventStatus = (startDate: string, endDate?: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (end < now) {
      return { status: 'Finalizado', color: 'bg-gray-500' };
    } else if (start <= now && now <= end) {
      return { status: 'Em andamento', color: 'bg-green-500' };
    } else {
      return { status: 'Em breve', color: 'bg-blue-500' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary to-secondary text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Eventos FlowTrip
          </CardTitle>
          <p className="text-white/80">
            Participe de eventos e ganhe pontos especiais!
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Todos
          </Button>
          <Button
            variant={filterType === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilterType('upcoming')}
          >
            Em breve
          </Button>
          <Button
            variant={filterType === 'ongoing' ? 'default' : 'outline'}
            onClick={() => setFilterType('ongoing')}
          >
            Em andamento
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const eventStatus = getEventStatus(event.start_date, event.end_date);
          
          return (
            <Card key={event.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-primary" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={`${eventStatus.color} text-white`}>
                    {eventStatus.status}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {event.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(event.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                      {event.end_date && event.end_date !== event.start_date && (
                        <span> - {format(new Date(event.end_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      )}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEventInteraction(event.id, 'interest')}
                    className="flex-1 gap-1"
                  >
                    <Users className="h-4 w-4" />
                    Interesse (+5pts)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEventInteraction(event.id, 'participation')}
                    className="flex-1 gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Participar (+20pts)
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Tente ajustar sua busca ou filtros' 
                : 'Novos eventos serão adicionados em breve'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventsList;