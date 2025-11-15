/**
 * Sistema de Gestão de Eventos
 * Calendário funcional para secretarias de turismo
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
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
import { eventService, TourismEvent as ServiceEvent } from '@/services/public/eventService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

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
  const { user } = useAuth();
  const [events, setEvents] = useState<TourismEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TourismEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TourismEvent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(false);

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

  // Carregar eventos do Supabase
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getEvents({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        is_public: true,
      });

      // Converter para formato do componente
      const convertedEvents: TourismEvent[] = data.map((item) => ({
        id: item.id,
        title: item.title || item.name || '',
        description: item.description || '',
        date: item.date ? new Date(item.date) : (item.start_date ? new Date(item.start_date) : new Date()),
        endDate: item.end_date ? new Date(item.end_date) : undefined,
        location: item.location || '',
        category: (item.category || 'cultural') as any,
        expectedAudience: item.expected_audience || 0,
        budget: item.budget || 0,
        status: (item.status || 'planned') as any,
        images: item.images || [],
        contact: {
          phone: item.contact_phone,
          email: item.contact_email,
          website: item.contact_website,
        },
        features: item.features || [],
        isPublic: item.is_public !== undefined ? item.is_public : (item.is_visible !== undefined ? item.is_visible : true),
        createdBy: item.created_by || 'system',
        lastUpdated: item.updated_at ? new Date(item.updated_at) : new Date(),
      }));

      setEvents(convertedEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      // Fallback para lista vazia em caso de erro
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Recarregar quando filtros mudarem
  useEffect(() => {
    loadEvents();
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Filtrar eventos localmente (já vem filtrado do servidor, mas manter para compatibilidade)
  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event: TourismEvent) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      setLoading(true);
      try {
        await eventService.deleteEvent(id);
        await loadEvents();
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
        alert('Erro ao excluir evento. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    setLoading(true);
    try {
      // A tabela events não tem campo status, então vamos apenas atualizar is_visible
      await eventService.updateEvent(id, {
        status: newStatus as any,
      });
      await loadEvents();
    } catch (error) {
      console.error('Erro ao alterar status do evento:', error);
      alert('Erro ao alterar status. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async (eventData: Partial<TourismEvent>) => {
    setLoading(true);
    try {
      // Converter para formato do serviço
      const serviceData: any = {
        title: eventData.title || '',
        name: eventData.title || '',
        description: eventData.description || '',
        location: eventData.location || '',
        date: eventData.date ? eventData.date.toISOString() : new Date().toISOString(),
        start_date: eventData.date ? eventData.date.toISOString() : new Date().toISOString(),
        end_date: eventData.endDate ? eventData.endDate.toISOString() : undefined,
        category: eventData.category,
        expected_audience: eventData.expectedAudience,
        budget: eventData.budget,
        status: eventData.status || 'planned',
        images: eventData.images || [],
        contact_phone: eventData.contact?.phone,
        contact_email: eventData.contact?.email,
        contact_website: eventData.contact?.website,
        features: eventData.features || [],
        is_public: eventData.isPublic !== undefined ? eventData.isPublic : true,
        created_by: user?.id,
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, serviceData);
      } else {
        await eventService.createEvent(serviceData);
      }

      await loadEvents();
      setShowForm(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
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

  // Função para upload de imagens para Supabase Storage
  const handleImageUpload = async (files: FileList, eventId: string) => {
    setLoading(true);
    
    try {
      const BUCKET_NAME = 'event-images';
      const uploadedUrls: string[] = [];

      // Upload de cada arquivo
      for (const file of Array.from(files)) {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          alert(`Arquivo ${file.name} não é uma imagem válida.`);
          continue;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`Imagem ${file.name} excede o tamanho máximo de 5MB.`);
          continue;
        }

        try {
          // Gerar nome único para o arquivo
          const fileExt = file.name.split('.').pop();
          const fileName = `${eventId}/${uuidv4()}.${fileExt}`;

          // Upload para Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Erro no upload:', uploadError);
            alert(`Erro ao fazer upload de ${file.name}: ${uploadError.message}`);
            continue;
          }

          // Obter URL pública da imagem
          const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            uploadedUrls.push(publicUrlData.publicUrl);
          }
        } catch (fileError) {
          console.error(`Erro ao processar ${file.name}:`, fileError);
          alert(`Erro ao processar ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        // Atualizar evento com novas imagens no banco de dados
        const event = events.find(evt => evt.id === eventId);
        if (event) {
          const updatedImages = [...(event.images || []), ...uploadedUrls];
          
          // Atualizar no banco de dados
          await eventService.updateEvent(eventId, {
            images: updatedImages,
            image_url: updatedImages[0] // Primeira imagem como principal
          });

          // Recarregar eventos
          await loadEvents();
          alert(`${uploadedUrls.length} imagem(ns) carregada(s) com sucesso!`);
        }
      }
      
    } catch (error) {
      console.error('Erro no upload de imagens:', error);
      alert('Erro no upload de imagens. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <EventForm
        event={editingEvent}
        onSave={handleSaveEvent}
        onCancel={() => {
          setShowForm(false);
          setEditingEvent(null);
        }}
      />
    );
  }

  return (
    <SectionWrapper
      variant="default"
      title="Gestão de Eventos"
      subtitle="Gerencie eventos turísticos e culturais"
      actions={
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
          <Button onClick={handleAddEvent} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      }
    >

        {/* Filtros */}
        <CardBox className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardBox>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total de Eventos</p>
                <p className="text-3xl font-bold text-slate-800">{events.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardBox>
          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Ativos</p>
                <p className="text-3xl font-bold text-green-600">
                  {events.filter(e => e.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardBox>
          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Público Total</p>
                <p className="text-3xl font-bold text-purple-600">
                  {events.reduce((sum, e) => sum + e.expectedAudience, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardBox>
          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Orçamento Total</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatCurrency(events.reduce((sum, e) => sum + e.budget, 0))}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardBox>
        </div>

        {/* Lista de Eventos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardBox key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-md mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardBox>
            ))}
          </div>
        ) : viewMode === 'list' && (
          filteredEvents.length === 0 ? (
            <CardBox>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-slate-600 font-medium mb-2">Nenhum evento encontrado</p>
                <p className="text-sm text-slate-500 mb-4">
                  {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando o primeiro evento'
                  }
                </p>
                <Button onClick={handleAddEvent} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Evento
                </Button>
              </div>
            </CardBox>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <CardBox key={event.id}>
                  {/* Cabeçalho com título e badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">{event.title}</h3>
                      <span className="text-sm text-gray-500">{getCategoryIcon(event.category)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`rounded-full text-xs font-medium px-2 py-1 ${getStatusColor(event.status)}`}>
                        {statuses.find(s => s.value === event.status)?.label}
                      </span>
                      {event.isPublic && (
                        <span className="rounded-full text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700">
                          Público
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Imagem */}
                  <div className="h-32 bg-gray-200 rounded-md mb-3 relative overflow-hidden">
                    {event.images.length > 0 ? (
                      <img
                        src={event.images[0]}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Metadados */}
                  <div className="space-y-1 mb-4">
                    <p className="text-slate-600 text-sm line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(event.date)}</span>
                      {event.endDate && (
                        <span> - {formatDate(event.endDate)}</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{event.expectedAudience.toLocaleString()} pessoas</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{formatCurrency(event.budget)}</span>
                    </div>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardBox>
              ))}
            </div>
          )
        )}

        {/* Vista de Calendário */}
        {viewMode === 'calendar' && (
          <CardBox>
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-800">Vista de Calendário</h3>
              <p className="text-slate-600 mb-4">
                Vista de calendário será implementada em breve
              </p>
              <Button onClick={() => setViewMode('list')} className="bg-blue-600 hover:bg-blue-700">
                Voltar para Lista
              </Button>
            </div>
          </CardBox>
        )}
    </SectionWrapper>
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


