import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'tourism-images';

const PassportGlobalSettings: React.FC = () => {
  const [wallpaperUrl, setWallpaperUrl] = useState<string>('');
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null);
  const [wallpaperPreview, setWallpaperPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWallpaper();
  }, []);

  const loadWallpaper = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'passport_wallpaper')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar wallpaper:', error);
      }

      if (data?.setting_value) {
        const value = data.setting_value as any;
        const url = value.url || value.wallpaper_url || '';
        setWallpaperUrl(url);
        if (url) {
          setWallpaperPreview(url);
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar wallpaper:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a configuração do wallpaper.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWallpaperSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setWallpaperFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setWallpaperPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadWallpaper = async (): Promise<string | null> => {
    if (!wallpaperFile) return wallpaperUrl || null;

    try {
      setUploading(true);
      const fileExt = wallpaperFile.name.split('.').pop();
      const fileName = `passport/wallpaper/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, wallpaperFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          console.warn('⚠️ Bucket não encontrado, continuando sem upload');
          return wallpaperUrl || null;
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || null;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro no upload do wallpaper:', err);
      toast({
        title: 'Erro no upload',
        description: `Erro ao fazer upload do wallpaper: ${err.message}`,
        variant: 'destructive',
      });
      return wallpaperUrl || null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Upload do wallpaper se houver novo arquivo
      let finalWallpaperUrl = wallpaperUrl;
      if (wallpaperFile) {
        const uploadedUrl = await uploadWallpaper();
        if (uploadedUrl) {
          finalWallpaperUrl = uploadedUrl;
        }
      }

      // Salvar ou atualizar configuração global
      const settingValue = {
        url: finalWallpaperUrl,
        wallpaper_url: finalWallpaperUrl, // Compatibilidade
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          platform: 'ms',
          setting_key: 'passport_wallpaper',
          setting_value: settingValue,
          description: 'Wallpaper global do passaporte digital (aplicado a todos os passaportes)',
        }, {
          onConflict: 'platform,setting_key'
        });

      if (error) throw error;

      toast({
        title: 'Configuração salva',
        description: 'O wallpaper global do passaporte foi atualizado com sucesso.',
      });

      setWallpaperFile(null);
      if (finalWallpaperUrl) {
        setWallpaperUrl(finalWallpaperUrl);
        setWallpaperPreview(finalWallpaperUrl);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar wallpaper:', err);
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Não foi possível salvar a configuração.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-2">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Configurações Globais do Passaporte</CardTitle>
        <CardDescription>
          Configure o wallpaper global que será aplicado a todos os passaportes digitais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!wallpaperUrl && !wallpaperPreview && (
          <div className="p-4 bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-lg border-2 border-dashed border-blue-200">
            <p className="text-sm text-gray-700 font-medium mb-2">
              <strong>Wallpaper padrão ativo:</strong>
            </p>
            <p className="text-xs text-gray-600">
              Atualmente está sendo usado o gradiente padrão (azul → branco → verde).
              Você pode fazer upload de uma imagem personalizada abaixo para substituir este padrão.
            </p>
          </div>
        )}
        <div>
          <Label htmlFor="wallpaper">Wallpaper do Passaporte (Global)</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleWallpaperSelect}
                className="hidden"
                id="wallpaper"
              />
              <label
                htmlFor="wallpaper"
                className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted"
              >
                <Upload className="h-4 w-4" />
                {wallpaperFile ? 'Trocar Imagem' : wallpaperPreview ? 'Alterar Wallpaper' : 'Selecionar Wallpaper'}
              </label>
            </div>
            {wallpaperPreview && (
              <div className="relative mt-2 border rounded-lg overflow-hidden">
                <img
                  src={wallpaperPreview}
                  alt="Preview do wallpaper"
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setWallpaperFile(null);
                    setWallpaperPreview(wallpaperUrl || null);
                  }}
                  className="absolute top-2 right-2"
                  disabled={!wallpaperFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Este wallpaper será aplicado como fundo de todos os passaportes digitais.
              Recomendado: imagem com alta resolução (1920x1080 ou maior).
            </p>
          </div>
        </div>

        {wallpaperUrl && !wallpaperPreview && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Wallpaper atual configurado.</strong> Selecione uma nova imagem para alterar.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving || uploading}>
            {(saving || uploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {uploading ? 'Enviando...' : saving ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
          {wallpaperUrl && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from('site_settings')
                    .delete()
                    .eq('platform', 'ms')
                    .eq('setting_key', 'passport_wallpaper');

                  if (error) throw error;

                  setWallpaperUrl('');
                  setWallpaperPreview(null);
                  setWallpaperFile(null);

                  toast({
                    title: 'Wallpaper removido',
                    description: 'O wallpaper global foi removido. Será usado o gradiente padrão.',
                  });
                } catch (error: unknown) {
                  const err = error instanceof Error ? error : new Error(String(error));
                  toast({
                    title: 'Erro',
                    description: 'Não foi possível remover o wallpaper.',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Remover Wallpaper
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PassportGlobalSettings;

