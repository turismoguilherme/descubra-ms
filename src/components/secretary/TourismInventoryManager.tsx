/**
 * Gerenciador de Inventário Turístico
 * CRUD de atrativos, serviços e pontos de interesse
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
  CheckCircle,
  FileText,
  Download,
  Building2,
  User,
  Shield,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import FileUpload from '@/components/ui/FileUpload';
import { inventoryService, TourismAttraction as InventoryAttraction } from '@/services/public/inventoryService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { seturExportService } from '@/services/public/seturExportService';
import { seturValidationService } from '@/services/public/seturValidationService';
import { useToast } from '@/hooks/use-toast';
import { inventoryAIService } from '@/services/ai/inventoryAIService';
import { googlePlacesService } from '@/services/integrations/googlePlacesService';
import { inventoryValidationService } from '@/services/public/inventoryValidationService';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import InventoryAnalytics from '@/components/secretary/InventoryAnalytics';

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
  const { toast } = useToast();
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

    console.log('🔍 INVENTÁRIO: Validando atração:', attraction);
    console.log('🔍 INVENTÁRIO: Coordenadas recebidas:', attraction.coordinates);

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
      console.log('❌ INVENTÁRIO: Coordenadas inválidas detectadas:', attraction.coordinates);
      errors.coordinates = 'Coordenadas inválidas';
    } else {
      console.log('✅ INVENTÁRIO: Coordenadas válidas:', attraction.coordinates);
    }

    // Validação do contato
    if (attraction.contact) {
      const contactErrors: unknown = {};
      
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
    console.log('🗂️ INVENTÁRIO: handleSaveAttraction chamado com dados:', attractionData);
    console.log('👤 INVENTÁRIO: Usuário atual:', user);
    setLoading(true);

    try {
      console.log('🔍 INVENTÁRIO: Iniciando validação dos dados...');
      // Validar dados
      const errors = validateAttraction(attractionData);
      console.log('✅ INVENTÁRIO: Validação concluída, erros encontrados:', errors);

      if (Object.keys(errors).length > 0) {
        console.log('❌ INVENTÁRIO: Dados inválidos, abortando salvamento');
        setValidationErrors(errors);
        return;
      }

      console.log('🔄 INVENTÁRIO: Convertendo dados para formato do serviço...');
      // Converter para formato do serviço
      const serviceData: unknown = {
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
        created_by: null, // Usuários de teste não têm UUID válido
        // Campos SeTur
        legal_name: (attractionData as any).legal_name,
        registration_number: (attractionData as any).registration_number,
        license_number: (attractionData as any).license_number,
        license_expiry_date: (attractionData as any).license_expiry_date,
        responsible_name: (attractionData as any).responsible_name,
        responsible_cpf: (attractionData as any).responsible_cpf,
        responsible_email: (attractionData as any).responsible_email,
        responsible_phone: (attractionData as any).responsible_phone,
      };

      console.log('📦 INVENTÁRIO: Dados convertidos para serviço:', serviceData);

      let savedAttraction: InventoryAttraction;

      if (editingAttraction) {
        console.log('✏️ INVENTÁRIO: Atualizando atração existente, ID:', editingAttraction.id);
        // Atualizar atração existente
        savedAttraction = await inventoryService.updateAttraction(editingAttraction.id, serviceData);
        console.log('✅ INVENTÁRIO: Atração atualizada com sucesso:', savedAttraction);
        addNotification('success', 'Atração atualizada com sucesso!');
      } else {
        console.log('➕ INVENTÁRIO: Criando nova atração...');
        // Criar nova atração
        savedAttraction = await inventoryService.createAttraction(serviceData);
        console.log('✅ INVENTÁRIO: Nova atração criada com sucesso:', savedAttraction);
        addNotification('success', 'Nova atração criada com sucesso!');
      }

      console.log('🔄 INVENTÁRIO: Recarregando lista de atrações...');
      // Recarregar lista
      await loadAttractions();

      console.log('🧹 INVENTÁRIO: Limpando estado do formulário...');
      setShowForm(false);
      setEditingAttraction(null);
      setValidationErrors({});

    } catch (error) {
      console.error('❌ INVENTÁRIO: Erro ao salvar atração:', error);
      console.error('❌ INVENTÁRIO: Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        user: user,
        attractionData: attractionData
      });
      addNotification('error', 'Erro ao salvar atração. Tente novamente.');
    } finally {
      console.log('🏁 INVENTÁRIO: Finalizando operação de salvamento');
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
    console.log('📋 INVENTÁRIO: loadAttractions iniciado');
    console.log('📋 INVENTÁRIO: Filtros aplicados:', {
      searchTerm,
      selectedCategory,
      is_active: true
    });

    setLoading(true);
    try {
      const data = await inventoryService.getAttractions({
        is_active: true,
        search: searchTerm || undefined,
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      });

      console.log('📋 INVENTÁRIO: Dados recebidos do serviço:', data?.length || 0, 'atrações');

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
        // Campos SeTur
        setur_code: (item as any).setur_code,
        setur_category_code: (item as any).setur_category_code,
        legal_name: (item as any).legal_name,
        registration_number: (item as any).registration_number,
        license_number: (item as any).license_number,
        license_expiry_date: (item as any).license_expiry_date,
        responsible_name: (item as any).responsible_name,
        responsible_cpf: (item as any).responsible_cpf,
        responsible_email: (item as any).responsible_email,
        responsible_phone: (item as any).responsible_phone,
        data_completeness_score: (item as any).data_completeness_score,
        setur_compliance_score: (item as any).setur_compliance_score,
      } as any));

      console.log('📋 INVENTÁRIO: Atrações convertidas com sucesso:', convertedAttractions.length);
      setAttractions(convertedAttractions);
    } catch (error) {
      console.error('❌ INVENTÁRIO: Erro ao carregar atrações:', error);
      console.error('❌ INVENTÁRIO: Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      addNotification('error', 'Erro ao carregar atrações. Usando dados locais.');
      // Fallback para dados mockados em caso de erro
      const mockAttractions: TourismAttraction[] = [];
      setAttractions(mockAttractions);
    } finally {
      console.log('🏁 INVENTÁRIO: loadAttractions finalizado');
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
    <SectionWrapper
      variant="default"
      title="Inventário Turístico"
      subtitle="Gerencie atrativos, serviços e pontos de interesse"
    >
      <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Aba Lista */}
          <TabsContent value="lista" className="space-y-6 mt-6">
            <div className="flex justify-end gap-2 mb-4">
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Botão Novo Atrativo clicado');
              handleAddAttraction();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Atrativo
          </Button>
              </div>

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
        ) : filteredAttractions.length === 0 ? (
          <CardBox>
            <div className="text-center py-12">
              <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-1">Nenhum atrativo encontrado</p>
              <p className="text-sm text-slate-500 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando o primeiro atrativo turístico'
                }
              </p>
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Botão Adicionar Atrativo clicado');
                  handleAddAttraction();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Atrativo
              </Button>
            </div>
          </CardBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAttractions.map((attraction) => (
              <CardBox key={attraction.id} className="hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate mb-1">
                        {attraction.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{getCategoryIcon(attraction.category)}</span>
                        <span>{priceRanges[attraction.priceRange]}</span>
                      </div>
                    </div>
                  </div>
                      <div className="flex items-center gap-2 flex-wrap">
                    {attraction.isActive && (
                      <Badge className="rounded-full text-xs px-2 py-0.5 bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    )}
                    {!attraction.isActive && (
                      <Badge className="rounded-full text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-gray-200">
                        Inativo
                      </Badge>
                    )}
                    {attraction.verified && (
                      <Badge className="rounded-full text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border-blue-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                        {/* Mostrar código SeTur se existir */}
                        {(attraction as any).setur_code && (
                          <Badge className="rounded-full text-xs px-2 py-0.5 bg-purple-100 text-purple-700 border-purple-200" title="Código SeTur">
                            <Shield className="h-3 w-3 mr-1" />
                            {(attraction as any).setur_code}
                          </Badge>
                        )}
                        {/* Mostrar score de completude SeTur se existir */}
                        {(attraction as any).setur_completeness_score && (
                          <Badge className="rounded-full text-xs px-2 py-0.5 bg-cyan-100 text-cyan-700 border-cyan-200" title="Completude SeTur">
                            {(attraction as any).setur_completeness_score}%
                      </Badge>
                    )}
                  </div>
                </div>

                    {/* Descrição */}
                {attraction.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{attraction.description}</p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{attraction.address}</span>
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
                        console.log('Botão Ver atração clicado', attraction.id);
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
                        console.log('Botão Editar atração clicado', attraction.id);
                        handleEditAttraction(attraction);
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
                        console.log('Botão Excluir atração clicado', attraction.id);
                        handleDeleteAttraction(attraction.id);
                      }}
                      className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardBox>
            ))}
          </div>
        )}
          </TabsContent>

          {/* Aba Analytics */}
          <TabsContent value="analytics" className="mt-6">
            <InventoryAnalytics />
          </TabsContent>
        </Tabs>
    </SectionWrapper>
  );
};

// Componente de formulário para adicionar/editar atrativos
const AttractionForm: React.FC<{
  attraction: TourismAttraction | null;
  onSave: (attraction: TourismAttraction) => void;
  onCancel: () => void;
}> = ({ attraction, onSave, onCancel }) => {
  const { toast } = useToast();
  const [showSeTurFields, setShowSeTurFields] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    address?: unknown;
    registration?: unknown;
    duplicates?: unknown;
    completeness?: unknown;
  }>({});
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
  
  // Campos SeTur (estendendo formData)
  const [seTurData, setSeTurData] = useState({
    legal_name: (attraction as any)?.legal_name || '',
    registration_number: (attraction as any)?.registration_number || '',
    license_number: (attraction as any)?.license_number || '',
    license_expiry_date: (attraction as any)?.license_expiry_date || '',
    responsible_name: (attraction as any)?.responsible_name || '',
    responsible_cpf: (attraction as any)?.responsible_cpf || '',
    responsible_email: (attraction as any)?.responsible_email || '',
    responsible_phone: (attraction as any)?.responsible_phone || '',
  });

  // Atualizar dados SeTur quando attraction mudar
  useEffect(() => {
    if (attraction) {
      setSeTurData({
        legal_name: (attraction as any)?.legal_name || '',
        registration_number: (attraction as any)?.registration_number || '',
        license_number: (attraction as any)?.license_number || '',
        license_expiry_date: (attraction as any)?.license_expiry_date || '',
        responsible_name: (attraction as any)?.responsible_name || '',
        responsible_cpf: (attraction as any)?.responsible_cpf || '',
        responsible_email: (attraction as any)?.responsible_email || '',
        responsible_phone: (attraction as any)?.responsible_phone || '',
      });
    }
  }, [attraction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Mesclar dados SeTur antes de salvar
    const finalData = {
      ...formData,
      ...seTurData,
    } as any;
    onSave(finalData);
  };

  // Validar endereço em tempo real
  const handleValidateAddress = async () => {
    if (!formData.address) return;
    
    setValidating(true);
    try {
      const result = await inventoryValidationService.validateAddress(formData.address);
      setValidationResults(prev => ({ ...prev, address: result }));
      
      if (result.isValid && result.formattedAddress) {
        setFormData(prev => ({
          ...prev,
          address: result.formattedAddress || prev.address,
          coordinates: result.coordinates ? {
            lat: result.coordinates.lat,
            lng: result.coordinates.lng,
          } : prev.coordinates,
        }));
        toast({
          title: 'Endereço validado!',
          description: 'Endereço formatado e coordenadas atualizadas.',
        });
      } else {
        toast({
          title: 'Endereço não encontrado',
          description: 'Verifique o endereço ou tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao validar endereço:', error);
    } finally {
      setValidating(false);
    }
  };

  // Validar CNPJ/CPF em tempo real
  const handleValidateRegistration = async () => {
    if (!seTurData.registration_number) return;
    
    setValidating(true);
    try {
      const result = await inventoryValidationService.validateRegistrationNumber(seTurData.registration_number);
      setValidationResults(prev => ({ ...prev, registration: result }));
      
      if (!result.isValid) {
        toast({
          title: 'CNPJ/CPF inválido',
          description: result.errors.join(', '),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'CNPJ/CPF válido!',
          description: 'Número de registro validado com sucesso.',
        });
      }
    } catch (error) {
      console.error('Erro ao validar registro:', error);
    } finally {
      setValidating(false);
    }
  };

  // Verificar duplicatas
  const handleCheckDuplicates = async () => {
    if (!formData.name) {
      toast({
        title: 'Nome necessário',
        description: 'Preencha o nome para verificar duplicatas.',
        variant: 'destructive',
      });
      return;
    }
    
    setValidating(true);
    try {
      const result = await inventoryValidationService.checkDuplicates(formData as any);
      setValidationResults(prev => ({ ...prev, duplicates: result }));
      
      if (result.hasDuplicates) {
        toast({
          title: 'Possíveis duplicatas encontradas',
          description: `${result.duplicates.length} atrativo(s) similar(es) encontrado(s).`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Nenhuma duplicata encontrada',
          description: 'O atrativo parece ser único.',
        });
      }
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
    } finally {
      setValidating(false);
    }
  };

  // Validar completude
  const handleValidateCompleteness = async () => {
    setValidating(true);
    try {
      const result = await inventoryValidationService.validateCompleteness(formData as any);
      setValidationResults(prev => ({ ...prev, completeness: result }));
      
      toast({
        title: `Completude: ${result.score}%`,
        description: `${result.filledFields} de ${result.totalFields} campos preenchidos.`,
      });
    } catch (error) {
      console.error('Erro ao validar completude:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleAutoFill = async () => {
    if (!formData.name || !formData.address) {
      toast({
        title: 'Campos necessários',
        description: 'Preencha pelo menos o nome e endereço para usar o preenchimento automático.',
        variant: 'destructive',
      });
      return;
    }

    setAutoFilling(true);
    try {
      // 1. Validar endereço com Google Places
      const addressValidation = await googlePlacesService.validateAddress(formData.address);
      
      if (addressValidation.isValid && addressValidation.coordinates) {
        // Atualizar endereço formatado e coordenadas
        setFormData(prev => ({
          ...prev,
          address: addressValidation.formattedAddress || prev.address,
          coordinates: {
            lat: addressValidation.coordinates.lat,
            lng: addressValidation.coordinates.lng,
          },
        }));
        setAutoFilledFields(prev => new Set([...prev, 'address', 'coordinates']));
      }

      // 2. Preencher dados com IA
      console.log('🤖 TURISMOINVENTORY: Chamando autoFillFromNameAndAddress com:', {
        name: formData.name,
        address: formData.address
      });

      const autoFilled = await inventoryAIService.autoFillFromNameAndAddress(
        formData.name,
        formData.address
      );

      console.log('🤖 TURISMOINVENTORY: Dados retornados pela IA:', autoFilled);
      console.log('🤖 TURISMOINVENTORY: Coordenadas retornadas:', autoFilled.coordinates);

      // 3. Atualizar formulário com dados preenchidos
      setFormData(prev => ({
        ...prev,
        description: autoFilled.description || prev.description,
        category: (autoFilled.category as any) || prev.category,
        tags: autoFilled.tags || prev.tags || [],
        priceRange: (autoFilled.price_range as any) || prev.priceRange,
        openingHours: autoFilled.opening_hours || prev.openingHours,
        features: autoFilled.amenities || prev.features,
        coordinates: autoFilled.coordinates || prev.coordinates, // Adicionar coordenadas!
      }));

      console.log('🤖 TURISMOINVENTORY: Formulário atualizado. Novas coordenadas:', autoFilled.coordinates);

      // Marcar campos como preenchidos automaticamente
      const newAutoFilled = new Set<string>(['description', 'category']);
      if (autoFilled.opening_hours) newAutoFilled.add('openingHours');
      if (autoFilled.price_range) newAutoFilled.add('priceRange');
      if (autoFilled.coordinates) newAutoFilled.add('coordinates'); // Marcar coordenadas como auto-preenchidas
      setAutoFilledFields(newAutoFilled);

      toast({
        title: 'Preenchimento automático concluído!',
        description: 'Os dados foram preenchidos automaticamente. Revise e ajuste se necessário.',
      });
    } catch (error) {
      console.error('Erro no preenchimento automático:', error);
      toast({
        title: 'Erro no preenchimento automático',
        description: 'Não foi possível preencher automaticamente. Preencha manualmente.',
        variant: 'destructive',
      });
    } finally {
      setAutoFilling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <SectionWrapper
          variant="default"
          title={attraction ? 'Editar Atrativo' : 'Novo Atrativo'}
          subtitle={attraction ? 'Atualize as informações do atrativo' : 'Preencha os dados do novo atrativo turístico'}
        >
          <CardBox className="max-w-2xl mx-auto shadow-lg bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Botão de Preenchimento Automático */}
          {!attraction && (
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Preenchimento Automático com IA
                  </h4>
                  <p className="text-sm text-slate-600">
                    Preencha o nome e endereço, depois clique no botão para preencher automaticamente os demais campos.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={autoFilling || !formData.name || !formData.address}
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
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-600" />
                Nome do Atrativo *
                {autoFilledFields.has('name') && (
                  <Badge className="ml-2 text-xs bg-purple-100 text-purple-700">IA</Badge>
                )}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Gruta do Lago Azul"
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                Categoria *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">🌿 Natural</SelectItem>
                  <SelectItem value="cultural">🏛️ Cultural</SelectItem>
                  <SelectItem value="gastronomic">🍽️ Gastronômico</SelectItem>
                  <SelectItem value="adventure">🏔️ Aventura</SelectItem>
                  <SelectItem value="religious">⛪ Religioso</SelectItem>
                  <SelectItem value="entertainment">🎭 Entretenimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Descrição *
              {autoFilledFields.has('description') && (
                <Badge className="ml-2 text-xs bg-purple-100 text-purple-700">Preenchido automaticamente</Badge>
              )}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                setAutoFilledFields(prev => {
                  const newSet = new Set(prev);
                  newSet.delete('description');
                  return newSet;
                });
              }}
              rows={4}
              placeholder="Descreva o atrativo, suas características, história..."
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
            <Label htmlFor="address" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Endereço *
                {autoFilledFields.has('address') && (
                  <Badge className="ml-2 text-xs bg-purple-100 text-purple-700">Validado</Badge>
                )}
                {validationResults.address?.isValid && (
                  <Badge className="ml-2 text-xs bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Válido
                  </Badge>
                )}
                {validationResults.address && !validationResults.address.isValid && (
                  <Badge className="ml-2 text-xs bg-red-100 text-red-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Inválido
                  </Badge>
                )}
            </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleValidateAddress}
                disabled={validating || !formData.address}
                className="h-8 text-xs"
              >
                {validating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Validar'}
              </Button>
            </div>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, address: e.target.value }));
                setAutoFilledFields(prev => {
                  const newSet = new Set(prev);
                  newSet.delete('address');
                  return newSet;
                });
                setValidationResults(prev => ({ ...prev, address: undefined }));
              }}
              placeholder="Ex: Rua 14 de Julho, 123, Centro, Bonito, MS"
              className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            {validationResults.address?.suggestions && validationResults.address.suggestions.length > 0 && (
              <div className="text-xs text-slate-600">
                <p className="font-semibold mb-1">Sugestões:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationResults.address.suggestions.map((suggestion: string, i: number) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="priceRange" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Faixa de Preço
              </Label>
              <Select
                value={formData.priceRange}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priceRange: value as any }))}
              >
                <SelectTrigger className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecione a faixa de preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuito</SelectItem>
                  <SelectItem value="low">R$ 0-20</SelectItem>
                  <SelectItem value="medium">R$ 20-50</SelectItem>
                  <SelectItem value="high">R$ 50+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openingHours" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Horário de Funcionamento
                {autoFilledFields.has('openingHours') && (
                  <Badge className="ml-2 text-xs bg-purple-100 text-purple-700">IA</Badge>
                )}
              </Label>
              <Input
                id="openingHours"
                value={formData.openingHours}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, openingHours: e.target.value }));
                  setAutoFilledFields(prev => {
                    const newSet = new Set(prev);
                    newSet.delete('openingHours');
                    return newSet;
                  });
                }}
                placeholder="Ex: 08:00 - 17:00"
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Seção SeTur (Expandível) */}
          <div className="border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => setShowSeTurFields(!showSeTurFields)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-slate-800">Campos SeTur (Padrão Nacional)</span>
                <Badge className="bg-blue-600 text-white text-xs">Opcional</Badge>
              </div>
              {showSeTurFields ? (
                <ChevronUp className="h-5 w-5 text-blue-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-blue-600" />
              )}
            </button>

            {showSeTurFields && (
              <div className="mt-4 space-y-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="legal_name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Razão Social
                    </Label>
                    <Input
                      id="legal_name"
                      value={seTurData.legal_name}
                      onChange={(e) => setSeTurData(prev => ({ ...prev, legal_name: e.target.value }))}
                      placeholder="Nome legal do estabelecimento"
                      className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="registration_number" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        CNPJ/CPF
                        {validationResults.registration?.isValid && (
                          <Badge className="ml-2 text-xs bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Válido
                          </Badge>
                        )}
                        {validationResults.registration && !validationResults.registration.isValid && (
                          <Badge className="ml-2 text-xs bg-red-100 text-red-700">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inválido
                          </Badge>
                        )}
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleValidateRegistration}
                        disabled={validating || !seTurData.registration_number}
                        className="h-8 text-xs"
                      >
                        {validating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Validar'}
                      </Button>
                    </div>
                    <Input
                      id="registration_number"
                      value={seTurData.registration_number}
                      onChange={(e) => {
                        setSeTurData(prev => ({ ...prev, registration_number: e.target.value }));
                        setValidationResults(prev => ({ ...prev, registration: undefined }));
                      }}
                      placeholder="00.000.000/0000-00 ou 000.000.000-00"
                      className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {validationResults.registration?.errors && validationResults.registration.errors.length > 0 && (
                      <div className="text-xs text-red-600">
                        {validationResults.registration.errors.map((error: string, i: number) => (
                          <p key={i}>• {error}</p>
                        ))}
                      </div>
                    )}
                    {validationResults.registration?.warnings && validationResults.registration.warnings.length > 0 && (
                      <div className="text-xs text-yellow-600">
                        {validationResults.registration.warnings.map((warning: string, i: number) => (
                          <p key={i}>⚠ {warning}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="license_number" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Número de Licença/Alvará
                    </Label>
                    <Input
                      id="license_number"
                      value={seTurData.license_number}
                      onChange={(e) => setSeTurData(prev => ({ ...prev, license_number: e.target.value }))}
                      placeholder="Número da licença"
                      className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_expiry_date" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Data de Validade da Licença
                    </Label>
                    <Input
                      id="license_expiry_date"
                      type="date"
                      value={seTurData.license_expiry_date}
                      onChange={(e) => setSeTurData(prev => ({ ...prev, license_expiry_date: e.target.value }))}
                      className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-300 pt-4">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Dados do Responsável Legal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="responsible_name" className="text-sm font-semibold text-slate-700">
                        Nome do Responsável
                      </Label>
                      <Input
                        id="responsible_name"
                        value={seTurData.responsible_name}
                        onChange={(e) => setSeTurData(prev => ({ ...prev, responsible_name: e.target.value }))}
                        placeholder="Nome completo"
                        className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsible_cpf" className="text-sm font-semibold text-slate-700">
                        CPF do Responsável
                      </Label>
                      <Input
                        id="responsible_cpf"
                        value={seTurData.responsible_cpf}
                        onChange={(e) => setSeTurData(prev => ({ ...prev, responsible_cpf: e.target.value }))}
                        placeholder="000.000.000-00"
                        className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsible_email" className="text-sm font-semibold text-slate-700">
                        Email do Responsável
                      </Label>
                      <Input
                        id="responsible_email"
                        type="email"
                        value={seTurData.responsible_email}
                        onChange={(e) => setSeTurData(prev => ({ ...prev, responsible_email: e.target.value }))}
                        placeholder="email@exemplo.com"
                        className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsible_phone" className="text-sm font-semibold text-slate-700">
                        Telefone do Responsável
                      </Label>
                      <Input
                        id="responsible_phone"
                        value={seTurData.responsible_phone}
                        onChange={(e) => setSeTurData(prev => ({ ...prev, responsible_phone: e.target.value }))}
                        placeholder="(00) 00000-0000"
                        className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seção de Validação */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Validação e Verificação
              </h4>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCheckDuplicates}
                  disabled={validating || !formData.name}
                  className="text-xs"
                >
                  {validating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                  Verificar Duplicatas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleValidateCompleteness}
                  disabled={validating}
                  className="text-xs"
                >
                  {validating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                  Validar Completude
                </Button>
              </div>
            </div>

            {/* Resultados de Duplicatas */}
            {validationResults.duplicates?.hasDuplicates && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-800 mb-2">
                      {validationResults.duplicates.duplicates.length} possível(is) duplicata(s) encontrada(s)
                    </p>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      {validationResults.duplicates.duplicates.map((dup) => (
                        <li key={dup.id}>
                          • <strong>{dup.name}</strong> - {dup.reason} (Similaridade: {Math.round(dup.similarity)}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Resultados de Completude */}
            {validationResults.completeness && (
              <div className={`p-4 border rounded-lg ${
                validationResults.completeness.score >= 80 
                  ? 'bg-green-50 border-green-200' 
                  : validationResults.completeness.score >= 60
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  <TrendingUp className={`h-5 w-5 mt-0.5 ${
                    validationResults.completeness.score >= 80 
                      ? 'text-green-600' 
                      : validationResults.completeness.score >= 60
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-semibold mb-2 ${
                      validationResults.completeness.score >= 80 
                        ? 'text-green-800' 
                        : validationResults.completeness.score >= 60
                        ? 'text-yellow-800'
                        : 'text-red-800'
                    }`}>
                      Completude: {validationResults.completeness.score}%
                    </p>
                    <p className="text-sm text-slate-700 mb-2">
                      {validationResults.completeness.filledFields} de {validationResults.completeness.totalFields} campos preenchidos
                    </p>
                    {validationResults.completeness.missingFields.length > 0 && (
                      <div className="text-sm">
                        <p className="font-semibold text-red-700 mb-1">Campos obrigatórios faltando:</p>
                        <ul className="list-disc list-inside text-red-600">
                          {validationResults.completeness.missingFields.map((field, i) => (
                            <li key={i}>{field}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {validationResults.completeness.recommendedFields.length > 0 && (
                      <div className="text-sm mt-2">
                        <p className="font-semibold text-yellow-700 mb-1">Campos recomendados:</p>
                        <ul className="list-disc list-inside text-yellow-600">
                          {validationResults.completeness.recommendedFields.slice(0, 5).map((field, i) => (
                            <li key={i}>{field}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Cancelar formulário atração clicado');
                onCancel();
              }}
              className="px-6 h-11 border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Salvar atração clicado');
                handleSubmit(e);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md px-6 h-11"
            >
              {attraction ? 'Atualizar' : 'Criar'} Atrativo
            </Button>
          </div>
        </form>
          </CardBox>
        </SectionWrapper>
      </div>
    </div>
  );
};

export default TourismInventoryManager;


