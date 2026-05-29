// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

type LogoConfig = {
  id: string;
  key: string;
  label: string;
  description: string;
  currentPath: string;
  uploadFolder: string;
};

const VIAJAR_LOGOS: LogoConfig[] = [
  {
    id: 'viajar',
    key: 'viajar_logo_url',
    label: 'Logo Guatá Labs',
    description: 'Logo principal da landing Guatá Labs',
    currentPath: '/images/logo-viajar.png',
    uploadFolder: 'logos/viajar',
  },
  {
    id: 'guata_navbar',
    key: 'guata_navbar_logo_url',
    label: 'Logo no header (navbar)',
    description: 'Exibida na barra de navegação da landing Guatá Labs',
    currentPath: '/images/logo-viajar.png',
    uploadFolder: 'guata-labs/logos',
  },
  {
    id: 'guata_hero',
    key: 'guata_mascot_hero',
    label: 'Mascote no hero',
    description: 'Imagem grande ao lado do título na landing Guatá Labs',
    currentPath: '/guata-mascote.jpg',
    uploadFolder: 'guata-labs/mascots',
  },
  {
    id: 'guata_avatar',
    key: 'guata_avatar_url',
    label: 'Avatar Guatá (chat)',
    description: 'Avatar do assistente virtual Guatá no chat do Descubra MS',
    currentPath: '/guata-mascote.jpg',
    uploadFolder: 'logos/guata',
  },
];

const DESCUBRA_MS_LOGOS: LogoConfig[] = [
  {
    id: 'descubra_ms',
    key: 'ms_logo_url',
    label: 'Logo Descubra MS',
    description: 'Logo principal da plataforma Descubra Mato Grosso do Sul',
    currentPath: '/images/logo-descubra-ms.png',
    uploadFolder: 'logos/descubra_ms',
  },
  {
    id: 'guata_avatar',
    key: 'guata_avatar_url',
    label: 'Avatar Guatá (chat)',
    description: 'Avatar do assistente virtual Guatá no chat',
    currentPath: '/guata-mascote.jpg',
    uploadFolder: 'logos/guata',
  },
];

const BRAND_TEXT_FIELDS = [
  { key: 'guata_brand_name', label: 'Nome da marca (navbar/footer)', rows: 1 },
  { key: 'guata_brand_tagline', label: 'Tagline curta', rows: 2 },
];

export default function LogoEditor({ platform }: LogoEditorProps) {
  const { toast } = useToast();
  const logoConfigs = platform === 'viajar' ? VIAJAR_LOGOS : DESCUBRA_MS_LOGOS;
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [originalLogos, setOriginalLogos] = useState<Record<string, string>>({});
  const [brandTexts, setBrandTexts] = useState<Record<string, string>>({});
  const [originalBrandTexts, setOriginalBrandTexts] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [savingBrandTexts, setSavingBrandTexts] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogos();
  }, [platform]);

  const loadLogos = async () => {
    setLoading(true);
    try {
      const logoKeys = logoConfigs.map((c) => c.key);
      const textKeys = platform === 'viajar' ? BRAND_TEXT_FIELDS.map((f) => f.key) : [];
      const data = await platformContentService.getContent([...logoKeys, ...textKeys]);

      const logoMap: Record<string, string> = {};
      const textMap: Record<string, string> = {};
      data.forEach((item) => {
        if (textKeys.includes(item.content_key)) {
          textMap[item.content_key] = item.content_value || '';
        } else {
          logoMap[item.content_key] = item.content_value || '';
        }
      });

      logoConfigs.forEach((config) => {
        if (!logoMap[config.key]) {
          logoMap[config.key] = config.currentPath;
        }
      });

      setLogos(logoMap);
      setOriginalLogos({ ...logoMap });
      setBrandTexts(textMap);
      setOriginalBrandTexts({ ...textMap });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar logos:', err);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os logos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfigById = (logoId: string) => logoConfigs.find((c) => c.id === logoId)!;

  const handleImageSelect = (logoId: string, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem válida.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setImageFiles((prev) => ({ ...prev, [logoId]: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews((prev) => ({ ...prev, [logoId]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (logoId: string): Promise<string | null> => {
    const config = getConfigById(logoId);
    const file = imageFiles[logoId];
    if (!file) return logos[config.key] || null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${config.uploadFolder}/${config.key}-${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
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

      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      return publicUrlData?.publicUrl || null;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro no upload:', err);
      toast({
        title: 'Erro no upload',
        description: err.message || 'Não foi possível fazer upload da imagem.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const saveLogo = async (logoId: string) => {
    const config = getConfigById(logoId);
    setSaving((prev) => ({ ...prev, [logoId]: true }));

    try {
      let imageUrl = '';

      if (imageFiles[logoId]) {
        setUploading((prev) => ({ ...prev, [logoId]: true }));
        try {
          const uploadedUrl = await uploadImage(logoId);
          setUploading((prev) => ({ ...prev, [logoId]: false }));

          if (uploadedUrl) {
            imageUrl = uploadedUrl;
            setLogos((prev) => ({ ...prev, [config.key]: uploadedUrl }));
          } else {
            setSaving((prev) => ({ ...prev, [logoId]: false }));
            toast({
              title: 'Erro no upload',
              description: 'Não foi possível fazer upload da imagem. Tente novamente ou use uma URL.',
              variant: 'destructive',
            });
            return;
          }
        } catch (uploadError: unknown) {
          setUploading((prev) => ({ ...prev, [logoId]: false }));
          setSaving((prev) => ({ ...prev, [logoId]: false }));
          throw uploadError;
        }
      } else {
        imageUrl = (logos[config.key] || '').trim();
      }

      if (!imageUrl) {
        setSaving((prev) => ({ ...prev, [logoId]: false }));
        toast({
          title: 'URL inválida',
          description: 'Por favor, selecione uma imagem ou forneça uma URL válida.',
          variant: 'destructive',
        });
        return;
      }

      await platformContentService.upsertContent(
        config.key,
        imageUrl.trim(),
        'image',
        config.description,
      );

      const verification = await platformContentService.getContent([config.key]);
      if (verification.length === 0 || !verification[0].content_value) {
        throw new Error('Logo não foi salvo corretamente. Verifique as permissões do banco de dados.');
      }

      setOriginalLogos((prev) => ({ ...prev, [config.key]: imageUrl.trim() }));
      setSaved((prev) => ({ ...prev, [logoId]: true }));
      setImageFiles((prev) => ({ ...prev, [logoId]: null }));
      setImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[logoId];
        return newPreviews;
      });

      await loadLogos();

      const logoUrlWithCacheBust = imageUrl.trim().includes('supabase.co')
        ? `${imageUrl.trim()}${imageUrl.trim().includes('?') ? '&' : '?'}t=${Date.now()}`
        : imageUrl.trim();

      window.dispatchEvent(
        new CustomEvent('logo-updated', {
          detail: {
            key: config.key,
            url: logoUrlWithCacheBust,
            originalUrl: imageUrl.trim(),
            timestamp: Date.now(),
            label: config.label,
          },
        }),
      );

      toast({
        title: 'Salvo!',
        description: `${config.label} foi salvo com sucesso.`,
      });

      setTimeout(() => {
        setSaved((prev) => ({ ...prev, [logoId]: false }));
      }, 2000);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar logo:', err);
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Não foi possível salvar o logo.',
        variant: 'destructive',
      });
    } finally {
      setSaving((prev) => ({ ...prev, [logoId]: false }));
      setUploading((prev) => ({ ...prev, [logoId]: false }));
    }
  };

  const saveBrandTexts = async () => {
    setSavingBrandTexts(true);
    try {
      for (const field of BRAND_TEXT_FIELDS) {
        await platformContentService.upsertContent(
          field.key,
          brandTexts[field.key] ?? '',
          'text',
          'Guatá Labs — landing',
        );
      }
      setOriginalBrandTexts({ ...brandTexts });
      toast({ title: 'Textos da marca salvos' });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({ title: 'Erro ao salvar textos', description: err.message, variant: 'destructive' });
    } finally {
      setSavingBrandTexts(false);
    }
  };

  const hasChanges = (logoId: string): boolean => {
    const config = getConfigById(logoId);
    const current = (logos[config.key] || '').trim();
    const original = (originalLogos[config.key] || '').trim();
    return current !== original || !!imageFiles[logoId];
  };

  const brandTextsChanged = BRAND_TEXT_FIELDS.some(
    (f) => (brandTexts[f.key] ?? '') !== (originalBrandTexts[f.key] ?? ''),
  );

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
        <h2 className="text-2xl font-bold text-foreground mb-2">Logos e mascote</h2>
        <p className="text-muted-foreground">
          {platform === 'viajar'
            ? 'Logos, mascote e avatar do Guatá na landing Guatá Labs e no chat.'
            : 'Logos da plataforma Descubra MS e avatar do Guatá no chat.'}{' '}
          Formatos: PNG, JPG, WebP. Máximo: 2MB.
        </p>
      </div>

      {logoConfigs.map((config) => {
        const currentUrl = logos[config.key] || config.currentPath;
        const preview = imagePreviews[config.id] || currentUrl;
        const isUploading = uploading[config.id];
        const isSaving = saving[config.id];
        const isSaved = saved[config.id];
        const changed = hasChanges(config.id);

        return (
          <Card key={config.id}>
            <CardHeader>
              <CardTitle>{config.label}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-32 border-2 border-dashed border-muted rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt={config.label}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor={`file-${config.id}`}>Selecionar imagem</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`file-${config.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(config.id, e.target.files?.[0] || null)}
                      disabled={isUploading || isSaving}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => saveLogo(config.id)}
                      disabled={isUploading || isSaving || !changed}
                      className={cn(isSaved && 'bg-green-500 hover:bg-green-600', !changed && 'opacity-50 cursor-not-allowed')}
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

              <div className="space-y-2">
                <Label htmlFor={`url-${config.id}`}>Ou cole uma URL</Label>
                <Input
                  id={`url-${config.id}`}
                  type="url"
                  value={logos[config.key] || ''}
                  onChange={(e) => {
                    setLogos((prev) => ({ ...prev, [config.key]: e.target.value }));
                    setImageFiles((prev) => ({ ...prev, [config.id]: null }));
                    setImagePreviews((prev) => {
                      const newPreviews = { ...prev };
                      delete newPreviews[config.id];
                      return newPreviews;
                    });
                  }}
                  placeholder="https://exemplo.com/logo.png"
                  disabled={isUploading || isSaving}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      {platform === 'viajar' && (
        <Card>
          <CardHeader>
            <CardTitle>Textos da marca</CardTitle>
            <CardDescription>Nome e tagline exibidos na navbar e no rodapé da landing Guatá Labs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {BRAND_TEXT_FIELDS.map(({ key, label, rows }) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={key}>{label}</Label>
                {rows && rows > 1 ? (
                  <Textarea
                    id={key}
                    rows={rows}
                    value={brandTexts[key] || ''}
                    onChange={(e) => setBrandTexts((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                ) : (
                  <Input
                    id={key}
                    value={brandTexts[key] || ''}
                    onChange={(e) => setBrandTexts((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
            <Button onClick={saveBrandTexts} disabled={savingBrandTexts || !brandTextsChanged}>
              {savingBrandTexts ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar textos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
