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

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingAttraction) {
        // Atualizar atração existente
        setAttractions(prev => prev.map(attr => 
          attr.id === editingAttraction.id 
            ? { ...attr, ...attractionData, lastUpdated: new Date() }
            : attr
        ));
      } else {
        // Criar nova atração
        const newAttraction: TourismAttraction = {
          ...attractionData as TourismAttraction,
          id: Date.now().toString(),
          rating: 0,
          images: [],
          features: [],
          isActive: true,
          verified: false,
          lastUpdated: new Date(),
          createdBy: 'current-user'
        };
        setAttractions(prev => [...prev, newAttraction]);
      }

      setShowForm(false);
      setEditingAttraction(null);
      setValidationErrors({});
      
      // Notificação de sucesso
      addNotification('success', editingAttraction 
        ? 'Atração atualizada com sucesso!' 
        : 'Nova atração criada com sucesso!'
      );
      
    } catch (error) {
      console.error('Erro ao salvar atração:', error);
      addNotification('error', 'Erro ao salvar atração. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para upload de imagens
  const handleImageUpload = async (files: FileList, attractionId: string) => {
    setLoading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Simular upload para servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retornar URL simulada
        return URL.createObjectURL(file);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Atualizar atração com novas imagens
      setAttractions(prev => prev.map(attr => 
        attr.id === attractionId 
          ? { ...attr, images: [...attr.images, ...uploadedUrls] }
          : attr
      ));
      
      addNotification('success', `${uploadedUrls.length} imagem(ns) carregada(s) com sucesso!`);
      
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

  // Dados mock para demonstração
  useEffect(() => {
    const mockAttractions: TourismAttraction[] = [
      {
        id: '1',
        name: 'Parque das Cachoeiras',
        description: 'Parque natural com trilhas, cachoeiras e piscinas naturais. Ideal para ecoturismo e atividades ao ar livre.',
        category: 'natural',
        address: 'Rodovia MS-382, Km 15, Bonito - MS',
        coordinates: { lat: -21.1261, lng: -56.4816 },
        images: ['/images/cachoeira1.jpg', '/images/cachoeira2.jpg'],
        rating: 4.8,
        priceRange: 'medium',
        openingHours: '08:00 - 17:00',
        contact: {
          phone: '(67) 3255-1234',
          email: 'contato@parquedascachoeiras.com',
          website: 'www.parquedascachoeiras.com'
        },
        features: ['Trilhas', 'Cachoeiras', 'Piscinas naturais', 'Guia local'],
        isActive: true,
        verified: true,
        lastUpdated: new Date(),
        createdBy: 'Secretaria de Turismo'
      },
      {
        id: '2',
        name: 'Centro Histórico',
        description: 'Centro histórico preservado com arquitetura colonial, museus e praças históricas.',
        category: 'cultural',
        address: 'Praça da Liberdade, Centro, Bonito - MS',
        coordinates: { lat: -21.1261, lng: -56.4816 },
        images: ['/images/centro1.jpg'],
        rating: 4.5,
        priceRange: 'free',
        openingHours: '24h',
        contact: {
          phone: '(67) 3255-5678'
        },
        features: ['Arquitetura colonial', 'Museus', 'Praças', 'Guia turístico'],
        isActive: true,
        verified: true,
        lastUpdated: new Date(),
        createdBy: 'Secretaria de Turismo'
      },
      {
        id: '3',
        name: 'Restaurante Sabores do MS',
        description: 'Restaurante especializado em culinária regional com pratos típicos do Mato Grosso do Sul.',
        category: 'gastronomic',
        address: 'Rua das Flores, 123, Centro, Bonito - MS',
        coordinates: { lat: -21.1261, lng: -56.4816 },
        images: ['/images/restaurante1.jpg'],
        rating: 4.7,
        priceRange: 'medium',
        openingHours: '11:00 - 22:00',
        contact: {
          phone: '(67) 3255-9999',
          email: 'contato@saboresdoms.com'
        },
        features: ['Culinária regional', 'Prato do dia', 'Delivery', 'Estacionamento'],
        isActive: true,
        verified: true,
        lastUpdated: new Date(),
        createdBy: 'Secretaria de Turismo'
      }
    ];

    setAttractions(mockAttractions);
    setFilteredAttractions(mockAttractions);
  }, []);

  // Filtrar atrativos
  useEffect(() => {
    let filtered = attractions;

    if (searchTerm) {
      filtered = filtered.filter(attraction =>
        attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attraction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attraction.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(attraction => attraction.category === selectedCategory);
    }

    setFilteredAttractions(filtered);
  }, [attractions, searchTerm, selectedCategory]);

  const handleAddAttraction = () => {
    setEditingAttraction(null);
    setShowForm(true);
  };

  const handleEditAttraction = (attraction: TourismAttraction) => {
    setEditingAttraction(attraction);
    setShowForm(true);
  };

  const handleDeleteAttraction = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este atrativo?')) {
      setAttractions(prev => prev.filter(attraction => attraction.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setAttractions(prev => prev.map(attraction => 
      attraction.id === id 
        ? { ...attraction, isActive: !attraction.isActive }
        : attraction
    ));
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
        onSave={(attraction) => {
          if (editingAttraction) {
            setAttractions(prev => prev.map(a => a.id === attraction.id ? attraction : a));
          } else {
            setAttractions(prev => [...prev, { ...attraction, id: Date.now().toString() }]);
          }
          setShowForm(false);
          setEditingAttraction(null);
        }}
        onCancel={() => {
          setShowForm(false);
          setEditingAttraction(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventário Turístico</h2>
          <p className="text-gray-600">Gerencie atrativos, serviços e pontos de interesse</p>
        </div>
        <Button onClick={handleAddAttraction} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Atrativo
        </Button>
      </div>

      {/* Filtros */}
      <Card>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Atrativos</p>
                <p className="text-2xl font-bold">{attractions.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {attractions.filter(a => a.isActive).length}
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
                <p className="text-sm text-gray-600">Verificados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {attractions.filter(a => a.verified).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(attractions.reduce((sum, a) => sum + a.rating, 0) / attractions.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Atrativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAttractions.map((attraction) => (
          <Card key={attraction.id} className="overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              {attraction.images.length > 0 ? (
                <img
                  src={attraction.images[0]}
                  alt={attraction.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex space-x-1">
                <Badge className={attraction.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {attraction.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
                {attraction.verified && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{attraction.name}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{attraction.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {attraction.description}
              </p>
              
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm text-gray-500">{getCategoryIcon(attraction.category)}</span>
                <Badge className={getPriceRangeColor(attraction.priceRange)}>
                  {priceRanges[attraction.priceRange]}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate">{attraction.address}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>{attraction.openingHours}</span>
              </div>
              
              <div className="flex justify-between">
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleEditAttraction(attraction)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteAttraction(attraction.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant={attraction.isActive ? "outline" : "default"}
                  onClick={() => handleToggleActive(attraction.id)}
                >
                  {attraction.isActive ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAttractions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum atrativo encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando o primeiro atrativo turístico'
              }
            </p>
            <Button onClick={handleAddAttraction}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Atrativo
            </Button>
          </CardContent>
        </Card>
      )}
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


