// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { passportAdminService } from '@/services/admin/passportAdminService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2, X, MapPin, Power, PowerOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const PassportRouteManager: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState<any | null>(null);
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [newRouteForm, setNewRouteForm] = useState({
    name: '',
    description: '',
    region: '',
    difficulty: 'medio' as 'facil' | 'medio' | 'dificil',
  });
  const [formData, setFormData] = useState({
    video_url: '',
    passport_number_prefix: 'MS',
    map_image_url: '',
    // wallpaper_url removido - agora é global (não por rota)
  });
  const [mapImageFile, setMapImageFile] = useState<File | null>(null);
  const [mapImagePreview, setMapImagePreview] = useState<string | null>(null);
  const [uploadingMapImage, setUploadingMapImage] = useState(false);
  const { toast } = useToast();
  
  const BUCKET_NAME = 'tourism-images';

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    console.log('🔵 [PassportRouteManager] creatingRoute mudou para:', creatingRoute);
  }, [creatingRoute]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar rotas:', error);
        
        // Não mostrar toast para erros de autenticação ao carregar (evita spam)
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          // Sessão expirada - será tratado pelo AuthProvider
          setRoutes([]);
          return;
        }
        
        throw error;
      }
      
      setRoutes(data || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar rotas:', err);
      // Só mostrar toast se não for erro de autenticação
      if ((err as { code?: string }).code !== 'PGRST301' && !err.message?.includes('JWT')) {
        toast({
          title: 'Erro ao carregar rotas',
          description: error.message || 'Não foi possível carregar as rotas.',
          variant: 'destructive',
        });
      }
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRouteStatus = async (route: { id: string; name: string; is_active: boolean }) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({
          is_active: !route.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', route.id);

      if (error) throw error;

      toast({
        title: route.is_active ? "🔴 Rota desativada" : "🟢 Rota ativada",
        description: `A rota ${route.name} foi ${route.is_active ? 'desativada' : 'ativada'}.`,
      });

      loadRoutes();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao alterar status:', err);
      toast({
        title: "❌ Erro",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async (route: { id: string; name: string }) => {
    if (!window.confirm(`Tem certeza que deseja excluir a rota "${route.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', route.id);

      if (error) throw error;

      toast({
        title: "🗑️ Rota excluída",
        description: `A rota ${route.name} foi excluída permanentemente.`,
      });

      loadRoutes();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao excluir rota:', err);
      toast({
        title: "❌ Erro ao excluir",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (route: { video_url?: string; passport_number_prefix?: string; [key: string]: unknown }) => {
    setEditingRoute(route);
    setFormData({
      video_url: route.video_url || '',
      passport_number_prefix: route.passport_number_prefix || 'MS',
      map_image_url: route.map_image_url || '',
      // wallpaper_url removido - agora é global (não por rota)
    });
    setMapImageFile(null);
    setMapImagePreview(route.map_image_url || null);
  };

  const handleMapImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setMapImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setMapImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadMapImage = async (routeId: string): Promise<string | null> => {
    if (!mapImageFile) return formData.map_image_url || null;

    try {
      setUploadingMapImage(true);
      const fileExt = mapImageFile.name.split('.').pop();
      const fileName = `routes/${routeId}/map/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, mapImageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          console.warn('⚠️ Bucket não encontrado, continuando sem upload de imagem do mapa');
          return formData.map_image_url || null;
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || null;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro no upload da imagem do mapa:', err);
      toast({
        title: 'Erro no upload',
        description: `Erro ao fazer upload da imagem do mapa: ${err.message}`,
        variant: 'destructive',
      });
      return formData.map_image_url || null;
    } finally {
      setUploadingMapImage(false);
    }
  };

  const handleSave = async () => {
    if (!editingRoute) return;

    try {
      // Upload da imagem do mapa se houver
      let mapImageUrl = formData.map_image_url;
      if (mapImageFile) {
        const uploadedUrl = await uploadMapImage(editingRoute.id);
        if (uploadedUrl) {
          mapImageUrl = uploadedUrl;
        }
      }

      await passportAdminService.updateRoute(editingRoute.id, {
        ...formData,
        map_image_url: mapImageUrl,
      });
      toast({
        title: 'Rota atualizada',
        description: 'As configurações do passaporte foram salvas.',
      });
      setEditingRoute(null);
      setMapImageFile(null);
      setMapImagePreview(null);
      loadRoutes();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateRoute = async () => {
    console.log('🔵 [PassportRouteManager] ========== handleCreateRoute INICIADO ==========');
    console.log('🔵 [PassportRouteManager] Timestamp:', new Date().toISOString());
    console.log('🔵 [PassportRouteManager] Form data:', JSON.stringify(newRouteForm, null, 2));
    console.log('🔵 [PassportRouteManager] Nome da rota (trim):', newRouteForm.name.trim());
    console.log('🔵 [PassportRouteManager] Nome vazio?', !newRouteForm.name.trim());
    
    if (!newRouteForm.name.trim()) {
      console.log('🔵 [PassportRouteManager] Nome vazio, mostrando erro');
      toast({
        title: 'Erro',
        description: 'O nome da rota é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('🔵 [PassportRouteManager] Verificando autenticação...');
      
      // Verificar sessão atual primeiro
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // Tentar refresh do token se houver sessão
      if (currentSession?.refresh_token) {
        console.log('🔵 [PassportRouteManager] Tentando renovar sessão...');
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.log('🔵 [PassportRouteManager] Erro ao renovar sessão:', refreshError);
        } else if (session) {
          console.log('🔵 [PassportRouteManager] Sessão renovada com sucesso');
          // Aguardar um pouco para garantir que o token foi atualizado
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔵 [PassportRouteManager] User:', user ? 'Logado' : 'Não logado');
      console.log('🔵 [PassportRouteManager] Auth error:', authError);
      
      if (!user || authError) {
        console.log('🔵 [PassportRouteManager] Usuário não autenticado após refresh');
        toast({
          title: 'Sessão expirada',
          description: 'Sua sessão expirou. Por favor, recarregue a página (F5) e faça login novamente.',
          variant: 'destructive',
          duration: 10000,
        });
        return;
      }

      console.log('🔵 [PassportRouteManager] Tentando inserir rota...');

      // Converter dificuldade para o formato aceito pelo banco (inglês)
      const difficultyMap = {
        'facil': 'easy',
        'medio': 'medium',
        'dificil': 'hard'
      };

      const dbDifficulty = difficultyMap[newRouteForm.difficulty as keyof typeof difficultyMap] || 'medium';

      console.log('🔵 [PassportRouteManager] Dificuldade original:', newRouteForm.difficulty);
      console.log('🔵 [PassportRouteManager] Dificuldade convertida para banco:', dbDifficulty);

      const { data, error } = await supabase.from('routes').insert({
        name: newRouteForm.name,
        description: newRouteForm.description || null,
        region: newRouteForm.region || null,
        difficulty: dbDifficulty,
        is_active: true,
      }).select();

      if (error) {
        console.error('❌ [PassportRouteManager] Erro ao criar rota:', error);
        console.error('❌ [PassportRouteManager] Error code:', error.code);
        console.error('❌ [PassportRouteManager] Error message:', error.message);
        
        // Mensagens mais específicas baseadas no erro
        let errorMessage = error.message;
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
        } else if (error.code === '42501' || error.message?.includes('permission')) {
          errorMessage = 'Você não tem permissão para criar rotas. Verifique se sua conta tem permissões de administrador.';
        }
        
        toast({
          title: 'Erro ao criar rota',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ [PassportRouteManager] Rota criada com sucesso:', data);
      
      toast({
        title: 'Rota criada',
        description: 'A nova rota foi criada com sucesso.',
        duration: 5000,
      });

      console.log('🔵 [PassportRouteManager] Fechando formulário e resetando...');
      setCreatingRoute(false);
      setNewRouteForm({ name: '', description: '', region: '', difficulty: 'medio' });
      
      console.log('🔵 [PassportRouteManager] Recarregando lista de rotas...');
      await loadRoutes();
      console.log('✅ [PassportRouteManager] Processo completo finalizado');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PassportRouteManager] Erro completo ao criar rota:', {
        message: err.message,
        code: (err as { code?: string }).code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
      });
      
      toast({
        title: 'Erro ao criar rota',
        description: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
        duration: 10000,
      });
      
      // Re-lançar o erro para que o onClick possa capturá-lo também
      throw error;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando rotas...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-center flex-1">Rotas do Passaporte</CardTitle>
            <Button 
              onClick={() => {
                console.log('🔵 [PassportRouteManager] Botão "Nova Rota" clicado');
                setCreatingRoute(true);
                console.log('🔵 [PassportRouteManager] creatingRoute definido como true');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Rota
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma rota encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {routes.map((route) => (
                <Card key={route.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{route.name}</h3>
                          <Badge variant={route.is_active ? "default" : "secondary"}>
                            {route.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        {route.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {route.description}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">Vídeo:</span>{' '}
                            {route.video_url ? (
                              <a
                                href={route.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Ver vídeo
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Não configurado</span>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Prefixo:</span>{' '}
                            {route.passport_number_prefix || 'MS'}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Mapa:</span>{' '}
                            {route.map_image_url ? (
                              <span className="text-green-600">Configurado</span>
                            ) : (
                              <span className="text-muted-foreground">Não configurado</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRouteStatus(route)}
                          title={route.is_active ? "Desativar rota" : "Ativar rota"}
                        >
                          {route.is_active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(route)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRoute(route)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Editar Rota: {editingRoute.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video_url">URL do Vídeo</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) =>
                  setFormData({ ...formData, video_url: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label htmlFor="prefix">Prefixo do Número do Passaporte</Label>
              <Input
                id="prefix"
                value={formData.passport_number_prefix}
                onChange={(e) =>
                  setFormData({ ...formData, passport_number_prefix: e.target.value })
                }
                placeholder="MS"
                maxLength={10}
              />
            </div>
            <div>
              <Label htmlFor="map_image">Imagem do Mapa do Roteiro</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMapImageSelect}
                    className="hidden"
                    id="map_image"
                  />
                  <label
                    htmlFor="map_image"
                    className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted"
                  >
                    <MapPin className="h-4 w-4" />
                    {mapImageFile ? 'Trocar Imagem' : 'Selecionar Imagem'}
                  </label>
                </div>
                {mapImagePreview && (
                  <div className="relative mt-2">
                    <img
                      src={mapImagePreview}
                      alt="Preview do mapa"
                      className="w-full max-w-md rounded-md border"
                    />
                    {mapImageFile && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setMapImageFile(null);
                          setMapImagePreview(formData.map_image_url || null);
                        }}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Imagem do mapa do roteiro que será exibida na visualização do passaporte
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={uploadingMapImage}>
                {uploadingMapImage && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingRoute(null);
                  setMapImageFile(null);
                  setMapImagePreview(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(() => {
        console.log('🔵 [PassportRouteManager] Renderizando formulário? creatingRoute =', creatingRoute);
        return creatingRoute && (
          <Card className="border-2 border-blue-300">
            <CardHeader>
              <CardTitle className="text-center">
                Criar Nova Rota
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new_name">Nome da Rota *</Label>
              <Input
                id="new_name"
                value={newRouteForm.name}
                onChange={(e) =>
                  setNewRouteForm({ ...newRouteForm, name: e.target.value })
                }
                placeholder="Ex: Rota Pantanal"
              />
            </div>
            <div>
              <Label htmlFor="new_description">Descrição</Label>
              <Textarea
                id="new_description"
                value={newRouteForm.description}
                onChange={(e) =>
                  setNewRouteForm({ ...newRouteForm, description: e.target.value })
                }
                placeholder="Descrição da rota..."
              />
            </div>
            <div>
              <Label htmlFor="new_region">Região</Label>
              <Input
                id="new_region"
                value={newRouteForm.region}
                onChange={(e) =>
                  setNewRouteForm({ ...newRouteForm, region: e.target.value })
                }
                placeholder="Ex: Pantanal"
              />
            </div>
            <div>
              <Label htmlFor="new_difficulty">Dificuldade</Label>
              <Select
                value={newRouteForm.difficulty}
                onValueChange={(v: 'facil' | 'medio' | 'dificil') =>
                  setNewRouteForm({ ...newRouteForm, difficulty: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔵 [PassportRouteManager] ========== BOTÃO CRIAR ROTA CLICADO ==========');
                  console.log('🔵 [PassportRouteManager] Event:', e);
                  console.log('🔵 [PassportRouteManager] creatingRoute state:', creatingRoute);
                  console.log('🔵 [PassportRouteManager] newRouteForm:', newRouteForm);
                  console.log('🔵 [PassportRouteManager] Chamando handleCreateRoute...');
                  try {
                    const result = await handleCreateRoute();
                    console.log('✅ [PassportRouteManager] handleCreateRoute concluído com sucesso:', result);
                    // Se chegou aqui, a função retornou sem erro
                    // O toast de sucesso já deve ter sido mostrado dentro de handleCreateRoute
                  } catch (err: unknown) {
                    console.error('❌ [PassportRouteManager] Erro ao chamar handleCreateRoute:', err);
                    // Se handleCreateRoute lançou erro, mostrar toast aqui também
                    if (!err?.handled) {
                      toast({
                        title: 'Erro ao criar rota',
                        description: err?.message || 'Erro desconhecido. Verifique o console para mais detalhes.',
                        variant: 'destructive',
                        duration: 10000,
                      });
                    }
                  }
                }}
              >
                Criar Rota
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  console.log('🔵 [PassportRouteManager] Botão "Cancelar" clicado');
                  setCreatingRoute(false);
                  setNewRouteForm({ name: '', description: '', region: '', difficulty: 'medio' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
        );
      })()}
    </div>
  );
};

export default PassportRouteManager;

