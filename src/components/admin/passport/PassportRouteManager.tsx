import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { passportAdminService } from '@/services/admin/passportAdminService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    wallpaper_url: '',
  });
  const { toast } = useToast();

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
        .eq('is_active', true)
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
    } catch (error: any) {
      console.error('Erro ao carregar rotas:', error);
      // Só mostrar toast se não for erro de autenticação
      if (error.code !== 'PGRST301' && !error.message?.includes('JWT')) {
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

  const handleEdit = (route: any) => {
    setEditingRoute(route);
    setFormData({
      video_url: route.video_url || '',
      passport_number_prefix: route.passport_number_prefix || 'MS',
      wallpaper_url: route.wallpaper_url || '',
    });
  };

  const handleSave = async () => {
    if (!editingRoute) return;

    try {
      await passportAdminService.updateRoute(editingRoute.id, formData);
      toast({
        title: 'Rota atualizada',
        description: 'As configurações do passaporte foram salvas.',
      });
      setEditingRoute(null);
      loadRoutes();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
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

      const { data, error } = await supabase.from('routes').insert({
        name: newRouteForm.name,
        description: newRouteForm.description || null,
        region: newRouteForm.region || null,
        difficulty: newRouteForm.difficulty,
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
      });

      setCreatingRoute(false);
      setNewRouteForm({ name: '', description: '', region: '', difficulty: 'medio' });
      loadRoutes();
    } catch (error: any) {
      console.error('Erro inesperado ao criar rota:', error);
      toast({
        title: 'Erro ao criar rota',
        description: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
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
            <CardTitle>Rotas do Passaporte</CardTitle>
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
                        <h3 className="font-semibold text-lg">{route.name}</h3>
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
                            <span className="font-medium">Papel de Parede:</span>{' '}
                            {route.wallpaper_url ? (
                              <span className="text-green-600">Configurado</span>
                            ) : (
                              <span className="text-muted-foreground">Não configurado</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(route)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
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
            <CardTitle>Editar Rota: {editingRoute.name}</CardTitle>
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
            <div className="flex gap-2">
              <Button onClick={handleSave}>Salvar</Button>
              <Button variant="outline" onClick={() => setEditingRoute(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {creatingRoute && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle>Criar Nova Rota</CardTitle>
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
                onValueChange={(v: any) =>
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
                    await handleCreateRoute();
                    console.log('🔵 [PassportRouteManager] handleCreateRoute concluído');
                  } catch (err) {
                    console.error('❌ [PassportRouteManager] Erro ao chamar handleCreateRoute:', err);
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
      )}
    </div>
  );
};

export default PassportRouteManager;

