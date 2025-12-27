import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, Plus, Edit, Trash2, Image as ImageIcon, 
  Video, X, Upload, Loader2, Globe, Phone, Mail,
  Instagram, Facebook, Youtube, ExternalLink, Star
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import LocationPicker from '@/components/admin/LocationPicker';

interface Destination {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  region: string | null;
  image_url: string | null;
  city_id: string | null;
  state_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface DestinationDetails {
  id: string;
  destination_id: string;
  promotional_text: string | null;
  video_url: string | null;
  video_type: 'youtube' | 'upload' | null;
  map_latitude: number | null;
  map_longitude: number | null;
  address: string | null; // Novo campo para endereço
  tourism_tags: string[] | null;
  image_gallery: string[] | null;
  official_website: string | null;
  social_links: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  } | null;
  contact_phone: string | null;
  contact_email: string | null;
  highlights: string[] | null;
  how_to_get_there: string | null;
  best_time_to_visit: string | null;
}

const BUCKET_NAME = 'tourism-images';

export default function DestinationManager() {
  const { toast } = useToast();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [editingDetails, setEditingDetails] = useState<DestinationDetails | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    region: '',
    image_url: '',
  });

  const [detailsData, setDetailsData] = useState({
    promotional_text: '',
    video_url: '',
    video_type: 'youtube' as 'youtube' | 'upload' | null,
    map_latitude: '',
    map_longitude: '',
    address: '', // Novo campo para endereço
    tourism_tags: '',
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
  
  // Estados para imagem principal e localização
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    setLoading(true);
    try {
      console.log('🔍 [DestinationManager] Carregando destinos...');
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ [DestinationManager] Erro ao carregar destinos:', error);
        throw error;
      }

      console.log(`✅ [DestinationManager] ${data?.length || 0} destinos carregados:`, data);
      setDestinations(data || []);
      
      if (!data || data.length === 0) {
        console.warn('⚠️ [DestinationManager] Nenhum destino encontrado no banco de dados');
        toast({
          title: 'Nenhum destino encontrado',
          description: 'Não há destinos cadastrados no banco de dados. Crie um novo destino para começar.',
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('❌ [DestinationManager] Erro ao carregar destinos:', error);
      toast({
        title: 'Erro ao carregar destinos',
        description: error.message || 'Erro desconhecido ao carregar destinos',
        variant: 'destructive',
      });
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDestinationDetails = async (destinationId: string) => {
    try {
      const { data, error } = await supabase
        .from('destination_details')
        .select('*')
        .eq('destination_id', destinationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      if (data) {
        setEditingDetails(data);
        setDetailsData({
          promotional_text: data.promotional_text || '',
          video_url: data.video_url || '',
          video_type: (data.video_type as 'youtube' | 'upload' | null) || 'youtube',
          map_latitude: data.map_latitude?.toString() || '',
          map_longitude: data.map_longitude?.toString() || '',
          address: data.address || '', // Novo campo
          tourism_tags: data.tourism_tags?.join(', ') || '',
          official_website: data.official_website || '',
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          highlights: data.highlights?.join('\n') || '',
          how_to_get_there: data.how_to_get_there || '',
          best_time_to_visit: data.best_time_to_visit || '',
          social_instagram: (data.social_links as any)?.instagram || '',
          social_facebook: (data.social_links as any)?.facebook || '',
          social_youtube: (data.social_links as any)?.youtube || '',
        });
        setGalleryImages(data.image_gallery || []);
        // Carregar preview da imagem principal se houver
        if (editingDestination?.image_url) {
          setMainImagePreview(editingDestination.image_url);
        }
      } else {
        // Reset if no details found
        setEditingDetails(null);
        setDetailsData({
          promotional_text: '',
          video_url: '',
          video_type: 'youtube',
          map_latitude: '',
          map_longitude: '',
          address: '', // Novo campo
          tourism_tags: '',
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
    } catch (error: any) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingDestination(null);
    setEditingDetails(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      region: '',
      image_url: '',
    });
    setDetailsData({
      promotional_text: '',
      video_url: '',
      video_type: 'youtube',
      map_latitude: '',
      map_longitude: '',
      address: '', // Novo campo
      tourism_tags: '',
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
    setNewGalleryFiles([]);
    setGalleryPreviews([]);
    setMainImageFile(null);
    setMainImagePreview(null);
    setDialogOpen(true);
  };

  const openEditDialog = async (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      description: destination.description || '',
      location: destination.location || '',
      region: destination.region || '',
      image_url: destination.image_url || '',
    });
    await loadDestinationDetails(destination.id);
    // Carregar preview da imagem principal se houver
    if (destination.image_url) {
      setMainImagePreview(destination.image_url);
    }
    setMainImageFile(null); // Reset arquivo ao editar
    setDialogOpen(true);
  };

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewGalleryFiles([...newGalleryFiles, ...files]);
    
    // Criar previews
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

  // Função para upload de imagem principal (similar aos avatares)
  const uploadMainImage = async (destinationId: string): Promise<string | null> => {
    if (!mainImageFile) return null;

    try {
      const fileExt = mainImageFile.name.split('.').pop();
      const fileName = `destinations/${destinationId}/main_${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, mainImageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Se o bucket não existir, apenas avisar mas continuar sem upload de imagem
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          console.warn('⚠️ [DestinationManager] Bucket não encontrado, continuando sem upload de imagem');
          toast({
            title: 'Bucket não encontrado',
            description: 'O bucket "tourism-images" não existe. Execute o SQL em supabase/create_tourism_images_bucket.sql para criá-lo. O destino será salvo preservando a URL existente se houver.',
            variant: 'default',
            duration: 10000,
          });
          // Retornar URL existente se houver, senão null
          return formData.image_url || null;
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || null;
    } catch (error: any) {
      console.error('Erro no upload da imagem principal:', error);
      // Preservar URL existente se upload falhar
      return formData.image_url || null;
    }
  };

  // Função para selecionar imagem principal
  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setMainImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setMainImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Função para selecionar localização do LocationPicker
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
      address: location.address || location.name || '', // Usar endereço do LocationPicker
    });
    setShowLocationPicker(false);
  };

  const uploadGalleryImages = async (destinationId: string): Promise<string[]> => {
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
        const fileName = `destinations/${destinationId}/${uuidv4()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

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

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome do destino é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      let destinationId = editingDestination?.id;

      // Preservar URL original do destino sendo editado
      const originalImageUrl = editingDestination?.image_url || formData.image_url || '';
      let finalImageUrl = originalImageUrl;

      // Salvar ou atualizar destino PRIMEIRO para obter o ID
      if (editingDestination) {
        const { error } = await supabase
          .from('destinations')
          .update({
            name: formData.name,
            description: formData.description || null,
            location: formData.location || null,
            region: formData.region || null,
            image_url: formData.image_url || null, // Temporário, será atualizado após upload
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingDestination.id);

        if (error) throw error;
        destinationId = editingDestination.id;
      } else {
        const { data, error } = await supabase
          .from('destinations')
          .insert({
            name: formData.name,
            description: formData.description || null,
            location: formData.location || null,
            region: formData.region || null,
            image_url: formData.image_url || null, // Temporário, será atualizado após upload
          })
          .select()
          .single();

        if (error) throw error;
        destinationId = data.id;
      }

      // Upload da imagem principal se houver nova (agora temos o destinationId)
      if (mainImageFile && destinationId) {
        console.log('📤 [DestinationManager] Iniciando upload de imagem principal...');
        const uploadedUrl = await uploadMainImage(destinationId);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          console.log('✅ [DestinationManager] Imagem principal enviada com sucesso:', uploadedUrl);
          
          // Atualizar destino com a URL da imagem enviada
          const { error: updateError } = await supabase
            .from('destinations')
            .update({ image_url: finalImageUrl })
            .eq('id', destinationId);
          
          if (updateError) {
            console.error('Erro ao atualizar URL da imagem:', updateError);
          }
        } else {
          console.warn('⚠️ [DestinationManager] Upload de imagem principal falhou, preservando URL existente');
          // Preservar URL original se o upload falhar
          if (originalImageUrl && originalImageUrl.trim()) {
            finalImageUrl = originalImageUrl;
            console.log('✅ [DestinationManager] Preservando URL original do destino:', finalImageUrl);
          }
        }
      } else {
        // Se não há arquivo novo, usar a URL do formulário (que pode ter sido atualizada manualmente)
        finalImageUrl = formData.image_url || originalImageUrl;
      }

      // Upload de novas imagens da galeria
      const newUploadedUrls = await uploadGalleryImages(destinationId);
      // IMPORTANTE: Usar galleryImages atualizado (já com imagens removidas pelo usuário) + novas imagens
      const allGalleryImages = [...galleryImages, ...newUploadedUrls];
      
      console.log('🖼️ [DestinationManager] Galeria sendo salva:', {
        galleryImages_count: galleryImages.length,
        newUploadedUrls_count: newUploadedUrls.length,
        allGalleryImages_count: allGalleryImages.length,
        galleryImages: galleryImages,
        allGalleryImages: allGalleryImages
      });

      // Preparar dados de detalhes - IMPORTANTE: sempre retornar arrays (mesmo vazios)
      const tourismTags = detailsData.tourism_tags
        ? detailsData.tourism_tags.split(',').map(t => t.trim()).filter(t => t)
        : [];

      const highlights = detailsData.highlights
        ? detailsData.highlights.split('\n').map(h => h.trim()).filter(h => h)
        : [];

      const socialLinks = {
        ...(detailsData.social_instagram && { instagram: detailsData.social_instagram }),
        ...(detailsData.social_facebook && { facebook: detailsData.social_facebook }),
        ...(detailsData.social_youtube && { youtube: detailsData.social_youtube }),
      };

      // Validar e converter strings vazias para null
      // IMPORTANTE: Manter a string se não estiver vazia, apenas trim
      const videoUrlRaw = detailsData.video_url?.trim();
      const videoUrl = videoUrlRaw && videoUrlRaw.length > 0 ? videoUrlRaw : null;
      
      const mapLat = detailsData.map_latitude?.trim() 
        ? (isNaN(parseFloat(detailsData.map_latitude)) ? null : parseFloat(detailsData.map_latitude))
        : null;
      const mapLng = detailsData.map_longitude?.trim()
        ? (isNaN(parseFloat(detailsData.map_longitude)) ? null : parseFloat(detailsData.map_longitude))
        : null;

      console.log('💾 [DestinationManager] Salvando detalhes:', {
        video_url_raw: detailsData.video_url,
        video_url_trimmed: videoUrlRaw,
        video_url_final: videoUrl,
        video_url_length: detailsData.video_url?.length,
        map_latitude: mapLat,
        map_longitude: mapLng,
        map_latitude_raw: detailsData.map_latitude,
        map_longitude_raw: detailsData.map_longitude,
      });

      const detailsPayload = {
        destination_id: destinationId,
        promotional_text: detailsData.promotional_text?.trim() || null,
        video_url: videoUrl,
        video_type: detailsData.video_type,
        map_latitude: mapLat,
        map_longitude: mapLng,
        address: detailsData.address?.trim() || null,
        // IMPORTANTE: Sempre salvar arrays (mesmo vazios) para garantir que sejam atualizados
        tourism_tags: tourismTags,
        image_gallery: allGalleryImages,
        official_website: detailsData.official_website?.trim() || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        contact_phone: detailsData.contact_phone?.trim() || null,
        contact_email: detailsData.contact_email?.trim() || null,
        // IMPORTANTE: Arrays já são arrays (não null), então salvar diretamente
        highlights: highlights,
        how_to_get_there: detailsData.how_to_get_there?.trim() || null,
        best_time_to_visit: detailsData.best_time_to_visit?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Salvar ou atualizar detalhes
      console.log('💾 [DestinationManager] Payload completo sendo enviado:', JSON.stringify(detailsPayload, null, 2));
      
      if (editingDetails) {
        console.log('💾 [DestinationManager] Atualizando detalhes existentes:', editingDetails.id);
        const { data: updateData, error } = await supabase
          .from('destination_details')
          .update(detailsPayload)
          .eq('id', editingDetails.id)
          .select()
          .single();

        if (error) {
          console.error('❌ [DestinationManager] Erro ao atualizar detalhes:', error);
          throw error;
        }
        console.log('✅ [DestinationManager] Detalhes atualizados:', updateData);
        console.log('✅ [DestinationManager] video_url salvo no banco:', updateData.video_url);
      } else {
        console.log('💾 [DestinationManager] Criando novos detalhes');
        const { data: insertData, error } = await supabase
          .from('destination_details')
          .insert(detailsPayload)
          .select()
          .single();

        if (error) {
          console.error('❌ [DestinationManager] Erro ao criar detalhes:', error);
          throw error;
        }
        console.log('✅ [DestinationManager] Detalhes criados:', insertData);
        console.log('✅ [DestinationManager] video_url salvo no banco:', insertData.video_url);
        console.log('✅ [DestinationManager] image_gallery salvo no banco:', insertData.image_gallery);
        console.log('✅ [DestinationManager] highlights salvos no banco:', insertData.highlights);
      }

      toast({
        title: 'Sucesso',
        description: `Destino ${editingDestination ? 'atualizado' : 'criado'} com sucesso!`,
      });

      setDialogOpen(false);
      loadDestinations();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar destino',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este destino?')) return;

    try {
      // Deletar detalhes primeiro
      await supabase
        .from('destination_details')
        .delete()
        .eq('destination_id', id);

      // Deletar destino
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Destino excluído com sucesso!',
      });

      loadDestinations();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir destino',
        variant: 'destructive',
      });
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gerenciar Destinos</h2>
          <p className="text-muted-foreground">Crie e edite destinos turísticos do Descubra MS</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Destino
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : destinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-muted/50 rounded-lg border-2 border-dashed">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum destino encontrado</h3>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            Não há destinos cadastrados no sistema. Clique em "Novo Destino" para criar o primeiro destino.
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Destino
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((destination) => (
            <Card key={destination.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{destination.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {destination.location || 'Sem localização'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{destination.region || 'N/A'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {destination.image_url && (
                  <img
                    src={destination.image_url}
                    alt={destination.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {destination.description || 'Sem descrição'}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(destination)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(destination.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDestination ? 'Editar Destino' : 'Novo Destino'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Destino *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Bonito"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do destino..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Bonito - MS"
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Região</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="Ex: Sudoeste"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="image_url">Imagem Principal</Label>
                  <div className="space-y-2">
                    {/* Preview da imagem */}
                    {(mainImagePreview || formData.image_url) && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <img
                          src={mainImagePreview || formData.image_url || ''}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.warn('Erro ao carregar imagem:', mainImagePreview || formData.image_url);
                            const placeholderSvg = `data:image/svg+xml,${encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                              <rect width="400" height="300" fill="#e5e7eb"/>
                              <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
                                Imagem não disponível
                              </text>
                            </svg>`)}`;
                            (e.target as HTMLImageElement).src = placeholderSvg;
                          }}
                        />
                        {mainImageFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setMainImageFile(null);
                              setMainImagePreview(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {/* Upload de arquivo */}
                    <div className="flex gap-2">
                      <Input
                        id="main_image_file"
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageSelect}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          document.getElementById('main_image_file')?.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    
                    {/* URL manual (fallback) */}
                    <div>
                      <Label htmlFor="image_url" className="text-xs text-muted-foreground">
                        Ou cole uma URL de imagem:
                      </Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes Avançados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes Avançados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="promotional_text">Texto Promocional</Label>
                  <Textarea
                    id="promotional_text"
                    value={detailsData.promotional_text}
                    onChange={(e) => setDetailsData({ ...detailsData, promotional_text: e.target.value })}
                    placeholder="Texto promocional sobre o destino..."
                    rows={3}
                  />
                </div>

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
                        src={getYouTubeEmbedUrl(detailsData.video_url)}
                        className="w-full h-48 rounded"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Endereço do Destino</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      value={detailsData.address}
                      onChange={(e) => setDetailsData({ ...detailsData, address: e.target.value })}
                      placeholder="Ex: Rua das Flores, 123, Bonito - MS"
                      className="flex-1"
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Digite o endereço ou clique em "Escolher no Mapa" para buscar e converter automaticamente em coordenadas
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="map_latitude">Latitude (preenchida automaticamente)</Label>
                    <Input
                      id="map_latitude"
                      type="number"
                      step="any"
                      value={detailsData.map_latitude}
                      onChange={(e) => setDetailsData({ ...detailsData, map_latitude: e.target.value })}
                      placeholder="-20.4697"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="map_longitude">Longitude (preenchida automaticamente)</Label>
                    <Input
                      id="map_longitude"
                      type="number"
                      step="any"
                      value={detailsData.map_longitude}
                      onChange={(e) => setDetailsData({ ...detailsData, map_longitude: e.target.value })}
                      placeholder="-54.6201"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tourism_tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tourism_tags"
                    value={detailsData.tourism_tags}
                    onChange={(e) => setDetailsData({ ...detailsData, tourism_tags: e.target.value })}
                    placeholder="Ecoturismo, Aventura, Natureza"
                  />
                </div>

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

                <div>
                  <Label htmlFor="how_to_get_there">Como Chegar</Label>
                  <Textarea
                    id="how_to_get_there"
                    value={detailsData.how_to_get_there}
                    onChange={(e) => setDetailsData({ ...detailsData, how_to_get_there: e.target.value })}
                    placeholder="Instruções de como chegar ao destino..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="best_time_to_visit">Melhor Época para Visitar</Label>
                  <Input
                    id="best_time_to_visit"
                    value={detailsData.best_time_to_visit}
                    onChange={(e) => setDetailsData({ ...detailsData, best_time_to_visit: e.target.value })}
                    placeholder="De março a novembro..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contato e Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contato e Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      placeholder="contato@destino.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="official_website">Site Oficial</Label>
                  <Input
                    id="official_website"
                    value={detailsData.official_website}
                    onChange={(e) => setDetailsData({ ...detailsData, official_website: e.target.value })}
                    placeholder="https://www.destino.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Redes Sociais</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Input
                        placeholder="Instagram URL"
                        value={detailsData.social_instagram}
                        onChange={(e) => setDetailsData({ ...detailsData, social_instagram: e.target.value })}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Facebook URL"
                        value={detailsData.social_facebook}
                        onChange={(e) => setDetailsData({ ...detailsData, social_facebook: e.target.value })}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="YouTube URL"
                        value={detailsData.social_youtube}
                        onChange={(e) => setDetailsData({ ...detailsData, social_youtube: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Galeria de Imagens */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Galeria de Imagens</CardTitle>
                <CardDescription>Adicione múltiplas imagens para o destino</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryFileSelect}
                    className="flex-1"
                  />
                </div>
                {(galleryImages.length > 0 || galleryPreviews.length > 0) && (
                  <div className="grid grid-cols-3 gap-4">
                    {galleryImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Gallery ${index + 1}`}
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
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={uploading}>
              {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LocationPicker para selecionar endereço e coordenadas */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={
          detailsData.map_latitude && detailsData.map_longitude
            ? {
                latitude: parseFloat(detailsData.map_latitude),
                longitude: parseFloat(detailsData.map_longitude),
                address: detailsData.address || undefined,
              }
            : undefined
        }
      />
    </div>
  );
}




