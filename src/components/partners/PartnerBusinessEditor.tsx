// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Save, Building2, Globe, Phone, MapPin, Image as ImageIcon } from 'lucide-react';

interface PartnerData {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  contact_phone?: string;
  address?: string;
  gallery_images?: string[];
  youtube_url?: string;
}

interface PartnerBusinessEditorProps {
  partnerId: string;
  onUpdate?: () => void;
}

export default function PartnerBusinessEditor({ partnerId, onUpdate }: PartnerBusinessEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  useEffect(() => {
    loadPartnerData();
  }, [partnerId]);

  const loadPartnerData = async () => {
    try {

      const { data, error } = await supabase
        .from('institutional_partners')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (error) throw error;

      setPartnerData(data);

      if (data.logo_url) {
        setLogoPreview(data.logo_url);
      } else {
        setLogoPreview(null);
      }
      
      if (data.gallery_images && Array.isArray(data.gallery_images) && data.gallery_images.length > 0) {
        setGalleryPreviews(data.gallery_images);
      } else {
        setGalleryPreviews([]);
      }
    } catch (error: unknown) {
      
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do parceiro',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 5MB',
          variant: 'destructive',
        });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...galleryFiles, ...files].slice(0, 5);
    
    if (newFiles.length > 5) {
      toast({
        title: 'Limite de fotos',
        description: 'Você pode enviar no máximo 5 fotos na galeria',
        variant: 'destructive',
      });
      return;
    }

    setGalleryFiles(newFiles);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setGalleryPreviews([...galleryPreviews, ...newPreviews].slice(0, 5));
  };

  const removeGalleryImage = (index: number) => {
    // Se for uma imagem já salva (URL do Supabase), precisa atualizar o banco
    const preview = galleryPreviews[index];
    const isSupabaseUrl = preview && typeof preview === 'string' && preview.includes('supabase.co');
    
    if (isSupabaseUrl && partnerData?.gallery_images) {
      // Remover do banco também
      const newGalleryImages = partnerData.gallery_images.filter((_, i) => i !== index);
      setPartnerData({ ...partnerData, gallery_images: newGalleryImages });
      setGalleryPreviews(newGalleryImages);
    } else {
      // Apenas remover preview temporário
      const newFiles = galleryFiles.filter((_, i) => i !== index);
      const newPreviews = galleryPreviews.filter((_, i) => i !== index);
      setGalleryFiles(newFiles);
      setGalleryPreviews(newPreviews);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return partnerData?.logo_url || null;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${partnerId}/logo_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('partner-images')
      .upload(fileName, logoFile, { upsert: true });

    if (error) {
      console.error('Erro ao fazer upload do logo:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('partner-images')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  };

  const uploadGalleryImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < galleryFiles.length; i++) {
      const file = galleryFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${partnerId}/gallery_${Date.now()}_${i}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('partner-images')
        .upload(fileName, file);

      if (error) {
        console.error('Erro ao fazer upload:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('partner-images')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    // Manter imagens existentes que não foram removidas
    const existingImages = partnerData?.gallery_images || [];
    const keptExisting = existingImages.slice(0, Math.max(0, 5 - uploadedUrls.length));

    return [...uploadedUrls, ...keptExisting].slice(0, 5);
  };

  const handleSave = async () => {
    if (!partnerData) return;

    setSaving(true);
    try {

      let logoUrl = partnerData.logo_url;
      let galleryUrls = partnerData.gallery_images || [];

      // Upload do logo se houver novo arquivo
      if (logoFile) {
        
        logoUrl = await uploadLogo();
      }

      // Upload das imagens da galeria se houver novos arquivos
      if (galleryFiles.length > 0) {
        
        galleryUrls = await uploadGalleryImages();
      }

      // Atualizar dados no banco
      const { data: updateData, error } = await supabase
        .from('institutional_partners')
        .update({
          name: partnerData.name,
          description: partnerData.description || null,
          logo_url: logoUrl,
          website_url: partnerData.website_url || null,
          contact_phone: partnerData.contact_phone || null,
          address: partnerData.address || null,
          gallery_images: galleryUrls,
          youtube_url: partnerData.youtube_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnerId)
        .select();

      if (error) throw error;

      // Atualizar estados locais imediatamente com os dados salvos
      if (updateData && updateData[0]) {
        setPartnerData(updateData[0]);
        if (updateData[0].logo_url) {
          setLogoPreview(updateData[0].logo_url);
        }
        if (updateData[0].gallery_images && Array.isArray(updateData[0].gallery_images)) {
          setGalleryPreviews(updateData[0].gallery_images);
        }
      }

      toast({
        title: 'Salvo com sucesso!',
        description: 'As informações do seu negócio foram atualizadas',
      });

      // Limpar arquivos temporários
      setLogoFile(null);
      setGalleryFiles([]);

      if (onUpdate) onUpdate();
      
      // Recarregar dados do banco para garantir sincronização
      await loadPartnerData();
    } catch (error: unknown) {
      
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as alterações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!partnerData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">Parceiro não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle className="flex items-center gap-2 text-ms-primary-blue">
            <Building2 className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
          <CardDescription>
            Atualize as informações do seu negócio que aparecem na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input
              id="name"
              value={partnerData.name}
              onChange={(e) => setPartnerData({ ...partnerData, name: e.target.value })}
              placeholder="Nome oficial da empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={partnerData.description || ''}
              onChange={(e) => setPartnerData({ ...partnerData, description: e.target.value })}
              placeholder="Descreva seu negócio..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <Input
                  id="website"
                  type="url"
                  value={partnerData.website_url || ''}
                  onChange={(e) => setPartnerData({ ...partnerData, website_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  value={partnerData.contact_phone || ''}
                  onChange={(e) => setPartnerData({ ...partnerData, contact_phone: e.target.value })}
                  placeholder="(67) 99999-9999"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <Input
                id="address"
                value={partnerData.address || ''}
                onChange={(e) => setPartnerData({ ...partnerData, address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube">URL do Vídeo (YouTube)</Label>
            <Input
              id="youtube"
              type="url"
              value={partnerData.youtube_url || ''}
              onChange={(e) => setPartnerData({ ...partnerData, youtube_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle className="flex items-center gap-2 text-ms-primary-blue">
            <ImageIcon className="w-5 h-5" />
            Imagens
          </CardTitle>
          <CardDescription>
            Logo e galeria de fotos do seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      
                      console.error('Erro ao carregar logo:', logoPreview);
                    }}
                    onLoad={() => {
                      
                    }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400 text-xs">
                  Sem logo
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Label htmlFor="logo-upload">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {logoPreview ? 'Alterar Logo' : 'Enviar Logo'}
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Galeria de Fotos (máximo 5)</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {galleryPreviews.map((preview, index) => {

                return (
                  <div key={index} className="relative group">
                    {preview ? (
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          
                          console.error('Erro ao carregar imagem da galeria:', preview);
                        }}
                        onLoad={() => {
                          
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400 text-xs">
                        Sem imagem
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
              {galleryPreviews.length < 5 && (
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                    id="gallery-upload"
                    multiple
                  />
                  <Label htmlFor="gallery-upload">
                    <div className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-ms-primary-blue transition-colors">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                  </Label>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          size="lg"
          className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

