import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, Star, Filter, Heart, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  city: string;
  category: string;
  image: string;
  price: number;
  isFree: boolean;
  rating: number;
  attendees: number;
}

const EventosMS = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Mock data para demonstração
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: '1',
        name: 'Festival de Inverno de Bonito',
        description: 'Celebre a temporada de inverno com gastronomia, música e aventuras em Bonito.',
        date: '2024-07-15',
        location: 'Centro de Bonito',
        city: 'Bonito',
        category: 'Festival',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
        price: 0,
        isFree: true,
        rating: 4.8,
        attendees: 2500
      },
      {
        id: '2',
        name: 'Cavalgada do Pantanal',
        description: 'Passeio a cavalo pelos campos alagados do Pantanal com guias especializados.',
        date: '2024-08-20',
        location: 'Fazenda Pantanal',
        city: 'Corumbá',
        category: 'Aventura',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        price: 150,
        isFree: false,
        rating: 4.9,
        attendees: 120
      },
      {
        id: '3',
        name: 'Feira de Artesanato de Campo Grande',
        description: 'Exposição e venda de artesanato local com apresentações culturais.',
        date: '2024-09-10',
        location: 'Parque das Nações',
        city: 'Campo Grande',
        category: 'Cultural',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        price: 0,
        isFree: true,
        rating: 4.6,
        attendees: 800
      },
      {
        id: '4',
        name: 'Observação de Aves no Cerrado',
        description: 'Tour guiado para observação de aves nativas do Cerrado sul-mato-grossense.',
        date: '2024-10-05',
        location: 'RPPN Cerrado',
        city: 'Coxim',
        category: 'Ecoturismo',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        price: 80,
        isFree: false,
        rating: 4.7,
        attendees: 45
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || event.category === categoryFilter;
    const matchesCity = !cityFilter || event.city === cityFilter;
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  const handleViewEvent = (event: Event) => {
    navigate(`/ms/eventos/${event.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Eventos</h1>
            <p className="text-xl text-gray-600">Carregando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Eventos</h1>
          <p className="text-xl text-gray-600">
            Descubra os melhores eventos e experiências em Mato Grosso do Sul
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as categorias</SelectItem>
                      <SelectItem value="Festival">Festival</SelectItem>
                      <SelectItem value="Aventura">Aventura</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Ecoturismo">Ecoturismo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as cidades</SelectItem>
                      <SelectItem value="Bonito">Bonito</SelectItem>
                      <SelectItem value="Campo Grande">Campo Grande</SelectItem>
                      <SelectItem value="Corumbá">Corumbá</SelectItem>
                      <SelectItem value="Coxim">Coxim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                      setCityFilter('');
                    }}
                    className="w-full"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant={event.isFree ? "default" : "secondary"}>
                    {event.isFree ? "Gratuito" : `R$ ${event.price}`}
                  </Badge>
                </div>
                <div className="absolute top-4 left-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-white/80 hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{event.category}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {event.rating}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                  {event.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}, {event.city}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {event.attendees} participantes
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleViewEvent(event)}
                    className="flex-1"
                  >
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros para encontrar eventos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventosMS;
