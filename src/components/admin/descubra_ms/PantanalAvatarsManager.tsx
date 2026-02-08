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
  Plus, Edit, Trash2, Image as ImageIcon, Upload, Loader2, X,
  Heart, Shield, Target, Save, Download
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';

interface PantanalAvatar {
  id: string;
  name: string;
  scientific_name: string | null;
  description: string | null;
  image_url: string | null;
  habitat: string | null;
  diet: string | null;
  curiosities: string[] | null;
  is_unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  personality_traits: string[] | null;
  personality_why: string | null;
  threats: string[] | null;
  conservation_actions: string[] | null;
  ecosystem_importance: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

const BUCKET_NAME = 'tourism-images';

export default function PantanalAvatarsManager() {
  const { toast } = useToast();
  const [avatars, setAvatars] = useState<PantanalAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState<PantanalAvatar | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    description: '',
    image_url: '',
    habitat: '',
    diet: '',
    curiosities: '',
    is_unlocked: true,
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    personality_traits: '',
    personality_why: '',
    threats: '',
    conservation_actions: '',
    ecosystem_importance: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    console.log('🔄 [PantanalAvatarsManager] Carregando avatares...');
    setLoading(true);
    try {
      // Tentar renovar token se necessário antes de fazer a requisição
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.expires_at) {
        const expiresAt = session.expires_at * 1000;
        const timeUntilExpiry = expiresAt - Date.now();
        // Se expira em menos de 5 minutos, renovar
        if (timeUntilExpiry < 5 * 60 * 1000 && session.refresh_token) {
          console.log('🔄 [PantanalAvatarsManager] Token próximo de expirar, renovando...');
          await supabase.auth.refreshSession();
        }
      }

      const { data, error } = await supabase
        .from('pantanal_avatars')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      // Se for erro 401, tentar renovar e retentar
      if (error && (error.code === 'PGRST301' || error.message?.includes('JWT expired') || error.status === 401)) {
        console.log('🔄 [PantanalAvatarsManager] Token expirado, tentando renovar...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError && refreshedSession) {
          console.log('✅ [PantanalAvatarsManager] Token renovado, retentando...');
          // Retentar a operação
          const { data: retryData, error: retryError } = await supabase
            .from('pantanal_avatars')
            .select('*')
            .order('display_order', { ascending: true })
            .order('name', { ascending: true });
          
          if (retryError) {
            console.error('❌ [PantanalAvatarsManager] Erro após renovar token:', retryError);
            throw retryError;
          }
          
          console.log('✅ [PantanalAvatarsManager] Avatares carregados após renovação:', retryData?.length || 0, 'itens');
          setAvatars(retryData || []);
          setLoading(false);
          return;
        }
      }

      if (error) {
        console.error('❌ [PantanalAvatarsManager] Erro ao carregar avatares:', error);
        console.error('❌ [PantanalAvatarsManager] Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ [PantanalAvatarsManager] Avatares carregados:', data?.length || 0, 'itens');
      console.log('📋 [PantanalAvatarsManager] Dados:', data);
      setAvatars(data || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PantanalAvatarsManager] Erro geral ao carregar:', err);
      toast({
        title: 'Erro ao carregar avatares',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('🏁 [PantanalAvatarsManager] Carregamento finalizado');
    }
  };

  const openCreateDialog = () => {
    setEditingAvatar(null);
    setFormData({
      name: '',
      scientific_name: '',
      description: '',
      image_url: '',
      habitat: '',
      diet: '',
      curiosities: '',
      is_unlocked: true,
      rarity: 'common',
      personality_traits: '',
      personality_why: '',
      threats: '',
      conservation_actions: '',
      ecosystem_importance: '',
      display_order: 0,
      is_active: true,
    });
    setImagePreview(null);
    setImageFile(null);
    setDialogOpen(true);
  };

  const openEditDialog = (avatar: PantanalAvatar) => {
    setEditingAvatar(avatar);
    // Preservar a URL original do avatar mesmo quando um novo arquivo for selecionado
    const originalImageUrl = avatar.image_url || '';
    setFormData({
      name: avatar.name,
      scientific_name: avatar.scientific_name || '',
      description: avatar.description || '',
      image_url: originalImageUrl, // Sempre preservar URL original
      habitat: avatar.habitat || '',
      diet: avatar.diet || '',
      curiosities: (avatar.curiosities || []).join('\n'),
      is_unlocked: avatar.is_unlocked,
      rarity: avatar.rarity,
      personality_traits: (avatar.personality_traits || []).join('\n'),
      personality_why: avatar.personality_why || '',
      threats: (avatar.threats || []).join('\n'),
      conservation_actions: (avatar.conservation_actions || []).join('\n'),
      ecosystem_importance: avatar.ecosystem_importance || '',
      display_order: avatar.display_order || 0,
      is_active: avatar.is_active,
    });
    setImagePreview(avatar.image_url || null);
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `avatars/${uuidv4()}.${fileExt}`;

      console.log('📤 [PantanalAvatarsManager] Tentando upload para:', BUCKET_NAME, fileName);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ [PantanalAvatarsManager] Erro no upload:', uploadError);
        
        // Se o bucket não existir, apenas avisar mas continuar sem imagem
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          console.warn('⚠️ [PantanalAvatarsManager] Bucket não encontrado, continuando sem upload de imagem');
          toast({
            title: 'Bucket não encontrado',
            description: 'O bucket "tourism-images" não existe. Execute o SQL em supabase/create_tourism_images_bucket.sql para criá-lo. O avatar será salvo preservando a URL existente se houver.',
            variant: 'default',
            duration: 10000,
          });
          // Retornar URL existente se houver, senão null
          const fallbackUrl = formData.image_url || null;
          
          return fallbackUrl;
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log('✅ [PantanalAvatarsManager] Upload concluído, URL:', publicUrlData?.publicUrl);
      return publicUrlData?.publicUrl || null;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PantanalAvatarsManager] Erro geral no upload:', err);
      // Continuar sem imagem se o erro for de bucket
      if (err.message?.includes('not found') || error.message?.includes('Bucket')) {
        return null;
      }
      toast({
        title: 'Erro no upload',
        description: error.message || 'Erro ao fazer upload da imagem',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleSave = async () => {
    console.log('🔄 [PantanalAvatarsManager] Iniciando salvamento...');
    console.log('📝 [PantanalAvatarsManager] Dados do formulário:', formData);
    console.log('✏️ [PantanalAvatarsManager] Editando avatar?', !!editingAvatar);
    console.log('🖼️ [PantanalAvatarsManager] Tem arquivo de imagem?', !!imageFile);

    if (!formData.name.trim()) {
      console.warn('⚠️ [PantanalAvatarsManager] Nome não preenchido');
      toast({
        title: 'Campo obrigatório',
        description: 'O nome é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Upload da imagem se houver nova
      // Preservar URL original do avatar sendo editado (fallback se formData.image_url estiver vazio)
      const originalImageUrl = editingAvatar?.image_url || formData.image_url || '';
      let imageUrl = formData.image_url || originalImageUrl;
      
      if (imageFile) {
        console.log('📤 [PantanalAvatarsManager] Iniciando upload de imagem...');
        const uploadedUrl = await uploadImage();
        
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('✅ [PantanalAvatarsManager] Imagem enviada com sucesso:', uploadedUrl);
        } else {
          console.warn('⚠️ [PantanalAvatarsManager] Upload de imagem falhou');
          // Preservar URL original se o upload falhar
          if (originalImageUrl && originalImageUrl.trim()) {
            imageUrl = originalImageUrl;
            console.log('✅ [PantanalAvatarsManager] Preservando URL original do avatar:', imageUrl);
            
          } else if (formData.image_url && formData.image_url.trim()) {
            // Tentar usar URL do formulário se houver
            imageUrl = formData.image_url;
            console.log('✅ [PantanalAvatarsManager] Usando URL do formulário:', imageUrl);
          } else if (imagePreview && (imagePreview.startsWith('data:') || imagePreview.startsWith('blob:'))) {
            // Se há preview mas não há URL válida, alertar o usuário
            console.warn('⚠️ [PantanalAvatarsManager] Preview disponível mas não pode ser salvo sem upload');
            toast({
              title: 'Aviso',
              description: 'O upload falhou e não há URL de imagem válida. Por favor, forneça uma URL de imagem manualmente ou verifique se o bucket de imagens está configurado.',
              variant: 'default',
              duration: 8000,
            });
            // Não definir imageUrl, deixar null para que o usuário saiba que precisa fornecer uma URL
          }
        }
      } else {
        // Se não há arquivo novo, usar a URL do formulário (que pode ter sido atualizada manualmente)
        imageUrl = formData.image_url || originalImageUrl;
      }

      // Converter strings de arrays para arrays
      console.log('🔄 [PantanalAvatarsManager] Convertendo arrays...');
      const curiositiesArray = formData.curiosities
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);
      
      const personalityTraitsArray = formData.personality_traits
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      const threatsArray = formData.threats
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      const conservationActionsArray = formData.conservation_actions
        .split('\n')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      // Validar URL da imagem se fornecida
      let finalImageUrl = imageUrl || null;
      
      if (finalImageUrl && !finalImageUrl.startsWith('http') && !finalImageUrl.startsWith('data:') && !finalImageUrl.startsWith('blob:')) {
        console.warn('⚠️ [PantanalAvatarsManager] URL de imagem inválida, removendo:', finalImageUrl);
        finalImageUrl = null;
        
      }

      const avatarData: Record<string, unknown> = {
        name: formData.name.trim(),
        scientific_name: formData.scientific_name.trim() || null,
        description: formData.description.trim() || null,
        image_url: finalImageUrl,
        habitat: formData.habitat.trim() || null,
        diet: formData.diet.trim() || null,
        curiosities: curiositiesArray.length > 0 ? curiositiesArray : null,
        is_unlocked: formData.is_unlocked,
        rarity: formData.rarity,
        personality_traits: personalityTraitsArray.length > 0 ? personalityTraitsArray : null,
        personality_why: formData.personality_why.trim() || null,
        threats: threatsArray.length > 0 ? threatsArray : null,
        conservation_actions: conservationActionsArray.length > 0 ? conservationActionsArray : null,
        ecosystem_importance: formData.ecosystem_importance.trim() || null,
        display_order: formData.display_order || 0,
        is_active: formData.is_active,
      };

      console.log('💾 [PantanalAvatarsManager] Dados preparados para salvar:', avatarData);

      if (editingAvatar) {
        console.log('🔄 [PantanalAvatarsManager] Atualizando avatar ID:', editingAvatar.id);
        // Remover campos undefined para evitar problemas
        const cleanAvatarData = Object.fromEntries(
          Object.entries(avatarData).filter(([_, v]) => v !== undefined)
        );
        // Forçar atualização do updated_at para garantir cache-busting das imagens
        cleanAvatarData.updated_at = new Date().toISOString();
        console.log('🧹 [PantanalAvatarsManager] Dados limpos para update:', cleanAvatarData);
        
        const { data, error } = await supabase
          .from('pantanal_avatars')
          .update(cleanAvatarData)
          .eq('id', editingAvatar.id)
          .select()
          .single();

        if (error) {
          console.error('❌ [PantanalAvatarsManager] Erro ao atualizar:', error);
          console.error('❌ [PantanalAvatarsManager] Detalhes do erro:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        console.log('✅ [PantanalAvatarsManager] Avatar atualizado com sucesso:', data);
        toast({
          title: 'Sucesso',
          description: 'Avatar atualizado com sucesso!',
        });
      } else {
        console.log('➕ [PantanalAvatarsManager] Criando novo avatar...');
        // Remover campos undefined e garantir que não enviamos 'id'
        const cleanAvatarData: Record<string, unknown> = {};
        Object.entries(avatarData).forEach(([key, value]) => {
          if (key !== 'id' && value !== undefined) {
            cleanAvatarData[key] = value;
          }
        });
        console.log('🧹 [PantanalAvatarsManager] Dados limpos (sem id):', cleanAvatarData);
        console.log('🔍 [PantanalAvatarsManager] Verificando se tabela existe...');
        
        // Verificar se a tabela existe primeiro
        const { data: tableCheck, error: tableError } = await supabase
          .from('pantanal_avatars')
          .select('id')
          .limit(1);
        
        if (tableError) {
          if (tableError.code === '42P01' || tableError.message?.includes('does not exist')) {
            console.error('❌ [PantanalAvatarsManager] Tabela não existe! Execute a migration primeiro.');
            toast({
              title: 'Erro',
              description: 'A tabela pantanal_avatars não existe. Execute a migration primeiro no Supabase.',
              variant: 'destructive',
            });
            return;
          }
          // Outro erro, mas continuar tentando inserir
          console.warn('⚠️ [PantanalAvatarsManager] Erro ao verificar tabela:', tableError);
        }
        
        console.log('✅ [PantanalAvatarsManager] Tabela existe, inserindo dados...');
        console.log('📤 [PantanalAvatarsManager] Payload do INSERT:', JSON.stringify(cleanAvatarData, null, 2));
        
        const { data, error } = await supabase
          .from('pantanal_avatars')
          .insert(cleanAvatarData)
          .select()
          .single();

        if (error) {
          console.error('❌ [PantanalAvatarsManager] Erro ao criar:', error);
          console.error('❌ [PantanalAvatarsManager] Detalhes do erro:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        console.log('✅ [PantanalAvatarsManager] Avatar criado com sucesso:', data);
        toast({
          title: 'Sucesso',
          description: 'Avatar criado com sucesso!',
        });
      }

      console.log('🔄 [PantanalAvatarsManager] Fechando dialog e recarregando lista...');
      setDialogOpen(false);
      setImagePreview(null);
      setImageFile(null);
      await loadAvatars();
      console.log('✅ [PantanalAvatarsManager] Processo concluído com sucesso!');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PantanalAvatarsManager] Erro geral ao salvar:', err);
      console.error('❌ [PantanalAvatarsManager] Stack trace:', err.stack);
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Não foi possível salvar o avatar.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      console.log('🏁 [PantanalAvatarsManager] Finalizando processo de salvamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este avatar?')) return;

    try {
      const { error } = await supabase
        .from('pantanal_avatars')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Avatar excluído com sucesso!',
      });

      loadAvatars();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro ao excluir',
        description: err.message || 'Não foi possível excluir o avatar.',
        variant: 'destructive',
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      default: return 'Comum';
    }
  };

  // Avatares hardcoded do Descubra MS (ProfilePageFixed.tsx)
  const defaultAvatars = [
    {
      id: 'jaguar',
      name: 'Onça-Pintada',
      scientific_name: 'Panthera onca',
      image: 'https://source.unsplash.com/photo-1482938289607-e9573fc25ebb',
      description: 'O maior felino das Américas e símbolo do Pantanal.',
      habitat: 'Mata atlântica, cerrado e pantanal',
      diet: 'Carnívoro - capivaras, jacarés, veados',
      curiosities: [
        'Pode pesar até 135kg',
        'Excelente nadador',
        'Símbolo de força e mistério'
      ],
      is_unlocked: true,
      rarity: 'legendary' as const,
      personality_traits: ['Liderança', 'Coragem', 'Mistério', 'Força'],
      personality_why: 'Representa força interior e liderança natural. Ideal para quem gosta de desafios e tem espírito aventureiro.',
      threats: [
        'Perda de habitat devido ao desmatamento',
        'Caça ilegal e conflitos com humanos',
        'Fragmentação do habitat',
        'Redução de presas naturais'
      ],
      conservation_actions: [
        'Proteger corredores ecológicos',
        'Combater a caça ilegal',
        'Preservar áreas de mata nativa',
        'Educar sobre coexistência'
      ],
      ecosystem_importance: 'Como predador de topo, a onça-pintada regula as populações de outras espécies, mantendo o equilíbrio do ecossistema. Sua presença indica um ambiente saudável e preservado.'
    },
    {
      id: 'arara-azul',
      name: 'Arara-Azul',
      scientific_name: 'Anodorhynchus hyacinthinus',
      image: 'https://source.unsplash.com/photo-1559827260-dc66d52bef19',
      description: 'Uma das aves mais belas e ameaçadas do Pantanal.',
      habitat: 'Palmeiras e árvores altas',
      diet: 'Frutas, sementes e nozes',
      curiosities: [
        'Pode viver até 50 anos',
        'Forma casais para a vida toda',
        'Símbolo de liberdade'
      ],
      is_unlocked: true,
      rarity: 'epic' as const,
      personality_traits: ['Comunicação', 'Sociabilidade', 'Inteligência', 'Beleza'],
      personality_why: 'Simboliza comunicação e expressão. Perfeito para pessoas sociáveis e criativas.',
      threats: [
        'Tráfico de animais silvestres',
        'Perda de habitat e árvores nativas',
        'Competição com espécies invasoras',
        'Mudanças climáticas'
      ],
      conservation_actions: [
        'Plantar árvores nativas',
        'Combater o tráfico de animais',
        'Preservar palmeiras',
        'Apoiar projetos de reintrodução'
      ],
      ecosystem_importance: 'Essencial para a dispersão de sementes de palmeiras, contribuindo para a regeneração da floresta. Sua presença indica boa qualidade ambiental.'
    },
    {
      id: 'capivara',
      name: 'Capivara',
      scientific_name: 'Hydrochoerus hydrochaeris',
      image: 'https://source.unsplash.com/photo-1578662996442-48f60103fc96',
      description: 'O maior roedor do mundo e símbolo de tranquilidade.',
      habitat: 'Margens de rios e lagos',
      diet: 'Herbívoro - capim e plantas aquáticas',
      curiosities: [
        'Pode pesar até 80kg',
        'Excelente nadador',
        'Símbolo de paz e harmonia'
      ],
      is_unlocked: true,
      rarity: 'common' as const,
      personality_traits: ['Paciência', 'Tranquilidade', 'Sabedoria', 'Harmonia'],
      personality_why: 'Representa calma e sabedoria. Ideal para quem valoriza a paz e a harmonia.',
      threats: [
        'Poluição de rios e córregos',
        'Perda de habitat aquático',
        'Atropelamentos em rodovias',
        'Contaminação da água'
      ],
      conservation_actions: [
        'Proteger rios e córregos',
        'Reduzir poluição da água',
        'Criar passagens de fauna',
        'Preservar áreas úmidas'
      ],
      ecosystem_importance: 'Importante herbívoro que controla a vegetação aquática e terrestre, contribuindo para a manutenção dos corpos d\'água.'
    },
    {
      id: 'tuiuiu',
      name: 'Tuiuiú',
      scientific_name: 'Jabiru mycteria',
      image: 'https://source.unsplash.com/photo-1559827260-dc66d52bef19',
      description: 'A ave símbolo do Pantanal, elegante e majestosa.',
      habitat: 'Áreas úmidas e margens de rios',
      diet: 'Peixes, anfíbios e pequenos répteis',
      curiosities: [
        'Pode ter até 1,5m de altura',
        'Símbolo do Pantanal',
        'Representa elegância e graciosidade'
      ],
      is_unlocked: true,
      rarity: 'rare' as const,
      personality_traits: ['Elegância', 'Graciosidade', 'Determinação', 'Altura'],
      personality_why: 'Simboliza elegância e determinação. Perfeito para pessoas focadas e determinadas.',
      threats: [
        'Poluição de corpos d\'água',
        'Perda de áreas úmidas',
        'Contaminação por agrotóxicos',
        'Alterações no regime de chuvas'
      ],
      conservation_actions: [
        'Proteger áreas úmidas',
        'Reduzir uso de agrotóxicos',
        'Preservar corpos d\'água',
        'Monitorar qualidade da água'
      ],
      ecosystem_importance: 'Indicador de qualidade ambiental, sua presença em áreas úmidas sinaliza ecossistemas saudáveis e bem preservados.'
    },
    {
      id: 'onca-pintada',
      name: 'Onça-Pintada',
      scientific_name: 'Panthera onca',
      image: 'https://source.unsplash.com/photo-1482938289607-e9573fc25ebb',
      description: 'O rei do Pantanal, predador de topo da cadeia alimentar.',
      habitat: 'Mata densa e áreas alagadas',
      diet: 'Carnívoro - presas de grande porte',
      curiosities: [
        'Mordida mais forte entre os felinos',
        'Caça principalmente à noite',
        'Símbolo de poder e mistério'
      ],
      is_unlocked: false,
      rarity: 'legendary' as const,
      personality_traits: ['Mistério', 'Intuição', 'Força', 'Independência'],
      personality_why: 'Representa mistério e intuição. Ideal para pessoas independentes e intuitivas.',
      threats: [
        'Perda de habitat',
        'Caça ilegal',
        'Fragmentação de corredores ecológicos',
        'Conflitos com pecuária'
      ],
      conservation_actions: [
        'Proteger grandes áreas contínuas',
        'Criar corredores ecológicos',
        'Educar sobre coexistência',
        'Apoiar reservas naturais'
      ],
      ecosystem_importance: 'Predador de topo essencial para o controle de populações de herbívoros, mantendo o equilíbrio natural do Pantanal.'
    }
  ];

  const handleImportDefaults = async () => {
    if (!confirm(`Deseja importar ${defaultAvatars.length} avatares padrão do Descubra MS? Os avatares que já existem (mesmo nome) serão ignorados.`)) {
      return;
    }

    setUploading(true);
    let imported = 0;
    let skipped = 0;

    try {
      console.log('📥 [PantanalAvatarsManager] Iniciando importação de avatares padrão...');

      for (const avatar of defaultAvatars) {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('pantanal_avatars')
          .select('id')
          .eq('name', avatar.name)
          .maybeSingle();

        if (existing) {
          console.log(`⏭️ [PantanalAvatarsManager] Avatar "${avatar.name}" já existe, pulando...`);
          skipped++;
          continue;
        }

        // Preparar dados para inserção
        const avatarData: Record<string, unknown> = {
          name: avatar.name,
          scientific_name: avatar.scientific_name,
          description: avatar.description,
          image_url: avatar.image,
          habitat: avatar.habitat,
          diet: avatar.diet,
          curiosities: avatar.curiosities,
          is_unlocked: avatar.is_unlocked,
          rarity: avatar.rarity,
          personality_traits: avatar.personality_traits,
          personality_why: avatar.personality_why,
          threats: avatar.threats,
          conservation_actions: avatar.conservation_actions,
          ecosystem_importance: avatar.ecosystem_importance,
          display_order: imported,
          is_active: true,
        };

        // Remover campos undefined
        const cleanData = Object.fromEntries(
          Object.entries(avatarData).filter(([_, v]) => v !== undefined)
        );

        const { error } = await supabase
          .from('pantanal_avatars')
          .insert(cleanData)
          .select()
          .single();

        if (error) {
          console.error(`❌ [PantanalAvatarsManager] Erro ao importar "${avatar.name}":`, error);
          continue;
        }

        console.log(`✅ [PantanalAvatarsManager] Avatar "${avatar.name}" importado com sucesso!`);
        imported++;
      }

      toast({
        title: 'Importação concluída',
        description: `${imported} avatares importados. ${skipped} já existiam e foram ignorados.`,
      });

      await loadAvatars();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PantanalAvatarsManager] Erro na importação:', err);
      toast({
        title: 'Erro na importação',
        description: err.message || 'Não foi possível importar os avatares.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ms-primary-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <AdminPageHeader
          title="Avatares do Pantanal"
          description="Gerencie os avatares de animais do Pantanal disponíveis para os usuários no passaporte digital."
          helpText="Gerencie os avatares de animais do Pantanal disponíveis para os usuários no passaporte digital."
        />
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleImportDefaults}
            disabled={uploading || loading}
          >
            <Download className="w-4 h-4 mr-2" />
            {uploading ? 'Importando...' : 'Importar Avatares Padrão'}
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Avatar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {avatars.map((avatar) => (
          <Card key={avatar.id} className={!avatar.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{avatar.name}</CardTitle>
                  {avatar.scientific_name && (
                    <CardDescription className="italic text-xs mt-1">
                      {avatar.scientific_name}
                    </CardDescription>
                  )}
                </div>
                <Badge className={getRarityColor(avatar.rarity)}>
                  {getRarityText(avatar.rarity)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {avatar.image_url && (
                <div className="aspect-square mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
                  {avatar.image_url ? (
                  <img 
                      key={`${avatar.id}-${avatar.updated_at || avatar.created_at || Date.now()}`}
                      src={`${avatar.image_url}?t=${avatar.updated_at ? new Date(avatar.updated_at).getTime() : avatar.created_at ? new Date(avatar.created_at).getTime() : Date.now()}`}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Erro ao carregar imagem do avatar:', avatar.image_url);
                        // Criar um placeholder SVG inline
                        const placeholderSvg = `data:image/svg+xml,${encodeURIComponent(`<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                          <rect width="300" height="300" fill="#e5e7eb"/>
                          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
                            Imagem não disponível
                          </text>
                        </svg>`)}`;
                        (e.target as HTMLImageElement).src = placeholderSvg;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Sem imagem</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {avatar.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {avatar.description}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(avatar)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(avatar.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {avatars.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum avatar cadastrado ainda.</p>
            <Button onClick={openCreateDialog} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro avatar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Edição/Criação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAvatar ? 'Editar Avatar' : 'Novo Avatar'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Capivara"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scientific_name">Nome Científico</Label>
                  <Input
                    id="scientific_name"
                    value={formData.scientific_name}
                    onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                    placeholder="Ex: Hydrochoerus hydrochaeris"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do animal..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="habitat">Habitat</Label>
                  <Input
                    id="habitat"
                    value={formData.habitat}
                    onChange={(e) => setFormData({ ...formData, habitat: e.target.value })}
                    placeholder="Ex: Margens de rios e lagos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diet">Alimentação</Label>
                  <Input
                    id="diet"
                    value={formData.diet}
                    onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
                    placeholder="Ex: Herbívoro - capim e plantas aquáticas"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="curiosities">Curiosidades (uma por linha)</Label>
                <Textarea
                  id="curiosities"
                  value={formData.curiosities}
                  onChange={(e) => setFormData({ ...formData, curiosities: e.target.value })}
                  placeholder="Pode pesar até 80kg&#10;Excelente nadador&#10;Símbolo de paz e harmonia"
                  rows={4}
                />
              </div>
            </div>

            {/* Imagem */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Imagem
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    setImagePreview(e.target.value || null);
                  }}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_upload">Ou fazer upload</Label>
                <Input
                  id="image_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </div>

              {imagePreview && (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden border">
                  <img 
                    key={`preview-${imageFile ? imageFile.name + imageFile.lastModified : imagePreview}`}
                    src={imagePreview.includes('blob:') || imagePreview.includes('data:') 
                      ? imagePreview 
                      : `${imagePreview}?t=${Date.now()}`} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Erro ao carregar preview da imagem');
                      // Criar um placeholder SVG inline
                      const placeholderSvg = `data:image/svg+xml,${encodeURIComponent(`<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                        <rect width="300" height="300" fill="#e5e7eb"/>
                        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
                          Preview não disponível
                        </text>
                      </svg>`)}`;
                      (e.target as HTMLImageElement).src = placeholderSvg;
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      setFormData({ ...formData, image_url: '' });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Personalidade */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Personalidade
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="personality_traits">Traços de Personalidade (um por linha)</Label>
                <Textarea
                  id="personality_traits"
                  value={formData.personality_traits}
                  onChange={(e) => setFormData({ ...formData, personality_traits: e.target.value })}
                  placeholder="Liderança&#10;Coragem&#10;Mistério&#10;Força"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality_why">Por que escolher este avatar?</Label>
                <Textarea
                  id="personality_why"
                  value={formData.personality_why}
                  onChange={(e) => setFormData({ ...formData, personality_why: e.target.value })}
                  placeholder="Representa força interior e liderança natural..."
                  rows={3}
                />
              </div>
            </div>

            {/* Consciência Ambiental */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Consciência Ambiental
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="threats">Principais Ameaças (uma por linha)</Label>
                <Textarea
                  id="threats"
                  value={formData.threats}
                  onChange={(e) => setFormData({ ...formData, threats: e.target.value })}
                  placeholder="Perda de habitat devido ao desmatamento&#10;Caça ilegal e conflitos com humanos"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conservation_actions">Ações de Conservação (uma por linha)</Label>
                <Textarea
                  id="conservation_actions"
                  value={formData.conservation_actions}
                  onChange={(e) => setFormData({ ...formData, conservation_actions: e.target.value })}
                  placeholder="Proteger corredores ecológicos&#10;Combater a caça ilegal"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ecosystem_importance">Importância no Ecossistema</Label>
                <Textarea
                  id="ecosystem_importance"
                  value={formData.ecosystem_importance}
                  onChange={(e) => setFormData({ ...formData, ecosystem_importance: e.target.value })}
                  placeholder="Como predador de topo, regula as populações..."
                  rows={3}
                />
              </div>
            </div>

            {/* Configurações */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Configurações</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rarity">Raridade</Label>
                  <Select
                    value={formData.rarity}
                    onValueChange={(value: 'common' | 'rare' | 'epic' | 'legendary') => {
                      console.log('🔄 [PantanalAvatarsManager] Raridade alterada para:', value);
                      setFormData({ ...formData, rarity: value });
                    }}
                  >
                    <SelectTrigger id="rarity" className="w-full">
                      <SelectValue placeholder="Selecione a raridade">
                        {formData.rarity === 'common' ? 'Comum' :
                         formData.rarity === 'rare' ? 'Raro' :
                         formData.rarity === 'epic' ? 'Épico' :
                         formData.rarity === 'legendary' ? 'Lendário' :
                         'Selecione a raridade'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent 
                      className="z-[10001] !fixed bg-white"
                      position="popper"
                    >
                      <SelectItem value="common">Comum</SelectItem>
                      <SelectItem value="rare">Raro</SelectItem>
                      <SelectItem value="epic">Épico</SelectItem>
                      <SelectItem value="legendary">Lendário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Ordem de Exibição</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_unlocked"
                  checked={formData.is_unlocked}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_unlocked: checked })}
                />
                <Label htmlFor="is_unlocked">Desbloqueado por padrão</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
