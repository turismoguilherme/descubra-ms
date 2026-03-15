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
import { Plus, Edit, Trash2, Loader2, X, MapPin, Power, PowerOff, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Route {
  id: string;
  name: string;
  video_url?: string;
  passport_number_prefix?: string;
  map_image_url?: string;
  is_active?: boolean;
  is_published?: boolean;
  checkpoints_count?: number;
  [key: string]: unknown;
}

const PassportRouteManager: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [deletingRoute, setDeletingRoute] = useState(false);
  const [deleteDependencies, setDeleteDependencies] = useState<{
    stamps: number;
    configurations: number;
    rewards: number;
    checkpoints: number;
  } | null>(null);
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
      
      // Contar checkpoints para cada rota
      if (data) {
        for (const route of data) {
          const { count } = await supabase
            .from('route_checkpoints')
            .select('*', { count: 'exact', head: true })
            .eq('route_id', route.id);
          route.checkpoints_count = count || 0;
        }
      }

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

  const toggleRouteStatus = async (route: Route) => {
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

  const publishRoute = async (route: Route) => {
    try {
      // Verificar se tem checkpoints
      const { count, error: countError } = await supabase
        .from('route_checkpoints')
        .select('*', { count: 'exact', head: true })
        .eq('route_id', route.id);

      if (countError) throw countError;

      if (!count || count === 0) {
        toast({
          title: "⚠️ Não é possível publicar",
          description: "A rota precisa ter pelo menos um checkpoint ativo para ser publicada.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('routes')
        .update({
          is_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', route.id);

      if (error) throw error;

      toast({
        title: "✅ Rota publicada",
        description: `A rota "${route.name}" está agora disponível para usuários finais.`,
      });

      loadRoutes();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao publicar rota:', err);
      toast({
        title: "❌ Erro",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const unpublishRoute = async (route: Route) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({
          is_published: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', route.id);

      if (error) throw error;

      toast({
        title: "📝 Rota despublicada",
        description: `A rota "${route.name}" foi movida para rascunho e não aparecerá mais para usuários finais.`,
      });

      loadRoutes();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao despublicar rota:', err);
      toast({
        title: "❌ Erro",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const checkRouteDependencies = async (routeId: string) => {
    try {
      console.log('🔍 [PassportRouteManager] Verificando dependências para routeId:', routeId);
      
      // Verificar passport_stamps (sem CASCADE - pode bloquear exclusão)
      const { count: stampsCount, error: stampsError } = await supabase
        .from('passport_stamps')
        .select('*', { count: 'exact', head: true })
        .eq('route_id', routeId);
      
      if (stampsError) {
        console.error('❌ [PassportRouteManager] Erro ao verificar passport_stamps:', stampsError);
      } else {
        console.log('✅ [PassportRouteManager] passport_stamps:', stampsCount || 0);
      }

      // Verificar passport_configurations (com CASCADE - será deletado automaticamente)
      const { count: configsCount, error: configsError } = await supabase
        .from('passport_configurations')
        .select('*', { count: 'exact', head: true })
        .eq('route_id', routeId);
      
      if (configsError) {
        console.error('❌ [PassportRouteManager] Erro ao verificar passport_configurations:', configsError);
      } else {
        console.log('✅ [PassportRouteManager] passport_configurations:', configsCount || 0);
      }

      // Verificar passport_rewards (com CASCADE - será deletado automaticamente)
      const { count: rewardsCount, error: rewardsError } = await supabase
        .from('passport_rewards')
        .select('*', { count: 'exact', head: true })
        .eq('route_id', routeId);
      
      if (rewardsError) {
        console.error('❌ [PassportRouteManager] Erro ao verificar passport_rewards:', rewardsError);
      } else {
        console.log('✅ [PassportRouteManager] passport_rewards:', rewardsCount || 0);
      }

      // Verificar route_checkpoints (com CASCADE - será deletado automaticamente)
      const { count: checkpointsCount, error: checkpointsError } = await supabase
        .from('route_checkpoints')
        .select('*', { count: 'exact', head: true })
        .eq('route_id', routeId);
      
      if (checkpointsError) {
        console.error('❌ [PassportRouteManager] Erro ao verificar route_checkpoints:', checkpointsError);
      } else {
        console.log('✅ [PassportRouteManager] route_checkpoints:', checkpointsCount || 0);
      }

      const result = {
        stamps: stampsCount || 0,
        configurations: configsCount || 0,
        rewards: rewardsCount || 0,
        checkpoints: checkpointsCount || 0,
      };
      
      console.log('📊 [PassportRouteManager] Resultado final das dependências:', result);
      return result;
    } catch (error) {
      console.error('❌ [PassportRouteManager] Erro ao verificar dependências:', error);
      throw error; // Re-lançar para que handleDeleteClick possa tratar
    }
  };

  const handleDeleteClick = async (route: Route) => {
    console.log('🗑️ [PassportRouteManager] handleDeleteClick chamado para rota:', route.name, route.id);
    setRouteToDelete(route);
    setDeletingRoute(false);
    
    try {
      // Verificar dependências antes de abrir o dialog
      console.log('🔍 [PassportRouteManager] Verificando dependências...');
      const dependencies = await checkRouteDependencies(route.id);
      console.log('📊 [PassportRouteManager] Dependências encontradas:', dependencies);
      setDeleteDependencies(dependencies);
      
      // Sempre permitir exclusão, mas avisar sobre dependências
      console.log('✅ [PassportRouteManager] Abrindo dialog de confirmação');
      setDeleteDialogOpen(true);
    } catch (error) {
      console.error('❌ [PassportRouteManager] Erro ao verificar dependências:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível verificar as dependências da rota. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async () => {
    if (!routeToDelete) {
      console.error('❌ [PassportRouteManager] handleDeleteRoute chamado sem routeToDelete');
      return;
    }

    console.log('🗑️ [PassportRouteManager] Iniciando exclusão da rota:', routeToDelete.name, routeToDelete.id);

    try {
      setDeletingRoute(true);

      // Se houver carimbos, excluir primeiro (já que não tem CASCADE)
      if (deleteDependencies && deleteDependencies.stamps > 0) {
        console.log('🗑️ [PassportRouteManager] Excluindo carimbos primeiro...');
        
        // Tentar usar a função RPC primeiro (bypassa RLS)
        try {
          const { data: deletedCount, error: rpcError } = await supabase.rpc(
            'delete_passport_stamps_by_route',
            { p_route_id: routeToDelete.id }
          );

          if (rpcError) {
            console.warn('⚠️ [PassportRouteManager] Erro ao usar RPC, tentando método direto:', rpcError);
            // Fallback: tentar exclusão direta
            const { data: deletedStamps, error: stampsError } = await supabase
              .from('passport_stamps')
              .delete()
              .eq('route_id', routeToDelete.id)
              .select();

            if (stampsError) {
              console.error('❌ [PassportRouteManager] Erro ao excluir carimbos:', stampsError);
              console.error('❌ [PassportRouteManager] Erro completo:', {
                code: stampsError.code,
                message: stampsError.message,
                details: stampsError.details,
                hint: stampsError.hint
              });
              
              // Se for erro de RLS/permissão
              if (stampsError.code === '42501' || stampsError.message?.includes('policy') || stampsError.message?.includes('permission')) {
                throw new Error('Você não tem permissão para excluir carimbos de outros usuários. A função RPC não está disponível. Entre em contato com o administrador do sistema.');
              }
              
              throw new Error(`Erro ao excluir carimbos: ${stampsError.message}`);
            }
            
            console.log('✅ [PassportRouteManager] Carimbos excluídos (método direto):', deletedStamps?.length || 0);
          } else {
            console.log('✅ [PassportRouteManager] Carimbos excluídos via RPC:', deletedCount || 0);
          }
        } catch (rpcError: unknown) {
          const err = rpcError instanceof Error ? rpcError : new Error(String(rpcError));
          console.error('❌ [PassportRouteManager] Erro ao excluir carimbos:', err);
          throw err;
        }
        
        // Verificar se realmente foram excluídos
        const { count: remainingStamps } = await supabase
          .from('passport_stamps')
          .select('*', { count: 'exact', head: true })
          .eq('route_id', routeToDelete.id);
        
        if (remainingStamps && remainingStamps > 0) {
          console.warn(`⚠️ [PassportRouteManager] Ainda há ${remainingStamps} carimbo(s) restante(s). Aguardando e verificando novamente...`);
          // Aguardar um pouco mais e verificar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { count: finalCheck } = await supabase
            .from('passport_stamps')
            .select('*', { count: 'exact', head: true })
            .eq('route_id', routeToDelete.id);
          
          if (finalCheck && finalCheck > 0) {
            throw new Error(`Não foi possível excluir todos os carimbos. Ainda restam ${finalCheck} carimbo(s).`);
          }
        }
        
        // Pequeno delay para garantir que a transação foi commitada
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ [PassportRouteManager] Carimbos excluídos com sucesso e verificação concluída');
      }

      console.log('🗑️ [PassportRouteManager] Enviando requisição de exclusão da rota...');
      const { data, error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeToDelete.id)
        .select();

      if (error) {
        console.error('❌ [PassportRouteManager] Erro ao excluir rota:', error);
        console.error('❌ [PassportRouteManager] Error code:', error.code);
        console.error('❌ [PassportRouteManager] Error message:', error.message);
        console.error('❌ [PassportRouteManager] Error details:', error.details);
        console.error('❌ [PassportRouteManager] Error hint:', error.hint);
        
        // Verificar se é erro de constraint
        if (error.code === '23503' || error.message?.includes('foreign key')) {
          throw new Error('Esta rota possui dependências que impedem a exclusão. Verifique se há carimbos de passaporte, configurações ou recompensas associadas.');
        }
        throw error;
      }

      console.log('✅ [PassportRouteManager] Rota excluída com sucesso:', data);

      toast({
        title: "🗑️ Rota excluída",
        description: `A rota "${routeToDelete.name}" foi excluída permanentemente.${deleteDependencies && deleteDependencies.stamps > 0 ? ` ${deleteDependencies.stamps} carimbo(s) também foram excluídos.` : ''}`,
      });

      setDeleteDialogOpen(false);
      setRouteToDelete(null);
      setDeleteDependencies(null);
      await loadRoutes();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PassportRouteManager] Erro completo ao excluir rota:', err);
      
      let errorMessage = err.message;
      if (errorMessage.includes('foreign key') || errorMessage.includes('constraint')) {
        errorMessage = 'Esta rota possui dependências que impedem a exclusão. Verifique se há carimbos de passaporte, configurações ou recompensas associadas.';
      } else if (!errorMessage || errorMessage === 'Error') {
        errorMessage = 'Ocorreu um erro ao excluir a rota. Verifique o console para mais detalhes.';
      }
      
      toast({
        title: "❌ Erro ao excluir",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setDeletingRoute(false);
    }
  };

  const handleEdit = (route: Route) => {
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

      // Traduzir automaticamente após salvar
      try {
        const { data: updatedRoute } = await supabase
          .from('routes')
          .select('id, name, description')
          .eq('id', editingRoute.id)
          .single();

        if (updatedRoute) {
          const { autoTranslateRoute } = await import('@/utils/autoTranslation');
          // Traduzir em background (não bloquear UI)
          autoTranslateRoute({
            id: updatedRoute.id,
            title: updatedRoute.name || formData.name || '',
            description: updatedRoute.description || formData.description || null,
          });
        }
      } catch (translationError) {
        console.error('Erro ao traduzir rota (não crítico):', translationError);
        // Não bloquear o fluxo principal se a tradução falhar
      }

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
        is_published: false, // Nova rota começa como rascunho
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
      
      // Traduzir automaticamente após criar
      if (data && data.length > 0) {
        try {
          const { autoTranslateRoute } = await import('@/utils/autoTranslation');
          // Traduzir em background (não bloquear UI)
          autoTranslateRoute({
            id: data[0].id,
            title: data[0].name || newRouteForm.name,
            description: data[0].description || newRouteForm.description || null,
          });
        } catch (translationError) {
          console.error('Erro ao traduzir rota (não crítico):', translationError);
          // Não bloquear o fluxo principal se a tradução falhar
        }
      }
      
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
        details: (error as { details?: string }).details,
        hint: (error as { hint?: string }).hint,
        stack: err.stack,
      });
      
      toast({
        title: 'Erro ao criar rota',
        description: err.message || 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
        duration: 10000,
      });
      
      // Re-lançar o erro para que o onClick possa capturá-lo também
      throw err;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando rotas...</div>;
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Rotas do Passaporte Digital"
        description="Configure rotas, carimbos e recompensas do programa de fidelidade turística."
        helpText="Configure rotas, carimbos e recompensas do programa de fidelidade turística."
      />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-center flex-1">Rotas</CardTitle>
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
                          <Badge variant={route.is_published ? "default" : "outline"} className={route.is_published ? "bg-green-500" : ""}>
                            {route.is_published ? "✅ Publicada" : "📝 Rascunho"}
                          </Badge>
                          {route.checkpoints_count !== undefined && (
                            <Badge variant="outline">
                              {route.checkpoints_count} checkpoint{route.checkpoints_count !== 1 ? 's' : ''}
                            </Badge>
                          )}
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
                        {!route.is_published ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => publishRoute(route)}
                            title="Publicar rota para usuários finais"
                            disabled={!route.checkpoints_count || route.checkpoints_count === 0}
                          >
                            <Power className="h-4 w-4 mr-2" />
                            Publicar
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unpublishRoute(route)}
                            title="Despublicar rota (mover para rascunho)"
                          >
                            <PowerOff className="h-4 w-4 mr-2" />
                            Despublicar
                          </Button>
                        )}
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
                          onClick={() => handleDeleteClick(route)}
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
                    const error = err instanceof Error ? err : new Error(String(err));
                    if (!(err as { handled?: boolean }).handled) {
                      toast({
                        title: 'Erro ao criar rota',
                        description: error.message || 'Erro desconhecido. Verifique o console para mais detalhes.',
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

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription className="mt-2">
                  Tem certeza que deseja excluir a rota <strong>"{routeToDelete?.name}"</strong>?
                  <br />
                  <span className="text-destructive font-medium">Esta ação não pode ser desfeita.</span>
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          {deleteDependencies && (
            <div className={`rounded-lg border p-4 ${
              deleteDependencies.stamps > 0 
                ? 'border-red-200 bg-red-50' 
                : 'border-yellow-200 bg-yellow-50'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                deleteDependencies.stamps > 0 
                  ? 'text-red-800' 
                  : 'text-yellow-800'
              }`}>
              {deleteDependencies.stamps > 0 
                ? '⚠️ ATENÇÃO: Itens que serão excluídos permanentemente:'
                : '⚠️ Itens que serão excluídos automaticamente:'
              }
              </p>
              <ul className={`text-sm space-y-1 ml-4 list-disc ${
                deleteDependencies.stamps > 0 
                  ? 'text-red-700' 
                  : 'text-yellow-700'
              }`}>
                {deleteDependencies.stamps > 0 && (
                  <li className="font-semibold">
                    {deleteDependencies.stamps} carimbo(s) de passaporte (serão excluídos permanentemente)
                  </li>
                )}
                {deleteDependencies.configurations > 0 && (
                  <li>{deleteDependencies.configurations} configuração(ões) de passaporte</li>
                )}
                {deleteDependencies.rewards > 0 && (
                  <li>{deleteDependencies.rewards} recompensa(s)</li>
                )}
                {deleteDependencies.checkpoints > 0 && (
                  <li>{deleteDependencies.checkpoints} checkpoint(s)</li>
                )}
                {deleteDependencies.configurations === 0 && 
                 deleteDependencies.rewards === 0 && 
                 deleteDependencies.checkpoints === 0 &&
                 deleteDependencies.stamps === 0 && (
                  <li className={deleteDependencies.stamps > 0 ? 'text-red-600' : 'text-yellow-600'}>
                    Nenhum item associado
                  </li>
                )}
              </ul>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingRoute}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoute}
              disabled={deletingRoute}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingRoute ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir permanentemente
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PassportRouteManager;

