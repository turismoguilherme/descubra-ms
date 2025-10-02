import React, { useState, useEffect } from 'react';
import { X, MapPin, Upload, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TourismInventory, InventoryCategory } from '@/services/inventory/inventoryService';

interface InventoryFormProps {
  item?: TourismInventory | null;
  categories: InventoryCategory[];
  onSave: (item: Partial<TourismInventory>) => void;
  onCancel: () => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  item,
  categories,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<TourismInventory>>({
    name: '',
    description: '',
    short_description: '',
    category_id: '',
    subcategory_id: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    city: '',
    state: '',
    country: 'BR',
    postal_code: '',
    phone: '',
    email: '',
    website: '',
    opening_hours: {},
    price_range: 'free',
    capacity: undefined,
    amenities: [],
    images: [],
    videos: [],
    meta_title: '',
    meta_description: '',
    tags: [],
    status: 'draft',
    is_featured: false,
    is_active: true
  });

  const [subcategories, setSubcategories] = useState<InventoryCategory[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [loading, setLoading] = useState(false);

  // Load item data when editing
  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        opening_hours: item.opening_hours || {},
        amenities: item.amenities || [],
        images: item.images || [],
        videos: item.videos || [],
        tags: item.tags || []
      });
    }
  }, [item]);

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      const parentCategory = categories.find(cat => cat.id === formData.category_id);
      if (parentCategory) {
        const subs = categories.filter(cat => cat.parent_id === formData.category_id);
        setSubcategories(subs);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id, categories]);

  const handleInputChange = (field: keyof TourismInventory, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field: 'amenities' | 'images' | 'videos' | 'tags', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[] || []), value.trim()]
      }));
    }
  };

  const handleRemoveArrayItem = (field: 'amenities' | 'images' | 'videos' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[] || []).filter((_, i) => i !== index)
    }));
  };

  const handleOpeningHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...(prev.opening_hours as any)?.[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const dayLabels = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {item ? 'Editar Item' : 'Novo Item do Inventário'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome do atrativo/serviço"
                  required
                />
              </div>
              <div>
                <Label htmlFor="short_description">Descrição Curta</Label>
                <Input
                  id="short_description"
                  value={formData.short_description || ''}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  placeholder="Descrição resumida (máx. 500 caracteres)"
                  maxLength={500}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição Completa</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição detalhada do atrativo/serviço"
                rows={4}
              />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category_id || ''}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => !cat.parent_id)
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subcategory">Subcategoria</Label>
                <Select
                  value={formData.subcategory_id || ''}
                  onValueChange={(value) => handleInputChange('subcategory_id', value)}
                  disabled={!formData.category_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map(subcategory => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Endereço completo"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Cidade"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">CEP</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code || ''}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.country || 'BR'}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="BR"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || undefined)}
                    placeholder="-20.4697"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || undefined)}
                    placeholder="-54.6201"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações de Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(67) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contato@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://exemplo.com"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Comerciais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price_range">Faixa de Preço</Label>
                  <Select
                    value={formData.price_range || 'free'}
                    onValueChange={(value) => handleInputChange('price_range', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="low">Baixo</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="capacity">Capacidade</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || undefined)}
                    placeholder="Número de pessoas"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || 'draft'}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Horários de Funcionamento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {days.map(day => (
                  <div key={day} className="space-y-2">
                    <Label>{dayLabels[day as keyof typeof dayLabels]}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={(formData.opening_hours as any)?.[day]?.open || ''}
                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                        placeholder="Abertura"
                      />
                      <Input
                        type="time"
                        value={(formData.opening_hours as any)?.[day]?.close || ''}
                        onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                        placeholder="Fechamento"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Comodidades</h3>
              
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Adicionar comodidade"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayFieldChange('amenities', newAmenity);
                      setNewAmenity('');
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    handleArrayFieldChange('amenities', newAmenity);
                    setNewAmenity('');
                  }}
                  disabled={!newAmenity.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(formData.amenities || []).map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayItem('amenities', index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tags</h3>
              
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayFieldChange('tags', newTag);
                      setNewTag('');
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    handleArrayFieldChange('tags', newTag);
                    setNewTag('');
                  }}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(formData.tags || []).map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayItem('tags', index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Imagens</h3>
              
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="URL da imagem"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayFieldChange('images', newTag);
                      setNewTag('');
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    handleArrayFieldChange('images', newTag);
                    setNewTag('');
                  }}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(formData.images || []).map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayItem('images', index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SEO</h3>
              
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title || ''}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="Título para SEO (máx. 200 caracteres)"
                  maxLength={200}
                />
              </div>
              
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description || ''}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="Descrição para SEO (máx. 500 caracteres)"
                  maxLength={500}
                  rows={3}
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Opções</h3>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured || false}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="rounded"
                  />
                  <span>Item em destaque</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active || false}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="rounded"
                  />
                  <span>Item ativo</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {loading ? 'Salvando...' : (item ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
