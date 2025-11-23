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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Upload,
  Image,
  Star,
  Heart,
  AlertCircle,
  CheckCircle,
  Filter,
  Search,
  Globe,
  FileText
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { eventService, TourismEvent as ServiceEvent } from '@/services/public/eventService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { googleSearchEventService } from '@/services/events/GoogleSearchEventService';
import { intelligentEventService } from '@/services/events/IntelligentEventService';
import { eventValidationService } from '@/services/public/eventValidationService';
import { eventPredictiveAnalyticsService } from '@/services/public/eventPredictiveAnalytics';
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import EventAnalytics from '@/components/secretary/EventAnalytics';

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
  approval_status?: 'pending' | 'approved' | 'rejected';
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
  const { toast } = useToast();
  const [events, setEvents] = useState<TourismEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TourismEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TourismEvent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(false);
  const [userState, setUserState] = useState<string | null>(null);
  const [isMSUser, setIsMSUser] = useState(false);
  const [sendToPublicCalendar, setSendToPublicCalendar] = useState(true);
  const [autoClassifying, setAutoClassifying] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    conflicts?: any;
    duplicates?: any;
    completeness?: any;
    audiencePrediction?: any;
    optimalDates?: any[];
  }>({});

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

  // Verificar se usuário é do MS
  useEffect(() => {
    const checkUserState = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('state')
          .eq('user_id', user.id)
          .maybeSingle();
        
        const state = profile?.state?.toUpperCase() || null;
        setUserState(state);
        setIsMSUser(state === 'MS' || state === 'MATO GROSSO DO SUL');
      } catch (error) {
        console.error('Erro ao verificar estado do usuário:', error);
      }
    };
    
    checkUserState();
  }, [user]);

  // Carregar eventos do Supabase
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Se for usuário do MS, mostrar todos os eventos (incluindo pendentes)
      // Se não for, mostrar apenas aprovados
      const filters: any = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        is_public: true,
      };
      
      // Se não for usuário do MS, mostrar apenas eventos aprovados
      if (!isMSUser) {
        filters.approval_status = 'approved';
      } else if (selectedApprovalStatus !== 'all') {
        filters.approval_status = selectedApprovalStatus;
      }
      
      const data = await eventService.getEvents(filters);

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
        approval_status: item.approval_status,
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
  }, [searchTerm, selectedCategory, selectedStatus, selectedApprovalStatus, isMSUser]);

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
        toast({
          title: 'Sucesso',
          description: 'Evento excluído com sucesso!',
        });
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao excluir evento. Tente novamente.',
          variant: 'destructive',
        });
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
      toast({
        title: 'Sucesso',
        description: 'Status do evento atualizado!',
      });
    } catch (error) {
      console.error('Erro ao alterar status do evento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status. Tente novamente.',
        variant: 'destructive',
      });
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
        approval_status: editingEvent 
          ? eventData.approval_status || editingEvent.approval_status
          : (sendToPublicCalendar ? 'approved' : 'pending'), // Se enviar para público, aprovar automaticamente
        source: 'public', // Eventos da secretaria são sempre 'public'
        images: eventData.images || [],
        contact_phone: eventData.contact?.phone,
        contact_email: eventData.contact?.email,
        contact_website: eventData.contact?.website,
        features: eventData.features || [],
        is_public: sendToPublicCalendar, // Se enviar para calendário público, marcar como público
        created_by: user?.id,
        submitted_by: user?.id,
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, serviceData);
      } else {
        await eventService.createEvent(serviceData);
      }

      await loadEvents();
      setShowForm(false);
      setEditingEvent(null);
      
      // Mostrar mensagem se evento foi criado como pendente
      if (!editingEvent && isMSUser) {
        toast({
          title: 'Evento criado com sucesso!',
          description: 'O evento será enviado para análise e aparecerá no calendário do Descubra Mato Grosso do Sul após aprovação.',
        });
      } else if (!editingEvent) {
        toast({
          title: 'Sucesso',
          description: 'Evento criado com sucesso!',
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Evento atualizado com sucesso!',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar evento. Tente novamente.',
        variant: 'destructive',
      });
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

  const getApprovalStatusColor = (approvalStatus?: string) => {
    switch (approvalStatus) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getApprovalStatusLabel = (approvalStatus?: string) => {
    switch (approvalStatus) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Aguardando Aprovação';
      case 'rejected': return 'Rejeitado';
      default: return 'N/A';
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
          toast({
            title: 'Arquivo inválido',
            description: `Arquivo ${file.name} não é uma imagem válida.`,
            variant: 'destructive',
          });
          continue;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'Arquivo muito grande',
            description: `Imagem ${file.name} excede o tamanho máximo de 5MB.`,
            variant: 'destructive',
          });
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
            toast({
              title: 'Erro no upload',
              description: `Erro ao fazer upload de ${file.name}: ${uploadError.message}`,
              variant: 'destructive',
            });
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
          toast({
            title: 'Erro',
            description: `Erro ao processar ${file.name}`,
            variant: 'destructive',
          });
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
          toast({
            title: 'Sucesso',
            description: `${uploadedUrls.length} imagem(ns) carregada(s) com sucesso!`,
          });
        }
      }
      
    } catch (error) {
      console.error('Erro no upload de imagens:', error);
      toast({
        title: 'Erro',
        description: 'Erro no upload de imagens. Tente novamente.',
        variant: 'destructive',
      });
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
          setSendToPublicCalendar(true);
        }}
        sendToPublicCalendar={sendToPublicCalendar}
        onSendToPublicCalendarChange={setSendToPublicCalendar}
      />
    );
  }

  return (
    <SectionWrapper
      variant="default"
      title="Gestão de Eventos"
      subtitle="Gerencie eventos turísticos e culturais"
    >
      <Tabs defaultValue="calendario" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Aba Calendário */}
        <TabsContent value="calendario" className="space-y-6 mt-6">
          <div className="flex justify-end gap-2 mb-4">
            <Button
              type="button"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Lista clicado');
                setViewMode('list');
              }}
            >
              Lista
            </Button>
            <Button
              type="button"
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Calendário clicado');
                setViewMode('calendar');
              }}
            >
              Calendário
            </Button>
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Novo Evento clicado');
                handleAddEvent();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>

        {/* Filtros */}
        <CardBox className="mb-6">
          <div className={`grid grid-cols-1 md:grid-cols-4 ${isMSUser ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
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
            {isMSUser && (
              <div>
                <Label htmlFor="approvalStatus">Aprovação</Label>
                <Select value={selectedApprovalStatus} onValueChange={setSelectedApprovalStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Aguardando</SelectItem>
                    <SelectItem value="approved">Aprovados</SelectItem>
                    <SelectItem value="rejected">Rejeitados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-end">
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Botão Mais Filtros clicado');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardBox>


        {/* Lista de Eventos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardBox key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardBox>
            ))}
          </div>
        ) : viewMode === 'list' && (
          filteredEvents.length === 0 ? (
            <CardBox>
              <div className="text-center py-12">
                <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-1">Nenhum evento encontrado</p>
                <p className="text-sm text-slate-500 mb-4">
                  {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando o primeiro evento'
                  }
                </p>
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão Criar Evento clicado');
                    handleAddEvent();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Evento
                </Button>
              </div>
            </CardBox>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <CardBox key={event.id} className="hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate mb-1">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{getCategoryIcon(event.category)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`rounded-full text-xs px-2 py-0.5 ${getStatusColor(event.status)}`}>
                        {statuses.find(s => s.value === event.status)?.label}
                      </Badge>
                      {isMSUser && event.approval_status && (
                        <Badge className={`rounded-full text-xs px-2 py-0.5 border ${getApprovalStatusColor(event.approval_status)}`}>
                          {getApprovalStatusLabel(event.approval_status)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{event.description}</p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Botão Ver evento clicado', event.id);
                        }}
                        className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Botão Editar evento clicado', event.id);
                          handleEditEvent(event);
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Botão Excluir evento clicado', event.id);
                          handleDeleteEvent(event.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Botão Voltar para Lista clicado');
                  setViewMode('list');
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Voltar para Lista
              </Button>
            </div>
          </CardBox>
        )}
        </TabsContent>

        {/* Aba Analytics */}
        <TabsContent value="analytics" className="mt-6">
          <EventAnalytics />
        </TabsContent>
      </Tabs>
    </SectionWrapper>
  );
};

// Componente de formulário para adicionar/editar eventos
const EventForm: React.FC<{
  event: TourismEvent | null;
  onSave: (event: Partial<TourismEvent>) => void;
  onCancel: () => void;
  sendToPublicCalendar?: boolean;
  onSendToPublicCalendarChange?: (value: boolean) => void;
}> = ({ event, onSave, onCancel, sendToPublicCalendar = true, onSendToPublicCalendarChange }) => {
  const { toast } = useToast();
  const [suggestedEvents, setSuggestedEvents] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoClassifying, setAutoClassifying] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    conflicts?: any;
    duplicates?: any;
    completeness?: any;
    audiencePrediction?: any;
    optimalDates?: any[];
  }>({});
  
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

  // Buscar sugestões quando localização ou data mudarem
  useEffect(() => {
    if (!event && formData.location && formData.date) {
      const timer = setTimeout(() => {
        fetchEventSuggestions();
      }, 1000); // Debounce de 1 segundo
      return () => clearTimeout(timer);
    }
  }, [formData.location, formData.date]);

  const fetchEventSuggestions = async () => {
    if (!formData.location) return;
    
    setLoadingSuggestions(true);
    try {
      const dateStr = formData.date.toISOString().split('T')[0];
      const result = await googleSearchEventService.suggestEventsForRegistration(
        formData.location,
        dateStr
      );

      if (result.success && result.eventos.length > 0) {
        setSuggestedEvents(result.eventos);
        setShowSuggestions(true);
        toast({
          title: 'Sugestões encontradas',
          description: `Encontramos ${result.eventos.length} eventos similares na web.`,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleUseSuggestion = (suggestedEvent: any) => {
    setFormData({
      ...formData,
      title: suggestedEvent.titulo || formData.title,
      description: suggestedEvent.descricao_completa || formData.description,
      location: suggestedEvent.local || formData.location,
      category: (suggestedEvent.categoria || formData.category) as any,
    });
    setShowSuggestions(false);
    toast({
      title: 'Sugestão aplicada',
      description: 'Os dados do evento sugerido foram preenchidos. Revise e ajuste se necessário.',
    });
  };

  // Classificar categoria automaticamente
  const handleAutoClassify = async () => {
    if (!formData.title) {
      toast({
        title: 'Título necessário',
        description: 'Preencha o título para classificar automaticamente.',
        variant: 'destructive',
      });
      return;
    }

    setAutoClassifying(true);
    try {
      const classification = await intelligentEventService.classifyEventCategory(
        formData.title,
        formData.description
      );
      
      setFormData(prev => ({
        ...prev,
        category: classification.category as any,
      }));

      toast({
        title: 'Categoria classificada!',
        description: `Categoria sugerida: ${classification.category} (Confiança: ${Math.round(classification.confidence * 100)}%)`,
      });
    } catch (error) {
      console.error('Erro ao classificar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível classificar automaticamente.',
        variant: 'destructive',
      });
    } finally {
      setAutoClassifying(false);
    }
  };

  // Verificar conflitos
  const handleCheckConflicts = async () => {
    if (!formData.date || !formData.location) {
      toast({
        title: 'Dados necessários',
        description: 'Preencha data e local para verificar conflitos.',
        variant: 'destructive',
      });
      return;
    }

    setValidating(true);
    try {
      const conflicts = await eventValidationService.checkConflicts({
        id: formData.id,
        data_inicio: formData.date.toISOString(),
        data_fim: formData.endDate?.toISOString(),
        local: formData.location,
      });

      setValidationResults(prev => ({ ...prev, conflicts }));

      if (conflicts.hasConflicts) {
        toast({
          title: 'Conflitos encontrados!',
          description: `${conflicts.conflicts.length} evento(s) conflitante(s) encontrado(s).`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Nenhum conflito',
          description: 'Não há conflitos de data/hora no mesmo local.',
        });
      }
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
    } finally {
      setValidating(false);
    }
  };

  // Prever público
  const handlePredictAudience = async () => {
    if (!formData.title) {
      toast({
        title: 'Título necessário',
        description: 'Preencha o título para prever público.',
        variant: 'destructive',
      });
      return;
    }

    setValidating(true);
    try {
      const prediction = await eventPredictiveAnalyticsService.predictAudience({
        titulo: formData.title,
        descricao: formData.description,
        categoria: formData.category,
        local: formData.location,
      });

      setValidationResults(prev => ({ ...prev, audiencePrediction: prediction }));
      setFormData(prev => ({
        ...prev,
        expectedAudience: prediction.expectedAudience,
      }));

      toast({
        title: 'Previsão de público gerada!',
        description: `Público esperado: ${prediction.expectedAudience} pessoas (Confiança: ${Math.round(prediction.confidence * 100)}%)`,
      });
    } catch (error) {
      console.error('Erro ao prever público:', error);
    } finally {
      setValidating(false);
    }
  };

  // Sugerir datas ideais
  const handleSuggestOptimalDates = async () => {
    if (!formData.location) {
      toast({
        title: 'Local necessário',
        description: 'Preencha o local para sugerir datas ideais.',
        variant: 'destructive',
      });
      return;
    }

    setValidating(true);
    try {
      const dates = await eventPredictiveAnalyticsService.suggestOptimalDates(
        formData.category,
        formData.location
      );

      setValidationResults(prev => ({ ...prev, optimalDates: dates }));

      if (dates.length > 0) {
        toast({
          title: 'Datas ideais sugeridas!',
          description: `${dates.length} data(s) sugerida(s) com base em histórico.`,
        });
      }
    } catch (error) {
      console.error('Erro ao sugerir datas:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Atualizar isPublic baseado no checkbox
    const eventData = {
      ...formData,
      isPublic: sendToPublicCalendar,
    };
    onSave(eventData);
  };

  return (
    <SectionWrapper
      variant="default"
      title={event ? 'Editar Evento' : 'Novo Evento'}
      subtitle={event ? 'Atualize as informações do evento' : 'Preencha os dados do novo evento turístico'}
    >
      <CardBox className="max-w-4xl mx-auto shadow-lg bg-gradient-to-br from-white to-blue-50/30">
        {/* Sugestões de Eventos */}
        {!event && showSuggestions && suggestedEvents.length > 0 && (
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-900">Sugestões de Eventos Encontradas</h3>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {suggestedEvents.slice(0, 5).map((suggested, index) => (
                <div
                  key={index}
                  className="p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleUseSuggestion(suggested)}
                >
                  <div className="font-medium text-sm">{suggested.titulo}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {suggested.local} • {suggested.data_inicio ? new Date(suggested.data_inicio).toLocaleDateString('pt-BR') : ''}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Clique para usar esta sugestão</div>
                </div>
              ))}
            </div>
            {loadingSuggestions && (
              <div className="text-sm text-gray-600 mt-2">Buscando mais sugestões...</div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Botão de Preenchimento Automático */}
          {!event && (
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Preenchimento Automático com IA
                  </h4>
                  <p className="text-sm text-slate-600">
                    Preencha o título e local, depois clique no botão para preencher automaticamente os demais campos.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={async () => {
                    if (!formData.title || !formData.location) {
                      toast({
                        title: 'Campos necessários',
                        description: 'Preencha o título e local para usar o preenchimento automático.',
                        variant: 'destructive',
                      });
                      return;
                    }

                    setAutoFilling(true);
                    try {
                      const autoFilled = await intelligentEventService.autoFillEventData(
                        formData.title,
                        formData.location
                      );

                      setFormData(prev => ({
                        ...prev,
                        ...(autoFilled.titulo && { title: autoFilled.titulo }),
                        ...(autoFilled.descricao && { description: autoFilled.descricao }),
                        ...(autoFilled.categoria && { category: autoFilled.categoria as any }),
                        ...(autoFilled.expected_audience && { expectedAudience: autoFilled.expected_audience }),
                        ...(autoFilled.budget && { budget: autoFilled.budget }),
                        ...(autoFilled.contact_phone && { contactPhone: autoFilled.contact_phone }),
                        ...(autoFilled.contact_email && { contactEmail: autoFilled.contact_email }),
                        ...(autoFilled.contact_website && { contactWebsite: autoFilled.contact_website }),
                        ...(autoFilled.features && { features: autoFilled.features }),
                      }));

                      toast({
                        title: 'Preenchimento concluído!',
                        description: 'Os campos foram preenchidos automaticamente. Revise e ajuste se necessário.',
                      });
                    } catch (error) {
                      console.error('Erro ao preencher automaticamente:', error);
                      toast({
                        title: 'Erro',
                        description: 'Não foi possível preencher automaticamente.',
                        variant: 'destructive',
                      });
                    } finally {
                      setAutoFilling(false);
                    }
                  }}
                  disabled={autoFilling || !formData.title || !formData.location}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {autoFilling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Preenchendo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Preencher Automaticamente
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Título do Evento *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Festival de Inverno de Bonito"
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  Categoria *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoClassify}
                  disabled={autoClassifying || !formData.title}
                  className="h-8 text-xs"
                >
                  {autoClassifying ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Classificar com IA
                </Button>
              </div>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cultural">🎭 Cultural</SelectItem>
                  <SelectItem value="gastronomic">🍽️ Gastronômico</SelectItem>
                  <SelectItem value="sports">⚽ Esportivo</SelectItem>
                  <SelectItem value="religious">⛪ Religioso</SelectItem>
                  <SelectItem value="entertainment">🎪 Entretenimento</SelectItem>
                  <SelectItem value="business">💼 Negócios</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Descrição *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Descreva o evento, atrações, programação..."
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="date" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Data de Início *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestOptimalDates}
                  disabled={validating || !formData.location}
                  className="h-8 text-xs"
                >
                  {validating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CalendarIcon className="h-3 w-3 mr-1" />}
                  Sugerir Datas
                </Button>
              </div>
              <Input
                id="date"
                type="date"
                value={formData.date.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {validationResults.optimalDates && validationResults.optimalDates.length > 0 && (
                <div className="text-xs text-slate-600 mt-2">
                  <p className="font-semibold mb-1">Datas ideais sugeridas:</p>
                  <ul className="space-y-1">
                    {validationResults.optimalDates.slice(0, 3).map((optDate, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{new Date(optDate.date).toLocaleDateString('pt-BR')}</span>
                        <Badge variant="outline" className="text-xs">
                          Score: {optDate.score}%
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Data de Fim (opcional)
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  endDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="location" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Local *
                {validationResults.conflicts?.hasConflicts && (
                  <Badge className="ml-2 text-xs bg-red-100 text-red-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Conflitos
                  </Badge>
                )}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCheckConflicts}
                disabled={validating || !formData.date || !formData.location}
                className="h-8 text-xs"
              >
                {validating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                Verificar Conflitos
              </Button>
            </div>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, location: e.target.value }));
                setValidationResults(prev => ({ ...prev, conflicts: undefined }));
              }}
              placeholder="Ex: Centro de Convenções de Bonito"
              className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            {validationResults.conflicts?.hasConflicts && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
                <p className="font-semibold text-red-800 mb-2">Conflitos encontrados:</p>
                <ul className="space-y-1 text-red-700">
                  {validationResults.conflicts.conflicts.map((conflict: any) => (
                    <li key={conflict.eventId}>
                      • <strong>{conflict.eventName}</strong> - {conflict.conflictReason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="expectedAudience" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Público Esperado *
                  {validationResults.audiencePrediction && (
                    <Badge className="ml-2 text-xs bg-purple-100 text-purple-700">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Previsto
                    </Badge>
                  )}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePredictAudience}
                  disabled={validating || !formData.title}
                  className="h-8 text-xs"
                >
                  {validating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                  Prever Público
                </Button>
              </div>
              <Input
                id="expectedAudience"
                type="number"
                value={formData.expectedAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedAudience: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Orçamento (R$) *
              </Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Opção de enviar para calendário público */}
          <div className="flex items-start space-x-3 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
            <Checkbox
              id="sendToPublicCalendar"
              checked={sendToPublicCalendar}
              onCheckedChange={(checked) => {
                if (onSendToPublicCalendarChange) {
                  onSendToPublicCalendarChange(checked as boolean);
                }
              }}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="sendToPublicCalendar"
                className="text-sm font-semibold text-slate-800 cursor-pointer flex items-center gap-2 mb-1"
              >
                <Globe className="h-4 w-4 text-blue-600" />
                Enviar para calendário público
              </Label>
              <p className="text-xs text-slate-600 ml-6">
                O evento aparecerá no calendário público do Descubra Mato Grosso do Sul após aprovação
              </p>
            </div>
          </div>

          {/* Resultados de Previsão de Público */}
          {validationResults.audiencePrediction && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-purple-800 mb-2">
                    Previsão de Público: {validationResults.audiencePrediction.expectedAudience} pessoas
                  </p>
                  <p className="text-sm text-purple-700 mb-2">
                    Confiança: {Math.round(validationResults.audiencePrediction.confidence * 100)}%
                  </p>
                  {validationResults.audiencePrediction.factors.length > 0 && (
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Fatores considerados:</p>
                      <ul className="list-disc list-inside text-purple-600">
                        {validationResults.audiencePrediction.factors.map((factor: string, i: number) => (
                          <li key={i}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Cancelar formulário evento clicado');
                onCancel();
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Salvar evento clicado');
                handleSubmit(e);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {event ? 'Atualizar' : 'Criar'} Evento
            </Button>
          </div>
        </form>
      </CardBox>
    </SectionWrapper>
  );
};

export default EventManagementSystem;


