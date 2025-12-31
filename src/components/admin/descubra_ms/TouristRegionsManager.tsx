import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MapPin, Plus, Edit, Trash2, Save, X, Loader2, 
  Palette, Image as ImageIcon, List, Star,
  Video, Upload, Globe, Phone, Mail, Instagram, Facebook, Youtube,
  Calendar, Car, Play
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import LocationPicker from '@/components/admin/LocationPicker';

interface TouristRegion {
  id: string;
  name: string;
  slug: string;
  color: string;
  color_hover: string;
  description: string;
  cities: string[];
  highlights: string[];
  image_url: string | null;
  order_index: number;
  is_active: boolean;
}

export default function TouristRegionsManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [regions, setRegions] = useState<TouristRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<TouristRegion | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#FFCA28',
    color_hover: '#FFB300',
    description: '',
    image_url: '',
    order_index: 0,
    is_active: true,
  });

  const [cities, setCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');

  // Estados para gerenciar detalhes da região
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editingRegionForDetails, setEditingRegionForDetails] = useState<TouristRegion | null>(null);
  const [detailsData, setDetailsData] = useState({
    promotional_text: '',
    video_url: '',
    video_type: 'youtube' as 'youtube' | 'upload' | null,
    map_latitude: '',
    map_longitude: '',
    official_website: '',
    contact_phone: '',
    contact_email: '',
    highlights: '',
    how_to_get_there: '',
    best_time_to_visit: '',
    social_instagram: '',
    social_facebook: '',
    social_youtube: '',
  });
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [uploadingDetails, setUploadingDetails] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const BUCKET_NAME = 'tourism-images';

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tourist_regions')
        .select('*')
        .order('order_index', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      // Converter JSONB arrays para arrays JavaScript
      const processedData = (data || []).map(region => ({
        ...region,
        cities: Array.isArray(region.cities) ? region.cities : [],
        highlights: Array.isArray(region.highlights) ? region.highlights : [],
      }));

      setRegions(processedData);
    } catch (error: any) {
      console.error('Erro ao carregar regiões:', error);
      toast({
        title: 'Erro ao carregar',
        description: error.message || 'Não foi possível carregar as regiões turísticas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRegion(null);
    setFormData({
      name: '',
      slug: '',
      color: '#FFCA28',
      color_hover: '#FFB300',
      description: '',
      image_url: '',
      order_index: regions.length,
      is_active: true,
    });
    setCities([]);
    setHighlights([]);
    setNewCity('');
    setNewHighlight('');
    setDialogOpen(true);
  };

  const handleEdit = (region: TouristRegion) => {
    setEditingRegion(region);
    setFormData({
      name: region.name,
      slug: region.slug,
      color: region.color,
      color_hover: region.color_hover || region.color,
      description: region.description,
      image_url: region.image_url || '',
      order_index: region.order_index || 0,
      is_active: region.is_active ?? true,
    });
    setCities([...region.cities]);
    setHighlights([...region.highlights]);
    setNewCity('');
    setNewHighlight('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e slug são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        color: formData.color,
        color_hover: formData.color_hover || formData.color,
        description: formData.description.trim(),
        cities: cities,
        highlights: highlights,
        image_url: formData.image_url.trim() || null,
        order_index: formData.order_index,
        is_active: formData.is_active,
        updated_by: user.id,
      };

      if (editingRegion) {
        // Atualizar
        const { error } = await supabase
          .from('tourist_regions')
          .update(payload)
          .eq('id', editingRegion.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Região atualizada com sucesso!',
        });
      } else {
        // Criar
        const { error } = await supabase
          .from('tourist_regions')
          .insert(payload);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Região criada com sucesso!',
        });
      }

      // Disparar evento para atualizar componentes que usam o hook
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('touristRegionsUpdated'));
      }

      setDialogOpen(false);
      loadRegions();
    } catch (error: any) {
      console.error('Erro ao salvar região:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar a região',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (region: TouristRegion) => {
    if (!confirm(`Tem certeza que deseja excluir a região "${region.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tourist_regions')
        .delete()
        .eq('id', region.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Região excluída com sucesso!',
      });

      // Disparar evento para atualizar componentes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('touristRegionsUpdated'));
      }

      loadRegions();
    } catch (error: any) {
      console.error('Erro ao excluir região:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir a região',
        variant: 'destructive',
      });
    }
  };

  const addCity = () => {
    if (newCity.trim() && !cities.includes(newCity.trim())) {
      setCities([...cities, newCity.trim()]);
      setNewCity('');
    }
  };

  const removeCity = (index: number) => {
    setCities(cities.filter((_, i) => i !== index));
  };

  const addHighlight = () => {
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  // Gerar slug automaticamente a partir do nome
  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!editingRegion) {
      // Gerar slug automaticamente apenas ao criar
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, name, slug }));
    }
  };

  // Funções para gerenciar detalhes da região
  const handleManageDetails = async (region: TouristRegion) => {
    setEditingRegionForDetails(region);
    await loadRegionDetails(region.id);
    setDetailsDialogOpen(true);
  };

  const loadRegionDetails = async (regionId: string) => {
    try {
      const { data: detailsData, error } = await supabase
        .from('destination_details')
        .select('*')
        .eq('tourist_region_id', regionId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao carregar detalhes:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar detalhes da região',
          variant: 'destructive',
        });
      }

      if (detailsData) {
        setDetailsData({
          promotional_text: detailsData.promotional_text || '',
          video_url: detailsData.video_url || '',
          video_type: detailsData.video_type || 'youtube',
          map_latitude: detailsData.map_latitude?.toString() || '',
          map_longitude: detailsData.map_longitude?.toString() || '',
          official_website: detailsData.official_website || '',
          contact_phone: detailsData.contact_phone || '',
          contact_email: detailsData.contact_email || '',
          highlights: Array.isArray(detailsData.highlights) ? detailsData.highlights.join('\n') : '',
          how_to_get_there: detailsData.how_to_get_there || '',
          best_time_to_visit: detailsData.best_time_to_visit || '',
          social_instagram: detailsData.social_links?.instagram || '',
          social_facebook: detailsData.social_links?.facebook || '',
          social_youtube: detailsData.social_links?.youtube || '',
        });
        setGalleryImages(detailsData.image_gallery || []);
      } else {
        // Limpar formulário se não houver detalhes
        setDetailsData({
          promotional_text: '',
          video_url: '',
          video_type: 'youtube',
          map_latitude: '',
          map_longitude: '',
          official_website: '',
          contact_phone: '',
          contact_email: '',
          highlights: '',
          how_to_get_there: '',
          best_time_to_visit: '',
          social_instagram: '',
          social_facebook: '',
          social_youtube: '',
        });
        setGalleryImages([]);
      }
      setNewGalleryFiles([]);
      setGalleryPreviews([]);
    } catch (error: any) {
      console.error('Erro ao carregar detalhes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar detalhes da região',
        variant: 'destructive',
      });
    }
  };

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewGalleryFiles([...newGalleryFiles, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGalleryPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number, isNew: boolean) => {
    if (isNew) {
      const newFiles = [...newGalleryFiles];
      const newPreviews = [...galleryPreviews];
      newFiles.splice(index - galleryImages.length, 1);
      newPreviews.splice(index - galleryImages.length, 1);
      setNewGalleryFiles(newFiles);
      setGalleryPreviews(newPreviews);
    } else {
      setGalleryImages(galleryImages.filter((_, i) => i !== index));
    }
  };

  const uploadGalleryImages = async (regionId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of newGalleryFiles) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Arquivo inválido',
          description: `${file.name} não é uma imagem válida.`,
          variant: 'destructive',
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: `${file.name} excede 10MB.`,
          variant: 'destructive',
        });
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `regions/${regionId}/${uuidv4()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
            console.warn('⚠️ Bucket não encontrado, continuando sem upload de imagem');
            continue;
          }
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      } catch (error: any) {
        console.error('Erro no upload:', error);
        toast({
          title: 'Erro no upload',
          description: `Erro ao fazer upload de ${file.name}`,
          variant: 'destructive',
        });
      }
    }

    return uploadedUrls;
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
  }) => {
    setDetailsData({
      ...detailsData,
      map_latitude: location.latitude.toString(),
      map_longitude: location.longitude.toString(),
    });
    setShowLocationPicker(false);
  };

  const handleSaveDetails = async () => {
    if (!editingRegionForDetails || !user) {
      toast({
        title: 'Erro',
        description: 'Região não selecionada ou usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    setUploadingDetails(true);
    try {
      const regionId = editingRegionForDetails.id;

      // Upload de novas imagens da galeria
      const newUploadedUrls = await uploadGalleryImages(regionId);
      const allGalleryImages = [...galleryImages, ...newUploadedUrls];

      // Preparar dados
      const highlights = detailsData.highlights
        ? detailsData.highlights.split('\n').map(h => h.trim()).filter(h => h)
        : [];

      const socialLinks = {
        ...(detailsData.social_instagram && { instagram: detailsData.social_instagram }),
        ...(detailsData.social_facebook && { facebook: detailsData.social_facebook }),
        ...(detailsData.social_youtube && { youtube: detailsData.social_youtube }),
      };

      const videoUrlRaw = detailsData.video_url?.trim();
      const videoUrl = videoUrlRaw && videoUrlRaw.length > 0 ? videoUrlRaw : null;
      
      const mapLat = detailsData.map_latitude?.trim() 
        ? (isNaN(parseFloat(detailsData.map_latitude)) ? null : parseFloat(detailsData.map_latitude))
        : null;
      const mapLng = detailsData.map_longitude?.trim()
        ? (isNaN(parseFloat(detailsData.map_longitude)) ? null : parseFloat(detailsData.map_longitude))
        : null;

      const detailsPayload = {
        tourist_region_id: regionId,
        promotional_text: detailsData.promotional_text?.trim() || null,
        video_url: videoUrl,
        video_type: detailsData.video_type,
        map_latitude: mapLat,
        map_longitude: mapLng,
        image_gallery: allGalleryImages,
        official_website: detailsData.official_website?.trim() || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        contact_phone: detailsData.contact_phone?.trim() || null,
        contact_email: detailsData.contact_email?.trim() || null,
        highlights: highlights,
        how_to_get_there: detailsData.how_to_get_there?.trim() || null,
        best_time_to_visit: detailsData.best_time_to_visit?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Verificar se já existe detalhes para esta região
      const { data: existingDetails } = await supabase
        .from('destination_details')
        .select('id')
        .eq('tourist_region_id', regionId)
        .single();

      if (existingDetails) {
        // Atualizar
        const { error } = await supabase
          .from('destination_details')
          .update(detailsPayload)
          .eq('id', existingDetails.id);

        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase
          .from('destination_details')
          .insert(detailsPayload);

        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Detalhes da região salvos com sucesso!',
      });

      setDetailsDialogOpen(false);
    } catch (error: any) {
      console.error('Erro ao salvar detalhes:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar detalhes da região',
        variant: 'destructive',
      });
    } finally {
      setUploadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Regiões Turísticas</h2>
          <p className="text-muted-foreground">
            Gerencie as 9 regiões turísticas de Mato Grosso do Sul
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Região
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((region) => (
          <Card key={region.id} className={!region.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: region.color }}
                    />
                    {region.name}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {region.description}
                  </CardDescription>
                </div>
                <Badge variant={region.is_active ? 'default' : 'secondary'}>
                  {region.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="text-sm text-muted-foreground">
                  <strong>{region.cities.length}</strong> cidades
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>{region.highlights.length}</strong> destaques
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(region)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(region)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageDetails(region)}
                  className="w-full"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Gerenciar Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edição/Criação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRegion ? 'Editar Região' : 'Nova Região'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Pantanal"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Ex: pantanal"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da região..."
                rows={3}
              />
            </div>

            {/* Cores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cor Principal *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#FFCA28"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="color_hover" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cor Hover
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="color_hover"
                    type="color"
                    value={formData.color_hover}
                    onChange={(e) => setFormData({ ...formData, color_hover: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color_hover}
                    onChange={(e) => setFormData({ ...formData, color_hover: e.target.value })}
                    placeholder="#FFB300"
                  />
                </div>
              </div>
            </div>

            {/* Imagem */}
            <div>
              <Label htmlFor="image_url" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                URL da Imagem
              </Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {/* Cidades */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                Cidades
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
                  placeholder="Nome da cidade"
                />
                <Button type="button" onClick={addCity} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cities.map((city, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {city}
                    <button
                      onClick={() => removeCity(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Destaques */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4" />
                Destaques
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  placeholder="Ex: Flutuação, Pesca esportiva..."
                />
                <Button type="button" onClick={addHighlight} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {highlights.map((highlight, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {highlight}
                    <button
                      onClick={() => removeHighlight(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ordem e Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order_index">Ordem de Exibição</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Região Ativa</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Gerenciar Detalhes da Região */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Gerenciar Detalhes - {editingRegionForDetails?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Texto Promocional */}
            <div>
              <Label htmlFor="promotional_text">Texto Promocional</Label>
              <Textarea
                id="promotional_text"
                value={detailsData.promotional_text}
                onChange={(e) => setDetailsData({ ...detailsData, promotional_text: e.target.value })}
                placeholder="Texto promocional sobre a região..."
                rows={4}
              />
            </div>

            {/* Vídeo */}
            <div>
              <Label htmlFor="video_url">URL do Vídeo (YouTube)</Label>
              <Input
                id="video_url"
                value={detailsData.video_url}
                onChange={(e) => setDetailsData({ ...detailsData, video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {detailsData.video_url && (
                <div className="mt-2">
                  <iframe
                    src={detailsData.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
                      ? `https://www.youtube.com/embed/${detailsData.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]}`
                      : detailsData.video_url}
                    className="w-full h-48 rounded"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Localização no Mapa */}
            <div>
              <Label>Localização no Mapa</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  value={detailsData.map_latitude}
                  onChange={(e) => setDetailsData({ ...detailsData, map_latitude: e.target.value })}
                  className="flex-1 bg-gray-50"
                  readOnly
                />
                <Input
                  placeholder="Longitude"
                  type="number"
                  step="any"
                  value={detailsData.map_longitude}
                  onChange={(e) => setDetailsData({ ...detailsData, map_longitude: e.target.value })}
                  className="flex-1 bg-gray-50"
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLocationPicker(true)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Escolher no Mapa
                </Button>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <Label htmlFor="highlights">Principais Atrações (uma por linha)</Label>
              <Textarea
                id="highlights"
                value={detailsData.highlights}
                onChange={(e) => setDetailsData({ ...detailsData, highlights: e.target.value })}
                placeholder="Flutuação em rios cristalinos&#10;Cachoeiras paradisíacas&#10;Grutas e cavernas"
                rows={4}
              />
            </div>

            {/* Como Chegar e Melhor Época */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="how_to_get_there">Como Chegar</Label>
                <Textarea
                  id="how_to_get_there"
                  value={detailsData.how_to_get_there}
                  onChange={(e) => setDetailsData({ ...detailsData, how_to_get_there: e.target.value })}
                  placeholder="Instruções de como chegar..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="best_time_to_visit">Melhor Época</Label>
                <Textarea
                  id="best_time_to_visit"
                  value={detailsData.best_time_to_visit}
                  onChange={(e) => setDetailsData({ ...detailsData, best_time_to_visit: e.target.value })}
                  placeholder="De março a novembro..."
                  rows={3}
                />
              </div>
            </div>

            {/* Contato */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">Telefone</Label>
                <Input
                  id="contact_phone"
                  value={detailsData.contact_phone}
                  onChange={(e) => setDetailsData({ ...detailsData, contact_phone: e.target.value })}
                  placeholder="(67) 3318-7600"
                />
              </div>
              <div>
                <Label htmlFor="contact_email">E-mail</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={detailsData.contact_email}
                  onChange={(e) => setDetailsData({ ...detailsData, contact_email: e.target.value })}
                  placeholder="contato@regiao.com"
                />
              </div>
            </div>

            {/* Links Oficiais */}
            <div>
              <Label htmlFor="official_website">Site Oficial</Label>
              <Input
                id="official_website"
                value={detailsData.official_website}
                onChange={(e) => setDetailsData({ ...detailsData, official_website: e.target.value })}
                placeholder="https://www.regiao.com"
              />
            </div>

            {/* Redes Sociais */}
            <div>
              <Label>Redes Sociais</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Input
                  placeholder="Instagram URL"
                  value={detailsData.social_instagram}
                  onChange={(e) => setDetailsData({ ...detailsData, social_instagram: e.target.value })}
                />
                <Input
                  placeholder="Facebook URL"
                  value={detailsData.social_facebook}
                  onChange={(e) => setDetailsData({ ...detailsData, social_facebook: e.target.value })}
                />
                <Input
                  placeholder="YouTube URL"
                  value={detailsData.social_youtube}
                  onChange={(e) => setDetailsData({ ...detailsData, social_youtube: e.target.value })}
                />
              </div>
            </div>

            {/* Galeria de Imagens */}
            <div>
              <Label>Galeria de Imagens</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryFileSelect}
                  className="flex-1"
                />
              </div>
              {(galleryImages.length > 0 || galleryPreviews.length > 0) && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {galleryImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Galeria ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                        onClick={() => removeGalleryImage(index, false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {galleryPreviews.map((preview, index) => (
                    <div key={`preview-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                        onClick={() => removeGalleryImage(galleryImages.length + index, true)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDetails} disabled={uploadingDetails}>
              {uploadingDetails && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Detalhes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LocationPicker para selecionar coordenadas */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={
          detailsData.map_latitude && detailsData.map_longitude
            ? {
                latitude: parseFloat(detailsData.map_latitude),
                longitude: parseFloat(detailsData.map_longitude),
              }
            : undefined
        }
      />
    </div>
  );
}



