/**
 * Gerenciador de Inventário Turístico
 * CRUD de atrativos, serviços e pontos de interesse
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Edit, 
  Trash2, 
  Eye, 
  Upload,
  Camera,
  Globe,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Users,
  Heart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import FileUpload from '@/components/ui/FileUpload';
import { inventoryService, TourismAttraction as InventoryAttraction } from '@/services/public/inventoryService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface TourismAttraction {
  id: string;
  name: string;
  description: string;
  category: 'natural' | 'cultural' | 'gastronomic' | 'adventure' | 'religious' | 'entertainment';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  rating: number;
  priceRange: 'free' | 'low' | 'medium' | 'high';
  openingHours: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  features: string[];
  isActive: boolean;
  verified: boolean;
  lastUpdated: Date;
  createdBy: string;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  address?: string;
  coordinates?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

const TourismInventoryManager: React.FC = () => {
  const { user } = useAuth();
  const [attractions, setAttractions] = useState<TourismAttraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<TourismAttraction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<TourismAttraction | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: Date;
  }>>([]);

  const categories = [
    { value: 'all', label: 'Todos', icon: '🏛️' },
    { value: 'natural', label: 'Natural', icon: '🌿' },
    { value: 'cultural', label: 'Cultural', icon: '🏛️' },
    { value: 'gastronomic', label: 'Gastronômico', icon: '🍽️' },
    { value: 'adventure', label: 'Aventura', icon: '🏔️' },
    { value: 'religious', label: 'Religioso', icon: '⛪' },
    { value: 'entertainment', label: 'Entretenimento', icon: '🎭' }
  ];

  const priceRanges = {
    free: 'Gratuito',
    low: 'R$ 0-20',
    medium: 'R$ 20-50',
    high: 'R$ 50+'
  };

  // Funções de validação
  const validateAttraction = (attraction: Partial<TourismAttraction>): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Validação do nome
    if (!attraction.name || attraction.name.trim().length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    // Validação da descrição
    if (!attraction.description || attraction.description.trim().length < 10) {
      errors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    // Validação do endereço
    if (!attraction.address || attraction.address.trim().length < 5) {
      errors.address = 'Endereço deve ter pelo menos 5 caracteres';
    }

    // Validação das coordenadas
    if (!attraction.coordinates || 
        !attraction.coordinates.lat || 
        !attraction.coordinates.lng ||
        attraction.coordinates.lat < -90 || 
        attraction.coordinates.lat > 90 ||
        attraction.coordinates.lng < -180 || 
        attraction.coordinates.lng > 180) {
      errors.coordinates = 'Coordenadas inválidas';
    }

    // Validação do contato
    if (attraction.contact) {
      const contactErrors: any = {};
      
      if (attraction.contact.phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(attraction.contact.phone)) {
        contactErrors.phone = 'Formato de telefone inválido';
      }
      
      if (attraction.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attraction.contact.email)) {
        contactErrors.email = 'Formato de email inválido';
      }
      
      if (attraction.contact.website && !/^https?:\/\/.+/.test(attraction.contact.website)) {
        contactErrors.website = 'Website deve começar com http:// ou https://';
      }
      
      if (Object.keys(contactErrors).length > 0) {
        errors.contact = contactErrors;
      }
    }

    return errors;
  };

  const handleSaveAttraction = async (attractionData: Partial<TourismAttraction>) => {
    setLoading(true);
    
    try {
      // Validar dados
      const errors = validateAttraction(attractionData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Converter para formato do serviço
      const serviceData: any = {
        name: attractionData.name || '',
        description: attractionData.description || '',
        address: attractionData.address || '',
        latitude: attractionData.coordinates?.lat,
        longitude: attractionData.coordinates?.lng,
        phone: attractionData.contact?.phone,
        email: attractionData.contact?.email,
        website: attractionData.contact?.website,
        price_range: attractionData.priceRange,
        opening_hours: attractionData.openingHours,
        amenities: attractionData.features || [],
        images: attractionData.images || [],
        is_active: attractionData.isActive !== undefined ? attractionData.isActive : true,
        status: attractionData.verified ? 'approved' : 'draft',
        created_by: user?.id,
      };

      let savedAttraction: InventoryAttraction;
      
      if (editingAttraction) {
        // Atualizar atração existente
        savedAttraction = await inventoryService.updateAttraction(editingAttraction.id, serviceData);
        addNotification('success', 'Atração atualizada com sucesso!');
      } else {
        // Criar nova atração
        savedAttraction = await inventoryService.createAttraction(serviceData);
        addNotification('success', 'Nova atração criada com sucesso!');
      }

      // Recarregar lista
      await loadAttractions();

      setShowForm(false);
      setEditingAttraction(null);
      setValidationErrors({});
      
    } catch (error) {
      console.error('Erro ao salvar atração:', error);
      addNotification('error', 'Erro ao salvar atração. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para upload de imagens para Supabase Storage
  const handleImageUpload = async (files: FileList, attractionId: string) => {
    setLoading(true);
    
    try {
      const BUCKET_NAME = 'tourism-images';
      const uploadedUrls: string[] = [];

      // Upload de cada arquivo
      for (const file of Array.from(files)) {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          addNotification('warning', `Arquivo ${file.name} não é uma imagem válida.`);
          continue;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          addNotification('warning', `Imagem ${file.name} excede o tamanho máximo de 5MB.`);
          continue;
        }

        try {
          // Gerar nome único para o arquivo
          const fileExt = file.name.split('.').pop();
          const fileName = `${attractionId}/${uuidv4()}.${fileExt}`;

          // Upload para Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Erro no upload:', uploadError);
            addNotification('error', `Erro ao fazer upload de ${file.name}: ${uploadError.message}`);
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
          addNotification('error', `Erro ao processar ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        // Atualizar atração com novas imagens no banco de dados
        const attraction = attractions.find(attr => attr.id === attractionId);
        if (attraction) {
          const updatedImages = [...(attraction.images || []), ...uploadedUrls];
          
          // Atualizar no banco de dados
          await inventoryService.updateAttraction(attractionId, {
            images: updatedImages
          });

          // Atualizar estado local
      setAttractions(prev => prev.map(attr => 
        attr.id === attractionId 
              ? { ...attr, images: updatedImages }
          : attr
      ));
      
      addNotification('success', `${uploadedUrls.length} imagem(ns) carregada(s) com sucesso!`);
        }
      }
      
    } catch (error) {
      console.error('Erro no upload de imagens:', error);
      addNotification('error', 'Erro no upload de imagens. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para remover imagem
  const handleRemoveImage = (attractionId: string, imageIndex: number) => {
    setAttractions(prev => prev.map(attr => 
      attr.id === attractionId 
        ? { ...attr, images: attr.images.filter((_, index) => index !== imageIndex) }
        : attr
    ));
  };

  // Sistema de notificações
  const addNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Workflow de aprovação
  const handleApproveAttraction = async (attractionId: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAttractions(prev => prev.map(attr => 
        attr.id === attractionId 
          ? { ...attr, verified: true, isActive: true }
          : attr
      ));
      
      addNotification('success', 'Atração aprovada e ativada com sucesso!');
      
    } catch (error) {
      addNotification('error', 'Erro ao aprovar atração.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAttraction = async (attractionId: string, reason: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAttractions(prev => prev.map(attr => 
        attr.id === attractionId 
          ? { ...attr, verified: false, isActive: false }
          : attr
      ));
      
      addNotification('warning', `Atração rejeitada: ${reason}`);
      
    } catch (error) {
      addNotification('error', 'Erro ao rejeitar atração.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar atrações do Supabase
  useEffect(() => {
    loadAttractions();
  }, []);

  const loadAttractions = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getAttractions({
        is_active: true,
        search: searchTerm || undefined,
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      });

      // Converter para formato do componente
      const convertedAttractions: TourismAttraction[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: (item.category_id || 'natural') as any, // TODO: mapear category_id para category
        address: item.address || '',
        coordinates: item.latitude && item.longitude 
          ? { lat: Number(item.latitude), lng: Number(item.longitude) }
          : { lat: 0, lng: 0 },
        images: item.images || [],
        rating: 0, // TODO: calcular rating das reviews
        priceRange: (item.price_range || 'free') as any,
        openingHours: typeof item.opening_hours === 'string' 
          ? item.opening_hours 
          : JSON.stringify(item.opening_hours || {}),
        contact: {
          phone: item.phone,
          email: item.email,
          website: item.website,
        },
        features: item.amenities || [],
        isActive: item.is_active || false,
        verified: item.status === 'approved',
        lastUpdated: item.updated_at ? new Date(item.updated_at) : new Date(),
        createdBy: item.created_by || 'system',
      }));

      setAttractions(convertedAttractions);
    } catch (error) {
      console.error('Erro ao carregar atrações:', error);
      addNotification('error', 'Erro ao carregar atrações. Usando dados locais.');
      // Fallback para dados mockados em caso de erro
      const mockAttractions: TourismAttraction[] = [];
      setAttractions(mockAttractions);
    } finally {
      setLoading(false);
    }
  };

  // Recarregar quando filtros mudarem
  useEffect(() => {
    loadAttractions();
  }, [searchTerm, selectedCategory]);

  // Filtrar atrativos localmente (já vem filtrado do servidor, mas manter para compatibilidade)
  useEffect(() => {
    setFilteredAttractions(attractions);
  }, [attractions]);

  const handleAddAttraction = () => {
    setEditingAttraction(null);
    setShowForm(true);
  };

  const handleEditAttraction = (attraction: TourismAttraction) => {
    setEditingAttraction(attraction);
    setShowForm(true);
  };

  const handleDeleteAttraction = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este atrativo?')) {
      setLoading(true);
      try {
        await inventoryService.deleteAttraction(id);
        addNotification('success', 'Atração excluída com sucesso!');
        await loadAttractions();
      } catch (error) {
        console.error('Erro ao excluir atração:', error);
        addNotification('error', 'Erro ao excluir atração. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    setLoading(true);
    try {
      const attraction = attractions.find(a => a.id === id);
      if (attraction) {
        await inventoryService.updateAttraction(id, {
          is_active: !attraction.isActive,
        });
        addNotification('success', `Atração ${!attraction.isActive ? 'ativada' : 'desativada'} com sucesso!`);
        await loadAttractions();
      }
    } catch (error) {
      console.error('Erro ao alterar status da atração:', error);
      addNotification('error', 'Erro ao alterar status. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(cat => cat.value === category)?.icon || '🏛️';
  };

  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showForm) {
    return (
      <AttractionForm
        attraction={editingAttraction}
        onSave={handleSaveAttraction}
        onCancel={() => {
          setShowForm(false);
          setEditingAttraction(null);
          setValidationErrors({});
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionWrapper
        variant="inventario"
        title="Inventário Turístico"
        subtitle="Gerencie atrativos, serviços e pontos de interesse"
        actions={
          <Button onClick={handleAddAttraction} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Atrativo
          </Button>
        }
      >

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome, descrição ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
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
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Atrativos</p>
                <p className="text-2xl font-bold">{attractions.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardBox>
          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {attractions.filter(a => a.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardBox>
          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verificados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {attractions.filter(a => a.verified).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
          </CardBox>
          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(attractions.reduce((sum, a) => sum + a.rating, 0) / attractions.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardBox>
        </div>

        {/* Lista de Atrativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttractions.map((attraction) => (
            <CardBox key={attraction.id}>
              {/* Cabeçalho com título e badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">{attraction.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{attraction.rating}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`rounded-full text-xs font-medium px-2 py-1 ${
                    attraction.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {attraction.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  {attraction.verified && (
                    <span className="rounded-full text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700">
                      Verificado
                    </span>
                  )}
                </div>
              </div>
              
              {/* Imagem */}
              <div className="h-32 bg-gray-200 rounded-md mb-3 relative overflow-hidden">
                {attraction.images.length > 0 ? (
                  <img
                    src={attraction.images[0]}
                    alt={attraction.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Metadados */}
              <div className="space-y-1 mb-4">
                <p className="text-slate-600 text-sm line-clamp-2">
                  {attraction.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{getCategoryIcon(attraction.category)}</span>
                  <span className={`rounded-full text-xs font-medium px-2 py-1 ${getPriceRangeColor(attraction.priceRange)}`}>
                    {priceRanges[attraction.priceRange]}
                  </span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{attraction.address}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{attraction.openingHours}</span>
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex items-center gap-2 pt-4 flex-wrap border-t">
                <button 
                  className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-slate-700 text-sm hover:bg-slate-50"
                  onClick={() => {}}
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
                <button 
                  className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-slate-700 text-sm hover:bg-slate-50"
                  onClick={() => handleEditAttraction(attraction)}
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button 
                  className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-red-600 text-sm hover:bg-red-50"
                  onClick={() => handleDeleteAttraction(attraction.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </CardBox>
          ))}
        </div>

        {filteredAttractions.length === 0 && (
          <CardBox>
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum atrativo encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando o primeiro atrativo turístico'
                }
              </p>
              <Button onClick={handleAddAttraction} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Atrativo
              </Button>
            </div>
          </CardBox>
        )}
      </SectionWrapper>
    </div>
  );
};

// Componente de formulário para adicionar/editar atrativos
const AttractionForm: React.FC<{
  attraction: TourismAttraction | null;
  onSave: (attraction: TourismAttraction) => void;
  onCancel: () => void;
}> = ({ attraction, onSave, onCancel }) => {
  const [formData, setFormData] = useState<TourismAttraction>({
    id: attraction?.id || '',
    name: attraction?.name || '',
    description: attraction?.description || '',
    category: attraction?.category || 'natural',
    address: attraction?.address || '',
    coordinates: attraction?.coordinates || { lat: 0, lng: 0 },
    images: attraction?.images || [],
    rating: attraction?.rating || 0,
    priceRange: attraction?.priceRange || 'free',
    openingHours: attraction?.openingHours || '',
    contact: attraction?.contact || {},
    features: attraction?.features || [],
    isActive: attraction?.isActive ?? true,
    verified: attraction?.verified ?? false,
    lastUpdated: new Date(),
    createdBy: 'Secretaria de Turismo'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {attraction ? 'Editar Atrativo' : 'Novo Atrativo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Atrativo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                <option value="natural">🌿 Natural</option>
                <option value="cultural">🏛️ Cultural</option>
                <option value="gastronomic">🍽️ Gastronômico</option>
                <option value="adventure">🏔️ Aventura</option>
                <option value="religious">⛪ Religioso</option>
                <option value="entertainment">🎭 Entretenimento</option>
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

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceRange">Faixa de Preço</Label>
              <select
                id="priceRange"
                value={formData.priceRange}
                onChange={(e) => setFormData(prev => ({ ...prev, priceRange: e.target.value as any }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="free">Gratuito</option>
                <option value="low">R$ 0-20</option>
                <option value="medium">R$ 20-50</option>
                <option value="high">R$ 50+</option>
              </select>
            </div>
            <div>
              <Label htmlFor="openingHours">Horário de Funcionamento</Label>
              <Input
                id="openingHours"
                value={formData.openingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                placeholder="Ex: 08:00 - 17:00"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {attraction ? 'Atualizar' : 'Criar'} Atrativo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TourismInventoryManager;


