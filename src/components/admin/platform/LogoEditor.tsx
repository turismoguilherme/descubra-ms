import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { platformContentService } from '@/services/admin/platformContentService';
import { Upload, Loader2, Image as ImageIcon, Save, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

interface LogoEditorProps {
  platform: 'viajar' | 'descubra_ms';
}

const BUCKET_NAME = 'tourism-images';

const LOGO_CONFIGS = {
  viajar: {
    key: 'viajar_logo_url',
    label: 'Logo ViajARTur',
    description: 'Logo principal da plataforma ViajARTur',
    currentPath: '/images/logo-viajar.png',
  },
  descubra_ms: {
    key: 'ms_logo_url',
    label: 'Logo Descubra MS',
    description: 'Logo principal da plataforma Descubra Mato Grosso do Sul',
    currentPath: '/images/logo-descubra-ms.png',
  },
  guata: {
    key: 'guata_avatar_url',
    label: 'Avatar Guatá',
    description: 'Avatar do assistente virtual Guatá',
    currentPath: '/guata-mascote.jpg',
  },
};

export default function LogoEditor({ platform }: LogoEditorProps) {
  const { toast } = useToast();
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [originalLogos, setOriginalLogos] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Determinar quais logos mostrar baseado na plataforma
  const logosToShow = platform === 'viajar' 
    ? ['viajar', 'guata']
    : ['descubra_ms', 'guata'];

  useEffect(() => {
    loadLogos();
  }, [platform]);

  const loadLogos = async () => {
    setLoading(true);
    try {
      const logoKeys = logosToShow.map(l => LOGO_CONFIGS[l as keyof typeof LOGO_CONFIGS].key);
      const data = await platformContentService.getContent(logoKeys);
      
      const logoMap: Record<string, string> = {};
      data.forEach(item => {
        logoMap[item.content_key] = item.content_value || '';
      });

      // Se não houver no banco, usar caminho padrão
      logosToShow.forEach(logoKey => {
        const config = LOGO_CONFIGS[logoKey as keyof typeof LOGO_CONFIGS];
        if (!logoMap[config.key]) {
          logoMap[config.key] = config.currentPath;
        }
      });

      setLogos(logoMap);
      setOriginalLogos({ ...logoMap });
    } catch (error: any) {
      console.error('Erro ao carregar logos:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os logos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (logoKey: string, file: File | null) => {
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem válida.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setImageFiles(prev => ({ ...prev, [logoKey]: file }));

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews(prev => ({ ...prev, [logoKey]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (logoKey: string): Promise<string | null> => {
    const file = imageFiles[logoKey];
    if (!file) return logos[logoKey] || null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logos/${logoKey}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          toast({
            title: 'Aviso',
            description: 'Bucket de imagens não encontrado. Você pode usar uma URL manualmente.',
            variant: 'default',
          });
          return null;
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || null;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível fazer upload da imagem.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const saveLogo = async (logoKey: string) => {
    const config = LOGO_CONFIGS[logoKey as keyof typeof LOGO_CONFIGS];
    setSaving(prev => ({ ...prev, [logoKey]: true }));

    try {
      let imageUrl = '';

      // Se há arquivo selecionado, fazer upload primeiro
      if (imageFiles[logoKey]) {
        setUploading(prev => ({ ...prev, [logoKey]: true }));
        try {
          const uploadedUrl = await uploadImage(logoKey);
          setUploading(prev => ({ ...prev, [logoKey]: false }));
          
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
            setLogos(prev => ({ ...prev, [config.key]: uploadedUrl }));
          } else {
            // Se o upload falhou, não continuar
            setSaving(prev => ({ ...prev, [logoKey]: false }));
            toast({
              title: 'Erro no upload',
              description: 'Não foi possível fazer upload da imagem. Tente novamente ou use uma URL.',
              variant: 'destructive',
            });
            return;
          }
        } catch (uploadError: any) {
          setUploading(prev => ({ ...prev, [logoKey]: false }));
          setSaving(prev => ({ ...prev, [logoKey]: false }));
          throw uploadError;
        }
      } else {
        // Se não há arquivo, usar a URL editada manualmente
        imageUrl = (logos[config.key] || '').trim();
        console.log('💾 [LogoEditor] Salvando URL manual:', imageUrl);
      }

      // Validar que temos uma URL para salvar
      if (!imageUrl || imageUrl.trim() === '') {
        setSaving(prev => ({ ...prev, [logoKey]: false }));
        toast({
          title: 'URL inválida',
          description: 'Por favor, selecione uma imagem ou forneça uma URL válida.',
          variant: 'destructive',
        });
        return;
      }

      console.log('💾 Salvando logo:', {
        key: config.key,
        url: imageUrl.trim(),
        type: 'image',
        description: config.description
      });

      // Salvar no banco de dados
      try {
        console.log('💾 Tentando salvar logo no banco:', {
          key: config.key,
          value: imageUrl.trim(),
          type: 'image',
          description: config.description
        });
        
        await platformContentService.upsertContent(
          config.key,
          imageUrl.trim(),
          'image',
          config.description
        );
        
        console.log('✅ Logo salvo com sucesso no banco');
        
        // Verificar se foi salvo corretamente
        const verification = await platformContentService.getContent([config.key]);
        console.log('🔍 Verificação após salvar:', verification);
        
        if (verification.length === 0 || !verification[0].content_value) {
          throw new Error('Logo não foi salvo corretamente. Verifique as permissões do banco de dados.');
        }
      } catch (upsertError: any) {
        console.error('❌ Erro no upsertContent:', upsertError);
        console.error('❌ Detalhes do erro:', {
          message: upsertError.message,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint
        });
        throw new Error(`Erro ao salvar no banco: ${upsertError.message || upsertError.details || 'Erro desconhecido'}`);
      }

      // Atualizar estados
      setOriginalLogos(prev => ({ ...prev, [config.key]: imageUrl.trim() }));
      setSaved(prev => ({ ...prev, [logoKey]: true }));
      setImageFiles(prev => ({ ...prev, [logoKey]: null }));
      setImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[logoKey];
        return newPreviews;
      });

      // Recarregar logos para garantir sincronização
      await loadLogos();

      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('logo-updated', { 
        detail: { key: config.key, url: imageUrl.trim() } 
      }));

      toast({
        title: 'Salvo!',
        description: `${config.label} foi salvo com sucesso. A mudança aparecerá na plataforma em até 30 segundos, ou recarregue a página para ver imediatamente.`,
      });

      setTimeout(() => {
        setSaved(prev => ({ ...prev, [logoKey]: false }));
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao salvar logo:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar o logo. Verifique o console para mais detalhes.',
        variant: 'destructive',
      });
    } finally {
      setSaving(prev => ({ ...prev, [logoKey]: false }));
      setUploading(prev => ({ ...prev, [logoKey]: false }));
    }
  };

  const hasChanges = (logoKey: string): boolean => {
    const config = LOGO_CONFIGS[logoKey as keyof typeof LOGO_CONFIGS];
    const current = (logos[config.key] || '').trim();
    const original = (originalLogos[config.key] || '').trim();
    const hasFile = !!imageFiles[logoKey];
    const urlChanged = current !== original;
    
    return urlChanged || hasFile;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Editar Logos
        </h2>
        <p className="text-muted-foreground">
          Faça upload de logos para as plataformas. Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 2MB.
        </p>
      </div>

      {logosToShow.map(logoKey => {
        const config = LOGO_CONFIGS[logoKey as keyof typeof LOGO_CONFIGS];
        const currentUrl = logos[config.key] || config.currentPath;
        const preview = imagePreviews[logoKey] || currentUrl;
        const isUploading = uploading[logoKey];
        const isSaving = saving[logoKey];
        const isSaved = saved[logoKey];
        const changed = hasChanges(logoKey);

        return (
          <Card key={logoKey}>
            <CardHeader>
              <CardTitle>{config.label}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview da imagem */}
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-32 border-2 border-dashed border-muted rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt={config.label}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor={`file-${logoKey}`}>Selecionar Imagem</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`file-${logoKey}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleImageSelect(logoKey, file);
                      }}
                      disabled={isUploading || isSaving}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => saveLogo(logoKey)}
                      disabled={isUploading || isSaving || !changed}
                      className={cn(
                        isSaved && "bg-green-500 hover:bg-green-600",
                        !changed && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isUploading || isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isUploading ? 'Enviando...' : 'Salvando...'}
                        </>
                      ) : isSaved ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Salvo!
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </Button>
                  </div>
                  {currentUrl && (
                    <p className="text-xs text-muted-foreground">
                      URL atual: {currentUrl.length > 60 ? `${currentUrl.substring(0, 60)}...` : currentUrl}
                    </p>
                  )}
                </div>
              </div>

              {/* Input manual de URL */}
              <div className="space-y-2">
                <Label htmlFor={`url-${logoKey}`}>Ou cole uma URL</Label>
                <Input
                  id={`url-${logoKey}`}
                  type="url"
                  value={logos[config.key] || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setLogos(prev => ({ ...prev, [config.key]: newValue }));
                    // Limpar arquivo selecionado quando editar URL manualmente
                    setImageFiles(prev => ({ ...prev, [logoKey]: null }));
                    setImagePreviews(prev => {
                      const newPreviews = { ...prev };
                      delete newPreviews[logoKey];
                      return newPreviews;
                    });
                  }}
                  placeholder="https://exemplo.com/logo.png"
                  disabled={isUploading || isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  {changed && !imageFiles[logoKey] && 'Clique em "Salvar" para salvar a URL editada.'}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
















