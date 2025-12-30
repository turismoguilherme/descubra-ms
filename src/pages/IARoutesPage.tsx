import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { PartnerReservationModal } from '@/components/partners/PartnerReservationModal';
import { useIARouteAccess } from '@/hooks/useIARouteAccess';
import { useUserProfile } from '@/hooks/useUserProfile';
import { iaRouteService, RouteGenerationInput, GeneratedRoute } from '@/services/iaRouteService';
import { 
  Sparkles,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  Building2,
  Backpack,
  Star,
  Loader2,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const interessesDisponiveis = [
  { id: 'natureza', label: 'Natureza' },
  { id: 'gastronomia', label: 'Gastronomia' },
  { id: 'cultura', label: 'Cultura' },
  { id: 'aventura', label: 'Aventura' },
  { id: 'historia', label: 'História' },
  { id: 'compras', label: 'Compras' },
  { id: 'relaxamento', label: 'Relaxamento' },
];

export default function IARoutesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [iaPrice, setIaPrice] = useState<number>(49);
  const [iaPaymentLink, setIaPaymentLink] = useState<string>("#");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [showSaveNote, setShowSaveNote] = useState(false);
  const [partnersData, setPartnersData] = useState<any[]>([]);
  
  // Verificar acesso pago aos Roteiros Personalizados
  const { hasAccess: hasIAAccess, isTestMode, loading: loadingAccess } = useIARouteAccess();
  
  // Buscar perfil do usuário para personalização
  const {
    profile: userProfile,
    loading: profileLoading,
    getInterestsFromProfile,
    getTravelProfile,
    getPreferredCity,
    getPreferredDuration,
    hasCompleteProfile,
  } = useUserProfile();

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
  
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  const [selectedPartnerForReservation, setSelectedPartnerForReservation] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Carregar configurações (preço/link) do admin para Roteiros Personalizados
  useEffect(() => {
    const loadIARouteSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('platform', 'ms')
          .eq('setting_key', 'ia_route_price')
          .maybeSingle();

        if (data?.setting_value) {
          const settings = data.setting_value as { price?: number; payment_link?: string };
          if (settings.price) setIaPrice(settings.price);
          if (settings.payment_link) setIaPaymentLink(settings.payment_link);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de Roteiros Personalizados:', error);
      }
    };

    loadIARouteSettings();
  }, []);

  // Preencher formulário automaticamente com dados do perfil
  useEffect(() => {
    if (!hasAutoFilled && !profileLoading && hasCompleteProfile && userProfile) {
      const interests = getInterestsFromProfile();
      const travelProfile = getTravelProfile();
      const preferredCity = getPreferredCity();
      const preferredDuration = getPreferredDuration();

      setFormData(prev => ({
        ...prev,
        cidade: preferredCity,
        duracao: preferredDuration,
        interesses: interests.length > 0 ? interests : prev.interesses,
        perfil: travelProfile,
        // Mapear orçamento baseado em dados do perfil se disponível
        orcamento: prev.orcamento, // Manter ou derivar de outros campos se necessário
      }));

      setHasAutoFilled(true);
      
      toast({
        title: 'Formulário preenchido',
        description: 'Preenchemos o formulário com base no seu perfil. Você pode editar qualquer campo.',
        duration: 3000,
      });
    }
  }, [userProfile, profileLoading, hasCompleteProfile, hasAutoFilled, getInterestsFromProfile, getTravelProfile, getPreferredCity, getPreferredDuration, toast]);

  // Carregar parceiros
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const { data } = await supabase
          .from('institutional_partners')
          .select('id, name, partner_type, address')
          .eq('status', 'approved')
          .limit(50);

        if (data) {
          setPartnersData(data);
        }
      } catch (error) {
        console.error('Erro ao carregar parceiros:', error);
      }
    };

    loadPartners();
  }, []);

  const handleInterestToggle = (interestId: string) => {
    setFormData((prev) => ({
      ...prev,
      interesses: prev.interesses.includes(interestId)
        ? prev.interesses.filter((id) => id !== interestId)
        : [...prev.interesses, interestId],
    }));
  };

  const handleGenerate = async () => {
    if (!hasIAAccess) {
      toast({
        title: 'Acesso necessário',
        description: `Para gerar roteiros personalizados, é necessário ativar o acesso por R$ ${iaPrice.toFixed(2)}`,
        variant: 'default',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para gerar roteiros.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      toast({
        title: 'Gerando roteiro...',
        description: 'Estamos criando um roteiro personalizado para você. Isso pode levar alguns segundos.',
        duration: 3000,
      });

      // Preparar dados de entrada
      const routeInput: RouteGenerationInput = {
        cidade: formData.cidade,
        datas: formData.datas || undefined,
        duracao: formData.duracao,
        interesses: formData.interesses,
        orcamento: formData.orcamento,
        hospedagem: formData.hospedagem,
        perfil: formData.perfil,
        ocasiao: formData.ocasiao,
        userProfile: userProfile || undefined,
      };

      // Gerar roteiro com IA
      const generatedRoute = await iaRouteService.generateRoute(routeInput);

      // Salvar roteiro no banco de dados
      try {
        const { error: saveError } = await supabase
          .from('user_routes')
          .insert({
            user_id: user.id,
            input_data: routeInput,
            route_data: generatedRoute,
            title: `Roteiro ${formData.cidade} - ${formData.duracao}`,
          });

        if (saveError) {
          console.error('Erro ao salvar roteiro:', saveError);
          // Não bloquear se falhar ao salvar
        } else {
          console.log('✅ Roteiro salvo com sucesso');
        }
      } catch (saveErr) {
        console.error('Erro ao salvar roteiro:', saveErr);
      }

      setGeneratedPlan(generatedRoute);
      setShowSaveNote(true);

      toast({
        title: 'Roteiro gerado!',
        description: 'Seu roteiro personalizado está pronto. Você pode salvá-lo ou exportá-lo.',
        duration: 4000,
      });
    } catch (error: any) {
      console.error('Erro ao gerar roteiro:', error);
      toast({
        title: 'Erro ao gerar roteiro',
        description: error.message || 'Não foi possível gerar o roteiro. Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <UniversalLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal rounded-xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Roteiros Personalizados</h1>
              <p className="text-gray-600 mt-1">Crie roteiros únicos com inteligência artificial</p>
            </div>
          </div>
        </div>

        {/* Bloqueio de acesso - Design melhorado */}
        {!hasIAAccess && !loadingAccess && (
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-ms-primary-blue/5 to-ms-discovery-teal/5 overflow-hidden mb-6">
            <div className="relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-ms-primary-blue/20 to-ms-discovery-teal/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <CardContent className="p-6 md:p-8 relative">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Ícone */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="p-4 bg-gradient-to-br from-ms-primary-blue/20 to-ms-discovery-teal/20 rounded-2xl border-2 border-ms-primary-blue/30">
                      <Lock className="w-12 h-12 text-ms-primary-blue" />
                    </div>
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1 w-full text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-2">
                      <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-ms-primary-blue" />
                      Acesso Premium Necessário
                    </h3>
                    <p className="text-gray-700 mb-6 text-sm md:text-base">
                      Desbloqueie o poder da inteligência artificial para criar roteiros personalizados únicos para sua viagem.
                    </p>
                    
                    {/* Preço destacado */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                      <div className="flex-1 bg-white rounded-xl p-4 border-2 border-ms-primary-blue/30 shadow-md">
                        <p className="text-xs md:text-sm text-gray-600 mb-1">Investimento único</p>
                        <p className="text-3xl md:text-4xl font-bold text-ms-primary-blue">
                          R$ {iaPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="hidden sm:block h-12 w-px bg-gray-300"></div>
                      <div className="flex-1 bg-white rounded-xl p-4 border-2 border-ms-primary-blue/30 shadow-md">
                        <p className="text-xs md:text-sm text-gray-600 mb-1">Benefícios</p>
                        <p className="text-sm md:text-base font-semibold text-gray-900">Roteiros ilimitados</p>
                      </div>
                    </div>
                    
                    {/* Botão de ação */}
                    <div className="flex justify-center">
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
                        className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:from-ms-primary-blue/90 hover:to-ms-discovery-teal/90 text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold"
                        size="lg"
                        disabled={!iaPaymentLink || iaPaymentLink === "#" || !iaPaymentLink.startsWith("http")}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Ativar Acesso Premium
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Acesso liberado - Badge */}
        {hasIAAccess && (
          <div className="mb-6 flex justify-center md:justify-start gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-full px-4 py-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Acesso Premium Ativo</span>
            </div>
            {isTestMode && (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-full px-4 py-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-800">Modo de Teste Ativo</span>
              </div>
            )}
          </div>
        )}

        {showSaveNote && hasIAAccess && (
          <Card className="mb-6 border-2 border-ms-primary-blue/30 bg-gradient-to-r from-ms-primary-blue/10 to-ms-discovery-teal/10">
            <CardContent className="p-4">
              <p className="text-sm text-ms-primary-blue font-medium">
                💡 Para salvar seu roteiro, use o botão de pagamento após gerar. O admin pode editar preço e link. PDF e edição completa serão habilitados após ativação.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Formulário - Design melhorado */}
        {hasIAAccess && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-ms-primary-blue/5 mb-6">
            <CardHeader className="bg-gradient-to-r from-ms-primary-blue/10 to-ms-discovery-teal/10 border-b border-ms-primary-blue/20">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Backpack className="w-5 h-5 text-ms-primary-blue" />
                Preferências de Viagem
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Ajuste os campos abaixo para criar um roteiro personalizado com base nas suas preferências.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Cidade e Duração */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade-ia" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-ms-primary-blue flex-shrink-0" />
                    Cidade/Região (MS)
                  </Label>
                  <Input
                    id="cidade-ia"
                    value={formData.cidade}
                    onChange={(e) => setFormData((p) => ({ ...p, cidade: e.target.value }))}
                    className="border-gray-300 focus:border-ms-primary-blue focus:ring-ms-primary-blue w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracao-ia" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-ms-primary-blue flex-shrink-0" />
                    Duração
                  </Label>
                  <Input
                    id="duracao-ia"
                    value={formData.duracao}
                    onChange={(e) => setFormData((p) => ({ ...p, duracao: e.target.value }))}
                    placeholder="Ex.: 3 dias"
                    className="border-gray-300 focus:border-ms-primary-blue focus:ring-ms-primary-blue w-full"
                  />
                </div>
              </div>

              {/* Interesses - Design melhorado */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 block mb-2">Interesses</Label>
                <div className="flex flex-wrap gap-2">
                  {interessesDisponiveis.map((item) => {
                    const active = formData.interesses.includes(item.id);
                    return (
                      <Button
                        key={item.id}
                        type="button"
                        variant={active ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInterestToggle(item.id)}
                        className={`transition-all whitespace-nowrap ${
                          active 
                            ? "bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white shadow-md hover:shadow-lg" 
                            : "border-gray-300 hover:border-ms-primary-blue hover:bg-ms-primary-blue/5"
                        }`}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Orçamento e Hospedagem */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 block">Orçamento</Label>
                  <Input
                    value={formData.orcamento}
                    onChange={(e) => setFormData((p) => ({ ...p, orcamento: e.target.value }))}
                    placeholder="Ex.: baixo / médio / alto"
                    className="border-gray-300 focus:border-ms-primary-blue focus:ring-ms-primary-blue w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 block">Hospedagem</Label>
                  <Input
                    value={formData.hospedagem}
                    onChange={(e) => setFormData((p) => ({ ...p, hospedagem: e.target.value }))}
                    placeholder="Ex.: hotel 3-4 estrelas"
                    className="border-gray-300 focus:border-ms-primary-blue focus:ring-ms-primary-blue w-full"
                  />
                </div>
              </div>

              {/* Perfil, Ocasião e Datas */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 block">Perfil</Label>
                  <Input
                    value={formData.perfil}
                    onChange={(e) => setFormData((p) => ({ ...p, perfil: e.target.value }))}
                    placeholder="família / casal / solo"
                    className="border-gray-300 focus:border-ms-primary-blue focus:ring-ms-primary-blue w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 block">Ocasião</Label>
                  <Input
                    value={formData.ocasiao}
                    onChange={(e) => setFormData((p) => ({ ...p, ocasiao: e.target.value }))}
                    placeholder="férias, negócios..."
                    className="border-gray-300 focus:border-ms-primary-blue focus:ring-ms-primary-blue w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 block">Datas (opcional)</Label>
                  <Input
                    value={formData.datas}
                    onChange={(e) => setFormData((p) => ({ ...p, datas: e.target.value }))}
                    placeholder="Ex.: 10-12/03"
                    className="border-gray-300 focus:border-ms-primary-blue focus:ring-ms-primary-blue w-full"
                  />
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 flex items-center gap-2 justify-center sm:justify-start">
                  <Sparkles className="w-4 h-4 text-ms-primary-blue flex-shrink-0" />
                  <span className="text-center sm:text-left">Roteiro personalizado com inteligência artificial</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => setGeneratedPlan(null)}
                    className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
                  >
                    Limpar
                  </Button>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || loadingAccess}
                    className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:from-ms-primary-blue/90 hover:to-ms-discovery-teal/90 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar Roteiro
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultado do Roteiro - Design melhorado */}
        {generatedPlan && hasIAAccess && (
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-ms-primary-blue/5 to-ms-discovery-teal/5 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-ms-primary-blue/10 to-ms-discovery-teal/10 border-b border-ms-primary-blue/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                    <div className="p-2 bg-white rounded-lg">
                      <Sparkles className="w-6 h-6 text-ms-primary-blue" />
                    </div>
                    Roteiro Gerado
                  </CardTitle>
                  <div className="px-3 py-1 bg-green-100 rounded-full">
                    <span className="text-xs font-semibold text-green-800">✓ Pronto</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Resumo do Roteiro */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-ms-primary-blue/20 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-2 bg-ms-primary-blue/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-ms-primary-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Destino</p>
                      <p className="font-semibold text-gray-900">{generatedPlan.resumo.cidade}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-ms-primary-blue/20 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-2 bg-ms-discovery-teal/10 rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-ms-discovery-teal" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Duração</p>
                      <p className="font-semibold text-gray-900">{generatedPlan.resumo.duracao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-ms-primary-blue/20 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Backpack className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Interesses</p>
                      <p className="font-semibold text-gray-900">{generatedPlan.resumo.interesses.join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-ms-primary-blue/20 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hospedagem</p>
                      <p className="font-semibold text-gray-900">{generatedPlan.resumo.hospedagem}</p>
                    </div>
                  </div>
                </div>

                {/* Dias do Roteiro */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-ms-primary-blue" />
                    Itinerário
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {generatedPlan.dias.map((dia: any, idx: number) => (
                      <Card key={idx} className="border-2 border-ms-primary-blue/20 bg-white hover:shadow-lg transition-all hover:border-ms-primary-blue/40">
                        <CardHeader className="pb-3 bg-gradient-to-r from-ms-primary-blue/10 to-ms-discovery-teal/10">
                          <CardTitle className="text-base font-bold text-ms-primary-blue">
                            {dia.titulo}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-4">
                          <ul className="space-y-2">
                            {dia.atividades.map((a: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-ms-primary-blue mt-2 flex-shrink-0"></div>
                                <span className="hover:text-ms-primary-blue transition-colors">{a}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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

                {/* Ações do Roteiro */}
                <div className="flex flex-wrap gap-3 pt-6 border-t-2 border-gray-200">
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
                    className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:from-ms-primary-blue/90 hover:to-ms-discovery-teal/90 text-white shadow-lg hover:shadow-xl transition-all px-6 py-6 text-base font-semibold"
                    disabled={!iaPaymentLink || iaPaymentLink === "#" || !iaPaymentLink.startsWith("http")}
                    size="lg"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Salvar Roteiro — R$ {iaPrice.toFixed(2)}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2 border-gray-300 hover:bg-gray-50 px-6 py-6 text-base font-semibold"
                    size="lg"
                  >
                    📄 Exportar PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setGeneratedPlan(null)}
                    className="border-2 border-gray-300 hover:bg-gray-50 px-6 py-6 text-base font-semibold"
                    size="lg"
                  >
                    ✏️ Editar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
      </div>
    </UniversalLayout>
  );
}

