import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import UniversalLayout from '@/components/layout/UniversalLayout';
import PantanalAvatarSelector, { PantanalAnimal } from '@/components/profile/PantanalAvatarSelector';
import UserSettingsModal from '@/components/profile/UserSettingsModal';
import ShareProfileModal from '@/components/profile/ShareProfileModal';
import { PartnerReservationModal } from '@/components/partners/PartnerReservationModal';
import { useIARouteAccess } from '@/hooks/useIARouteAccess';
import { 
  User, 
  Heart, 
  History, 
  Settings,
  Share2,
  Edit3,
  Pencil,
  Sparkles,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  Building2,
  Backpack,
  Star,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { platformContentService } from '@/services/admin/platformContentService';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  selected_avatar?: string;
  avatar_custom_name?: string;
  achievements: any[];
  pantanal_animals: PantanalAnimal[];
  created_at: string;
  updated_at: string;
}

const ProfilePageFixed: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isEditingAvatarName, setIsEditingAvatarName] = useState(false);
  const [avatarCustomName, setAvatarCustomName] = useState('');
  
  // Estado para modal de reserva
  const [selectedPartnerForReservation, setSelectedPartnerForReservation] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Estado do novo fluxo de Roteiros IA
  const [iaPrice, setIaPrice] = useState<number>(49);
  const [iaPaymentLink, setIaPaymentLink] = useState<string>("#");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [showSaveNote, setShowSaveNote] = useState(false);
  const [partnersData, setPartnersData] = useState<any[]>([]);
  
  // Verificar acesso pago aos Roteiros Personalizados
  const { hasAccess: hasIAAccess, loading: loadingAccess } = useIARouteAccess();

  const [formData, setFormData] = useState({
    cidade: "Campo Grande",
    datas: "",
    duracao: "3 dias",
    interesses: ["natureza", "gastronomia"],
    orcamento: "médio",
    hospedagem: "hotel 3-4 estrelas",
    perfil: "família",
    ocasiao: "férias",
  });

  // Dados mockados dos animais do Pantanal
  const pantanalAnimals: PantanalAnimal[] = [
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
      rarity: 'legendary'
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
      rarity: 'epic'
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
      rarity: 'common'
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
      rarity: 'rare'
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
      rarity: 'legendary',
      unlock_requirement: 'Complete 5 roteiros do Passaporte'
    }
  ];

  // Dados mockados de conquistas
  const mockAchievements = [
    {
      id: '1',
      title: 'Primeiro Avatar',
      description: 'Escolha seu primeiro avatar do Pantanal',
      icon: '🎭',
      progress: 1,
      maxProgress: 1,
      isCompleted: true,
      rarity: 'common' as const,
      reward: 'Avatar desbloqueado',
      unlockedAt: new Date()
    },
    {
      id: '2',
      title: 'Explorador do Pantanal',
      description: 'Complete 3 roteiros do Passaporte',
      icon: '🗺️',
      progress: 1,
      maxProgress: 3,
      isCompleted: false,
      rarity: 'rare' as const,
      reward: 'Novo avatar desbloqueado'
    },
    {
      id: '3',
      title: 'Guardião da Natureza',
      description: 'Complete o quiz educativo',
      icon: '🌱',
      progress: 0,
      maxProgress: 1,
      isCompleted: false,
      rarity: 'epic' as const,
      reward: 'Badge especial'
    }
  ];

  const loadAvatars = async (): Promise<PantanalAnimal[]> => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfilePageFixed.tsx:loadAvatars',message:'Carregando avatares do banco',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      const { data, error } = await supabase
        .from('pantanal_avatars')
        .select('*')
        .eq('is_active', true) // Apenas avatares ativos
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao carregar avatares:', error);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfilePageFixed.tsx:loadAvatars',message:'Erro ao carregar avatares',data:{error:error.message,code:error.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        // Retornar dados mockados como fallback
        return pantanalAnimals;
      }

      // Converter dados do banco para o formato esperado
      const avatares: PantanalAnimal[] = (data || []).map((avatar) => ({
        id: avatar.id,
        name: avatar.name,
        scientific_name: avatar.scientific_name || '',
        image: avatar.image_url || '', // Usar image_url do banco
        description: avatar.description || '',
        habitat: avatar.habitat || '',
        diet: avatar.diet || '',
        curiosities: avatar.curiosities || [],
        is_unlocked: avatar.is_unlocked ?? true,
        rarity: avatar.rarity || 'common',
        unlock_requirement: avatar.unlock_requirement || undefined
      }));

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfilePageFixed.tsx:loadAvatars',message:'Avatares carregados com sucesso',data:{count:avatares.length,hasImages:avatares.filter(a=>a.image).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.log('✅ Avatares carregados do banco:', avatares.length);
      return avatares.length > 0 ? avatares : pantanalAnimals; // Fallback para mockados se não houver dados
    } catch (error: any) {
      console.error('Erro ao carregar avatares:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfilePageFixed.tsx:loadAvatars',message:'Erro geral ao carregar avatares',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return pantanalAnimals; // Fallback para mockados
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Simular carregamento do perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar perfil do banco de dados
      const { data: dbProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      // Carregar avatares do banco
      const avatares = await loadAvatars();
      
      const mockProfile: UserProfile = {
        id: user?.id || '1',
        full_name: dbProfile?.full_name || user?.user_metadata?.full_name || 'Usuário',
        email: user?.email || 'usuario@exemplo.com',
        avatar_url: dbProfile?.avatar_url || user?.user_metadata?.avatar_url,
        selected_avatar: dbProfile?.selected_avatar || 'jaguar',
        avatar_custom_name: dbProfile?.avatar_custom_name || null,
        achievements: mockAchievements,
        pantanal_animals: avatares, // Usar avatares do banco
        created_at: dbProfile?.created_at || new Date().toISOString(),
        updated_at: dbProfile?.updated_at || new Date().toISOString()
      };
      
      setProfile(mockProfile);
      setAvatarCustomName(mockProfile.avatar_custom_name || '');
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil do usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !profile) {
      loadUserProfile();
    }
  }, [user, profile]);

  // Carregar configurações (preço/link) do admin para Roteiros Personalizados
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await platformContentService.getContent([
          "ia_route_price_ms",
          "ia_route_payment_link_ms",
        ]);
        const price = parseFloat(
          data.find((d: any) => d.content_key === "ia_route_price_ms")?.content_value || "49"
        );
        const link =
          data.find((d: any) => d.content_key === "ia_route_payment_link_ms")?.content_value || 
          "https://buy.stripe.com/test_28EaEZctqgkd7gw02n43S01"; // Fallback para link de teste
        
        if (!Number.isNaN(price)) setIaPrice(price);
        
        // Validar se o link é válido
        if (link && link !== "#" && link.startsWith("http")) {
          setIaPaymentLink(link);
          console.log("✅ Link de pagamento carregado:", link);
        } else {
          // Usar link de teste como fallback
          const fallbackLink = "https://buy.stripe.com/test_28EaEZctqgkd7gw02n43S01";
          setIaPaymentLink(fallbackLink);
          console.warn("⚠️ Link de pagamento não configurado, usando link de teste:", fallbackLink);
        }
      } catch (error) {
        console.warn("⚠️ Não foi possível carregar configs IA; usando defaults.", error);
        // Fallback para link de teste em caso de erro
        setIaPaymentLink("https://buy.stripe.com/test_28EaEZctqgkd7gw02n43S01");
      }
    };
    loadSettings();
  }, []);

  const interessesDisponiveis = useMemo(
    () => [
      { id: "natureza", label: "Natureza" },
      { id: "gastronomia", label: "Gastronomia" },
      { id: "cultura", label: "Cultura" },
      { id: "aventura", label: "Aventura" },
      { id: "familia", label: "Família" },
    ],
    []
  );

  const handleInterestToggle = (id: string) => {
    setFormData((prev) => {
      const exists = prev.interesses.includes(id);
      return {
        ...prev,
        interesses: exists ? prev.interesses.filter((i) => i !== id) : [...prev.interesses, id],
      };
    });
  };

  // Buscar parceiros reais baseado na cidade
  useEffect(() => {
    const loadPartners = async () => {
      if (!formData.cidade) return;
      
      try {
        const { data, error } = await supabase
          .from('institutional_partners')
          .select('id, name, partner_type, description, address')
          .eq('is_active', true)
          .eq('status', 'approved')
          .limit(10);

        if (error) {
          console.error('Erro ao buscar parceiros:', error);
          return;
        }

        // Filtrar por cidade (se address contém a cidade)
        const filtered = (data || []).filter((p: any) => 
          !formData.cidade || 
          !p.address || 
          p.address.toLowerCase().includes(formData.cidade.toLowerCase())
        );

        setPartnersData(filtered);
      } catch (error) {
        console.error('Erro ao carregar parceiros:', error);
      }
    };

    loadPartners();
  }, [formData.cidade]);

  const handleGenerate = async () => {
    // Verificar acesso antes de gerar
    if (!hasIAAccess && !loadingAccess) {
      toast({
        title: 'Acesso necessário',
        description: `Para gerar roteiros personalizados, é necessário ativar o acesso por R$ ${iaPrice.toFixed(2)}`,
        variant: 'default',
      });
      return;
    }

    console.log('🔍 [ProfilePageFixed] Gerando roteiro IA com dados:', formData);
    setIsGenerating(true);
    setShowSaveNote(false);
    
    // Mock de geração para evitar chamadas externas
    setTimeout(() => {
      const dias = [
        {
          titulo: "Dia 1 — Chegada e Centro",
          atividades: [
            "Check-in em hotel parceiro no centro",
            "Almoço com gastronomia sul-mato-grossense",
            "Passeio a pé pela praça principal e museu local",
          ],
        },
        {
          titulo: "Dia 2 — Natureza e cultura",
          atividades: [
            "Trilha leve guiada em parque urbano",
            "Visita a feira de artesanato e café regional",
            "Evento local no período (se disponível)",
          ],
        },
        {
          titulo: "Dia 3 — Experiência com parceiros",
          atividades: [
            "Passeio opcional com agência credenciada",
            "Sugestão de restaurante parceiro",
            "Encerramento e feedback",
          ],
        },
      ];

      const eventos = [
        { nome: "Festival Gastronômico", cidade: formData.cidade, data: "Próximo fim de semana" },
        { nome: "Feira de Artes e Cultura", cidade: formData.cidade, data: "Sábado" },
      ];

      // Usar parceiros reais se disponíveis, senão usar mock
      const parceiros = partnersData.length > 0
        ? partnersData.slice(0, 3).map((p: any) => ({
            id: p.id,
            tipo: p.partner_type || 'Parceiro',
            nome: p.name,
          }))
        : [
            { id: null, tipo: "Hotel", nome: "Hotel Pantanal Center" },
            { id: null, tipo: "Agência", nome: "Agência MS Tours" },
            { id: null, tipo: "Transfer", nome: "Translado Conforto MS" },
          ];

      const passaporte = {
        match: true,
        rota: "Roteiro do Pantanal",
      };

      setGeneratedPlan({
        resumo: {
          cidade: formData.cidade,
          duracao: formData.duracao,
          interesses: formData.interesses,
          orcamento: formData.orcamento,
          hospedagem: formData.hospedagem,
          perfil: formData.perfil,
          ocasiao: formData.ocasiao,
        },
        dias,
        eventos,
        parceiros,
        passaporte,
      });
      setIsGenerating(false);
      setShowSaveNote(true);
      console.log('✅ [ProfilePageFixed] Roteiro gerado com sucesso');
    }, 800);
  };

  const handleAvatarSelect = async (animalId: string) => {
    if (!profile || !user) {
      setShowAvatarSelector(false);
      return;
    }

    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('user_profiles')
        .update({ selected_avatar: animalId })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar avatar:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o avatar.",
          variant: "destructive",
        });
        setShowAvatarSelector(false);
        return;
      }

      // Atualizar estado local imediatamente para feedback visual
      const updatedProfile = {
        ...profile,
        selected_avatar: animalId
      };
      setProfile(updatedProfile);
      
      // Recarregar perfil completo do banco em background para garantir sincronização
      const { data: dbProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbProfile) {
        setProfile({
          ...updatedProfile,
          avatar_custom_name: dbProfile.avatar_custom_name || undefined
      });
      }
      
      toast({
        title: "Avatar Atualizado!",
        description: "Seu avatar foi alterado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o avatar.",
        variant: "destructive",
      });
    } finally {
      // Sempre fechar o modal
      setShowAvatarSelector(false);
    }
  };

  const handleSaveAvatarName = async () => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ avatar_custom_name: avatarCustomName || null })
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao salvar nome do avatar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o nome personalizado.",
        variant: "destructive",
      });
      return;
    }

    setProfile({
      ...profile,
      avatar_custom_name: avatarCustomName || undefined
    });

    setIsEditingAvatarName(false);
    toast({
      title: "Nome Salvo!",
      description: "O nome personalizado do avatar foi salvo com sucesso.",
    });
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
  };

  // Recalcular selectedAnimal sempre que profile.selected_avatar mudar
  // IMPORTANTE: useMemo deve estar antes dos returns condicionais
  const selectedAnimal = useMemo(() => {
    if (!profile) return null;
    const animals = profile?.pantanal_animals || pantanalAnimals;
    return animals.find(animal => animal.id === profile.selected_avatar);
  }, [profile?.selected_avatar, profile?.pantanal_animals]);

  if (loading) {
    return (
      <UniversalLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ms-primary-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando perfil do usuário...</p>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  if (!profile) {
    return (
      <UniversalLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil não encontrado</h2>
            <p className="text-gray-600">Não foi possível carregar o perfil do usuário.</p>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  return (
    <UniversalLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="ms-container py-8">
          {/* Header do Perfil */}
          <Card className="shadow-lg border-0 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedAnimal?.image} alt={profile.full_name} />
                    <AvatarFallback className="text-2xl">
                      {profile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedAnimal && (
                    <Badge className="absolute -bottom-2 -right-2 bg-green-600 text-white">
                      {profile.avatar_custom_name || selectedAnimal.name}
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.full_name}
                  </h1>
                  <p className="text-gray-600 mb-4">{profile.email}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Button
                      onClick={() => setShowAvatarSelector(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar Avatar
                    </Button>
                    <Button variant="outline" onClick={() => setShowShare(true)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button variant="outline" onClick={() => setShowSettings(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs do Perfil */}
          <div className="space-y-3">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
                <TabsTrigger value="profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="animals" className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Animais
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center">
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="roteiros-ia" className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Roteiros Personalizados
                </TabsTrigger>
              </TabsList>

              {/* Conteúdo das Tabs */}
              <TabsContent value="profile">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Informações do Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                      <p className="text-gray-900">{profile.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Avatar Atual
                        {selectedAnimal && (
                          <span className="text-xs text-gray-500 ml-2 font-normal">
                            (Clique no ícone de lápis para personalizar o nome)
                          </span>
                        )}
                      </label>
                      <div className="flex items-center gap-2">
                        {isEditingAvatarName ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={avatarCustomName}
                              onChange={(e) => setAvatarCustomName(e.target.value)}
                              placeholder={`Nome personalizado (ex: ${selectedAnimal?.name})`}
                              className="flex-1"
                              maxLength={50}
                            />
                            <Button
                              size="sm"
                              onClick={handleSaveAvatarName}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsEditingAvatarName(false);
                                setAvatarCustomName(profile.avatar_custom_name || '');
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">
                                {profile.avatar_custom_name || selectedAnimal?.name || 'Nenhum selecionado'}
                              </p>
                              {profile.avatar_custom_name && selectedAnimal && (
                                <p className="text-gray-500 text-sm mt-1">
                                  Espécie: {selectedAnimal.name}
                                </p>
                              )}
                            </div>
                            {selectedAnimal && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setIsEditingAvatarName(true);
                                  setAvatarCustomName(profile.avatar_custom_name || '');
                                }}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="hidden sm:inline">Personalizar Nome</span>
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Membro desde</label>
                      <p className="text-gray-900">
                        {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="animals">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Animais do Pantanal
                  </CardTitle>
                  <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-green-700">Os avatares do Pantanal</strong> são uma forma única de se conectar com a biodiversidade de Mato Grosso do Sul. 
                      Cada animal representa traços de personalidade e características especiais que podem refletir quem você é. 
                      Ao escolher um avatar, você não apenas personaliza seu perfil, mas também aprende sobre a importância de cada espécie 
                      para o ecossistema do Pantanal. Explore os animais abaixo, descubra suas características e escolha aquele que mais 
                      representa você!
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(profile?.pantanal_animals || pantanalAnimals).map((animal) => (
                      <Card key={animal.id} className="overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100">
                          <img 
                            src={animal.image} 
                            alt={animal.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg">{animal.name}</h3>
                          <p className="text-sm text-gray-600 italic">{animal.scientific_name}</p>
                          <p className="text-sm text-gray-700 mt-2">{animal.description}</p>
                          <Badge className={`mt-2 ${
                            animal.rarity === 'legendary' ? 'bg-yellow-500' :
                            animal.rarity === 'epic' ? 'bg-purple-500' :
                            animal.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'
                          } text-white`}>
                            {animal.rarity === 'legendary' ? 'Lendário' :
                             animal.rarity === 'epic' ? 'Épico' :
                             animal.rarity === 'rare' ? 'Raro' : 'Comum'}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Histórico de Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800">Avatar Selecionado</h4>
                      <p className="text-green-700 text-sm">
                        Você escolheu o {selectedAnimal?.name} como seu avatar
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {new Date().toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-800">Perfil Criado</h4>
                      <p className="text-blue-700 text-sm">
                        Bem-vindo ao Descubra Mato Grosso do Sul!
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Roteiros Personalizados */}
            <TabsContent value="roteiros-ia">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-ms-primary-blue/5">
                <CardHeader className="bg-gradient-to-r from-ms-primary-blue/10 to-ms-discovery-teal/10 border-b border-ms-primary-blue/20">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-ms-primary-blue" />
                    Roteiros Personalizados (MS)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <p className="text-sm text-gray-600">
                    Use suas preferências já coletadas no perfil. Ajuste qualquer campo, gere um roteiro rápido e ative pelo link do Stripe (valor editável no admin). Parceiros e Passaporte aparecem só se fizerem sentido para a região/tema.
                  </p>

                  {/* Bloqueio de acesso */}
                  {!hasIAAccess && !loadingAccess && (
                    <Card className="bg-gradient-to-br from-ms-primary-blue/10 to-ms-discovery-teal/10 border-2 border-ms-primary-blue/30">
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-ms-primary-blue">
                          <DollarSign className="w-8 h-8" />
                          <h3 className="text-xl font-bold">Acesso Premium Necessário</h3>
                        </div>
                        <p className="text-gray-700">
                          Para gerar roteiros personalizados, é necessário ativar o acesso premium.
                        </p>
                        <div className="bg-white rounded-lg p-4 border border-ms-primary-blue/20">
                          <p className="text-3xl font-bold text-ms-primary-blue mb-2">
                            R$ {iaPrice.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Acesso único para gerar roteiros personalizados
                          </p>
                        </div>
                        <Button 
                          onClick={() => {
                            if (iaPaymentLink && iaPaymentLink !== "#" && iaPaymentLink.startsWith("http")) {
                              window.open(iaPaymentLink, "_blank", "noopener,noreferrer");
                            } else {
                              toast({
                                title: "Link não configurado",
                                description: "O link de pagamento ainda não foi configurado. Entre em contato com o suporte.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white w-full"
                          size="lg"
                          disabled={!iaPaymentLink || iaPaymentLink === "#" || !iaPaymentLink.startsWith("http")}
                        >
                          Ativar Acesso Premium — R$ {iaPrice.toFixed(2)}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {showSaveNote && hasIAAccess && (
                    <div className="bg-gradient-to-r from-ms-primary-blue/10 to-ms-discovery-teal/10 border border-ms-primary-blue/30 text-ms-primary-blue text-sm rounded-lg p-3">
                      Para salvar/ativar, use o botão de pagamento. O admin pode editar preço e link. PDF e edição completa serão habilitados após ativação.
                    </div>
                  )}

                  {/* Formulário compacto */}
                  {hasIAAccess && (
                    <Card className="border-ms-primary-blue/20 shadow-md">
                      <CardHeader className="bg-gradient-to-r from-ms-primary-blue/5 to-ms-discovery-teal/5 border-b border-ms-primary-blue/20">
                        <CardTitle className="text-lg text-gray-900">Preferências de viagem</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cidade-ia">Cidade/Região (MS)</Label>
                          <Input
                            id="cidade-ia"
                            value={formData.cidade}
                            onChange={(e) => setFormData((p) => ({ ...p, cidade: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duracao-ia">Duração</Label>
                          <Input
                            id="duracao-ia"
                            value={formData.duracao}
                            onChange={(e) => setFormData((p) => ({ ...p, duracao: e.target.value }))}
                            placeholder="Ex.: 3 dias"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Interesses</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {interessesDisponiveis.map((item) => {
                              const active = formData.interesses.includes(item.id);
                              return (
                                <Button
                                  key={item.id}
                                  type="button"
                                  variant={active ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleInterestToggle(item.id)}
                                  className={active ? "bg-blue-600 text-white" : ""}
                                >
                                  {item.label}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Orçamento</Label>
                            <Input
                              value={formData.orcamento}
                              onChange={(e) => setFormData((p) => ({ ...p, orcamento: e.target.value }))}
                              placeholder="Ex.: baixo / médio / alto"
                            />
                          </div>
                          <div>
                            <Label>Hospedagem</Label>
                            <Input
                              value={formData.hospedagem}
                              onChange={(e) => setFormData((p) => ({ ...p, hospedagem: e.target.value }))}
                              placeholder="Ex.: hotel 3-4 estrelas"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Perfil</Label>
                          <Input
                            value={formData.perfil}
                            onChange={(e) => setFormData((p) => ({ ...p, perfil: e.target.value }))}
                            placeholder="família / casal / solo"
                          />
                        </div>
                        <div>
                          <Label>Ocasião</Label>
                          <Input
                            value={formData.ocasiao}
                            onChange={(e) => setFormData((p) => ({ ...p, ocasiao: e.target.value }))}
                            placeholder="férias, negócios..."
                          />
                        </div>
                        <div>
                          <Label>Datas (opcional)</Label>
                          <Input
                            value={formData.datas}
                            onChange={(e) => setFormData((p) => ({ ...p, datas: e.target.value }))}
                            placeholder="Ex.: 10-12/03"
                          />
                        </div>
                      </div>

                        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-ms-primary-blue" />
                            <span>Roteiro personalizado com IA</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setGeneratedPlan(null)}
                              className="border-ms-primary-blue/30 hover:bg-ms-primary-blue/10"
                            >
                              Limpar
                            </Button>
                            <Button 
                              onClick={handleGenerate} 
                              disabled={isGenerating || loadingAccess}
                              className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white"
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Gerando...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Gerar Roteiro IA
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Resultado */}
                  {generatedPlan && hasIAAccess && (
                    <div className="space-y-4">
                      <Card className="border-2 border-ms-primary-blue/30 bg-gradient-to-br from-white to-ms-discovery-teal/5 shadow-lg">
                        <CardHeader className="pb-3 bg-gradient-to-r from-ms-primary-blue/10 to-ms-discovery-teal/10 border-b border-ms-primary-blue/20">
                          <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                            <Sparkles className="w-5 h-5 text-ms-primary-blue" />
                            Roteiro gerado (MS)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2 bg-white/50 p-3 rounded-lg border border-ms-primary-blue/10">
                              <MapPin className="w-4 h-4 text-ms-primary-blue" />
                              <span className="font-medium">{generatedPlan.resumo.cidade}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 p-3 rounded-lg border border-ms-primary-blue/10">
                              <CalendarIcon className="w-4 h-4 text-ms-primary-blue" />
                              <span className="font-medium">{generatedPlan.resumo.duracao}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 p-3 rounded-lg border border-ms-primary-blue/10">
                              <Backpack className="w-4 h-4 text-ms-primary-blue" />
                              <span className="font-medium">Interesses: {generatedPlan.resumo.interesses.join(", ")}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 p-3 rounded-lg border border-ms-primary-blue/10">
                              <Building2 className="w-4 h-4 text-ms-primary-blue" />
                              <span className="font-medium">Hospedagem: {generatedPlan.resumo.hospedagem}</span>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            {generatedPlan.dias.map((dia: any, idx: number) => (
                              <Card key={idx} className="border-ms-primary-blue/20 bg-gradient-to-br from-white to-ms-primary-blue/5 hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2 bg-gradient-to-r from-ms-primary-blue/10 to-transparent">
                                  <CardTitle className="text-sm font-semibold text-ms-primary-blue">
                                    {dia.titulo}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 pt-3">
                                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {dia.atividades.map((a: string, i: number) => (
                                      <li key={i} className="hover:text-ms-primary-blue transition-colors">{a}</li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <Card className="border-ms-primary-blue/20 bg-gradient-to-br from-white to-amber-50/30">
                              <CardHeader className="pb-2 bg-gradient-to-r from-amber-100/50 to-transparent">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                                  <Star className="w-4 h-4 text-amber-500" />
                                  Eventos sugeridos
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm text-gray-700 pt-3">
                                {generatedPlan.eventos.map((ev: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-white/50 transition-colors">
                                    <span className="font-medium">{ev.nome}</span>
                                    <span className="text-gray-500 text-xs">{ev.data}</span>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>

                            <Card className="border-ms-primary-blue/20 bg-gradient-to-br from-white to-ms-discovery-teal/5">
                              <CardHeader className="pb-2 bg-gradient-to-r from-ms-discovery-teal/10 to-transparent">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                                  <Building2 className="w-4 h-4 text-ms-primary-blue" />
                                  Parceiros sugeridos
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm text-gray-700 pt-3">
                                {generatedPlan.parceiros.map((p: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-white/50 transition-colors">
                                    <div className="flex flex-col">
                                      <span className="font-medium text-gray-900">{p.nome}</span>
                                      <span className="text-xs text-gray-500">{p.tipo}</span>
                                    </div>
                                    {p.id && (
                                      <Button
                                        size="sm"
                                        onClick={() => setSelectedPartnerForReservation({ id: p.id, name: p.nome })}
                                        className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white text-xs h-7"
                                      >
                                        Reservar
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <p className="text-xs text-gray-500 mt-2">
                                  Usando apenas parceiros cadastrados.
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          {generatedPlan.passaporte?.match && (
                            <div className="bg-gradient-to-r from-ms-primary-blue/10 to-ms-discovery-teal/10 border-2 border-ms-primary-blue/30 rounded-lg p-4 text-sm text-ms-primary-blue">
                              <span className="font-semibold">🎫 Passaporte sugerido: </span>
                              {generatedPlan.passaporte.rota}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3 pt-4 border-t border-ms-primary-blue/20">
                            <Button 
                              onClick={() => {
                                if (iaPaymentLink && iaPaymentLink !== "#" && iaPaymentLink.startsWith("http")) {
                                  window.open(iaPaymentLink, "_blank", "noopener,noreferrer");
                                } else {
                                  toast({
                                    title: "Link não configurado",
                                    description: "O link de pagamento ainda não foi configurado. Entre em contato com o suporte.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:from-ms-primary-blue/90 hover:to-ms-discovery-teal/90 text-white shadow-md"
                              disabled={!iaPaymentLink || iaPaymentLink === "#" || !iaPaymentLink.startsWith("http")}
                            >
                              💾 Salvar Roteiro — R$ {iaPrice.toFixed(2)}
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-ms-primary-blue/30 hover:bg-ms-primary-blue/10"
                            >
                              📄 Exportar PDF
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setGeneratedPlan(null)}
                              className="border-ms-primary-blue/30 hover:bg-ms-primary-blue/10"
                            >
                              ✏️ Editar respostas
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

        {/* Modal de Reserva de Parceiro */}
        {selectedPartnerForReservation && (
          <PartnerReservationModal
            partnerId={selectedPartnerForReservation.id}
            partnerName={selectedPartnerForReservation.name}
            isOpen={!!selectedPartnerForReservation}
            onClose={() => setSelectedPartnerForReservation(null)}
            suggestedDate={formData.datas || undefined}
            suggestedGuests={formData.perfil === 'família' ? 4 : formData.perfil === 'casal' ? 2 : 1}
          />
        )}

        {/* Avatar Selector Modal */}
        {showAvatarSelector && (
          <PantanalAvatarSelector
            animals={profile?.pantanal_animals || pantanalAnimals}
            selectedAvatar={profile.selected_avatar || null}
            onSelect={handleAvatarSelect}
            onClose={() => setShowAvatarSelector(false)}
          />
        )}

        {/* Settings Modal */}
        {showSettings && profile && (
          <UserSettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            userProfile={{
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              avatar_url: profile.avatar_url
            }}
            onProfileUpdate={handleProfileUpdate}
          />
        )}

        {/* Share Profile Modal */}
        {showShare && profile && (
          <ShareProfileModal
            isOpen={showShare}
            onClose={() => setShowShare(false)}
            userProfile={{
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              avatar_url: profile.avatar_url
            }}
          />
        )}
      </div>
    </UniversalLayout>
  );
};

export default ProfilePageFixed;
