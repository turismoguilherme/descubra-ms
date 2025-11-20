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
import { useToast } from '@/hooks/use-toast';

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
          : (isMSUser ? 'pending' : 'approved'), // Novos eventos do MS começam como 'pending'
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
      }
    >

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
    e.stopPropagation();
    onSave(formData);
  };

  return (
    <SectionWrapper
      variant="default"
      title={event ? 'Editar Evento' : 'Novo Evento'}
      subtitle={event ? 'Atualize as informações do evento' : 'Preencha os dados do novo evento turístico'}
    >
      <CardBox className="max-w-4xl mx-auto">
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


