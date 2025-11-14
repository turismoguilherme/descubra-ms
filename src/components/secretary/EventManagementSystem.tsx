/**
 * Sistema de Gestão de Eventos
 * Calendário funcional para secretarias de turismo
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  Edit, 
  Trash2, 
  Eye,
  Share,
  Download,
  Upload,
  Image,
  Star,
  Heart,
  AlertCircle,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';

interface TourismEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: string;
  category: 'cultural' | 'gastronomic' | 'sports' | 'religious' | 'entertainment' | 'business';
  expectedAudience: number;
  budget: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  images: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  features: string[];
  isPublic: boolean;
  createdBy: string;
  lastUpdated: Date;
}

const EventManagementSystem: React.FC = () => {
  const [events, setEvents] = useState<TourismEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TourismEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TourismEvent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const categories = [
    { value: 'all', label: 'Todos', icon: '📅' },
    { value: 'cultural', label: 'Cultural', icon: '🎭' },
    { value: 'gastronomic', label: 'Gastronômico', icon: '🍽️' },
    { value: 'sports', label: 'Esportivo', icon: '⚽' },
    { value: 'religious', label: 'Religioso', icon: '⛪' },
    { value: 'entertainment', label: 'Entretenimento', icon: '🎪' },
    { value: 'business', label: 'Negócios', icon: '💼' }
  ];

  const statuses = [
    { value: 'all', label: 'Todos', color: 'gray' },
    { value: 'planned', label: 'Planejado', color: 'blue' },
    { value: 'active', label: 'Ativo', color: 'green' },
    { value: 'completed', label: 'Concluído', color: 'purple' },
    { value: 'cancelled', label: 'Cancelado', color: 'red' }
  ];

  // Dados mock para demonstração
  useEffect(() => {
    const mockEvents: TourismEvent[] = [
      {
        id: '1',
        title: 'Festival de Gastronomia Regional',
        description: 'Evento anual que celebra a culinária típica do Mato Grosso do Sul com chefs locais e pratos tradicionais.',
        date: new Date('2024-11-15'),
        endDate: new Date('2024-11-17'),
        location: 'Praça da Liberdade, Centro, Bonito - MS',
        category: 'gastronomic',
        expectedAudience: 5000,
        budget: 50000,
        status: 'planned',
        images: ['/images/festival1.jpg', '/images/festival2.jpg'],
        contact: {
          phone: '(67) 3255-1234',
          email: 'festival@bonito.ms.gov.br',
          website: 'www.festivalgastronomia.com'
        },
        features: ['Degustação', 'Workshops', 'Concurso culinário', 'Música ao vivo'],
        isPublic: true,
        createdBy: 'Secretaria de Turismo',
        lastUpdated: new Date()
      },
      {
        id: '2',
        title: 'Corrida da Família',
        description: 'Corrida beneficente para toda a família com percursos de 5km e 10km.',
        date: new Date('2024-10-20'),
        location: 'Parque Central, Bonito - MS',
        category: 'sports',
        expectedAudience: 500,
        budget: 15000,
        status: 'active',
        images: ['/images/corrida1.jpg'],
        contact: {
          phone: '(67) 3255-5678',
          email: 'corrida@bonito.ms.gov.br'
        },
        features: ['Kit do corredor', 'Medalhas', 'Premiação', 'Brindes'],
        isPublic: true,
        createdBy: 'Secretaria de Turismo',
        lastUpdated: new Date()
      },
      {
        id: '3',
        title: 'Feira de Artesanato',
        description: 'Exposição e venda de artesanato local com artesãos da região.',
        date: new Date('2024-12-01'),
        endDate: new Date('2024-12-03'),
        location: 'Centro de Convenções, Bonito - MS',
        category: 'cultural',
        expectedAudience: 2000,
        budget: 25000,
        status: 'planned',
        images: ['/images/feira1.jpg'],
        contact: {
          phone: '(67) 3255-9999',
          email: 'artesanato@bonito.ms.gov.br'
        },
        features: ['Exposição', 'Vendas', 'Workshops', 'Apresentações'],
        isPublic: true,
        createdBy: 'Secretaria de Turismo',
        lastUpdated: new Date()
      }
    ];

    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
  }, []);

  // Filtrar eventos
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory, selectedStatus]);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event: TourismEvent) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  const handleToggleStatus = (id: string, newStatus: string) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, status: newStatus as any }
        : event
    ));
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(cat => cat.value === category)?.icon || '📅';
  };

  const getStatusColor = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status);
    switch (statusConfig?.color) {
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (showForm) {
    return (
      <EventForm
        event={editingEvent}
        onSave={(event) => {
          if (editingEvent) {
            setEvents(prev => prev.map(e => e.id === event.id ? event : e));
          } else {
            setEvents(prev => [...prev, { ...event, id: Date.now().toString() }]);
          }
          setShowForm(false);
          setEditingEvent(null);
        }}
        onCancel={() => {
          setShowForm(false);
          setEditingEvent(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Eventos</h2>
          <p className="text-gray-600">Gerencie eventos turísticos e culturais</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            Calendário
          </Button>
          <Button onClick={handleAddEvent} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Título, descrição ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Público Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {events.reduce((sum, e) => sum + e.expectedAudience, 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Orçamento Total</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(events.reduce((sum, e) => sum + e.budget, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Eventos */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                {event.images.length > 0 ? (
                  <img
                    src={event.images[0]}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Badge className={getStatusColor(event.status)}>
                    {statuses.find(s => s.value === event.status)?.label}
                  </Badge>
                  {event.isPublic && (
                    <Badge className="bg-blue-100 text-blue-800">
                      Público
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500">{getCategoryIcon(event.category)}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.date)}</span>
                    {event.endDate && (
                      <span> - {formatDate(event.endDate)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.expectedAudience.toLocaleString()} pessoas</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{formatCurrency(event.budget)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={() => handleEditEvent(event)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex space-x-1">
                    {event.status === 'planned' && (
                      <Button
                        size="sm"
                        onClick={() => handleToggleStatus(event.id, 'active')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Ativar
                      </Button>
                    )}
                    {event.status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => handleToggleStatus(event.id, 'completed')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vista de Calendário */}
      {viewMode === 'calendar' && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vista de Calendário</h3>
              <p className="text-gray-600 mb-4">
                Vista de calendário será implementada em breve
              </p>
              <Button onClick={() => setViewMode('list')}>
                Voltar para Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando o primeiro evento'
              }
            </p>
            <Button onClick={handleAddEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Evento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Componente de formulário para adicionar/editar eventos
const EventForm: React.FC<{
  event: TourismEvent | null;
  onSave: (event: TourismEvent) => void;
  onCancel: () => void;
}> = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState<TourismEvent>({
    id: event?.id || '',
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || new Date(),
    endDate: event?.endDate,
    location: event?.location || '',
    category: event?.category || 'cultural',
    expectedAudience: event?.expectedAudience || 0,
    budget: event?.budget || 0,
    status: event?.status || 'planned',
    images: event?.images || [],
    contact: event?.contact || {},
    features: event?.features || [],
    isPublic: event?.isPublic ?? true,
    createdBy: 'Secretaria de Turismo',
    lastUpdated: new Date()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {event ? 'Editar Evento' : 'Novo Evento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título do Evento</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="cultural">🎭 Cultural</option>
                <option value="gastronomic">🍽️ Gastronômico</option>
                <option value="sports">⚽ Esportivo</option>
                <option value="religious">⛪ Religioso</option>
                <option value="entertainment">🎪 Entretenimento</option>
                <option value="business">💼 Negócios</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data de Início</Label>
              <Input
                id="date"
                type="date"
                value={formData.date.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data de Fim (opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  endDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expectedAudience">Público Esperado</Label>
              <Input
                id="expectedAudience"
                type="number"
                value={formData.expectedAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedAudience: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {event ? 'Atualizar' : 'Criar'} Evento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventManagementSystem;


