import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Trophy, Star, Camera, Gift } from "lucide-react"; // Adicionado Gift icon
import { useToast } from "@/hooks/use-toast";
import { tourismPassportService } from "@/services/passport/tourismPassportService"; // Importar o serviço de passaporte
import rewardService, { UserReward } from '@/services/rewardService'; // Importar rewardService e UserReward
import { UserStamp, UserPassportStats, PassportChallenge } from "@/types/passport"; // Importar o tipo UserStamp e UserPassportStats, PassportChallenge
import ShareButtons from "@/components/common/ShareButtons"; // Importar o componente ShareButtons

interface EnhancedTouristRoute {
  id: string;
  name: string;
  description: string;
  difficulty_level: "facil" | "medio" | "dificil";
  estimated_duration: number;
  points: number;
  is_active: boolean;
  checkpoints: any[];
}

const EnhancedDigitalPassport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [routes, setRoutes] = useState<EnhancedTouristRoute[]>([]);
  const [completedRoutes, setCompletedRoutes] = useState<string[]>([]);
  const [userStamps, setUserStamps] = useState<UserStamp[]>([]); 
  const [passportStats, setPassportStats] = useState<UserPassportStats | null>(null); // Novo estado para estatísticas do passaporte
  const [availableChallenges, setAvailableChallenges] = useState<PassportChallenge[]>([]); // Novo estado para desafios
  const [userRewards, setUserRewards] = useState<UserReward[]>([]); // Novo estado para recompensas do usuário
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false); // Estado para o loading do relatório de IA

  useEffect(() => {
    if (user) {
      fetchRoutes();
      fetchCompletedRoutes();
      fetchUserStamps(); 
      fetchPassportStats(); // Chamar a nova função para buscar estatísticas
      fetchAvailableChallenges(); // Chamar a nova função para buscar desafios
      fetchUserRewards(); // Chamar a nova função para buscar recompensas
    }
  }, [user]);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          checkpoints:route_checkpoints(*)
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Converter para o formato esperado e garantir que difficulty_level seja válido
      const convertedRoutes: EnhancedTouristRoute[] = (data || []).map(route => ({
        ...route,
        difficulty_level: ['facil', 'medio', 'dificil'].includes(route.difficulty) 
          ? route.difficulty as "facil" | "medio" | "dificil"
          : "facil",
        estimated_duration: route.estimated_duration ? 
          (typeof route.estimated_duration === 'string' ? 60 : 60) : 60, // Convert interval to minutes
        points: 10, // Default points
        checkpoints: route.checkpoints || []
      }));

      setRoutes(convertedRoutes);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as rotas",
        variant: "destructive",
      });
    }
  };

  const fetchCompletedRoutes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('passport_stamps')
        .select('route_id')
        .eq('user_id', user.id)
        .not('route_id', 'is', null);

      if (error) throw error;

      setCompletedRoutes((data || []).map(item => item.route_id).filter(Boolean));
    } catch (error) {
      console.error('Error fetching completed routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStamps = async () => {
    if (!user) return;
    try {
      const stamps = await tourismPassportService.getUserStamps(user.id);
      setUserStamps(stamps);
    } catch (error) {
      console.error("Error fetching user stamps:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus selos digitais.",
        variant: "destructive",
      });
    }
  };

  const completeRoute = async (routeId: string, points: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('passport_stamps')
        .insert({
          user_id: user.id,
          route_id: routeId,
          stamp_type: 'route_completion',
          stamped_at: new Date().toISOString()
        });

      if (error) throw error;

      setCompletedRoutes(prev => [...prev, routeId]);

      toast({
        title: "Parabéns!",
        description: `Você completou a rota e ganhou ${points} pontos!`,
      });

      fetchCompletedRoutes();
    } catch (error) {
      console.error('Error completing route:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a rota",
        variant: "destructive",
      });
    }
  };

  const fetchPassportStats = async () => {
    if (!user) return;
    try {
      const stats = await tourismPassportService.getPassportStats(user.id);
      setPassportStats(stats);
    } catch (error) {
      console.error("Error fetching passport stats:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do passaporte.",
        variant: "destructive",
      });
    }
  };

  const fetchAvailableChallenges = async () => {
    if (!user) return;
    try {
      const challenges = await tourismPassportService.getAvailableChallenges(user.id);
      setAvailableChallenges(challenges);
    } catch (error) {
      console.error("Error fetching available challenges:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os desafios.",
        variant: "destructive",
      });
    }
  };

  const fetchUserRewards = async () => {
    if (!user) return;
    try {
      const rewards = await rewardService.listUserRewards(user.id);
      setUserRewards(rewards);
    } catch (error) {
      console.error("Error fetching user rewards:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas recompensas.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!user) return;
    setReportLoading(true);
    try {
      const report = await tourismPassportService.generatePassportReport(user.id);
      toast({
        title: "Relatório Gerado!",
        description: "Seu relatório personalizado de passaporte foi criado com sucesso.",
      });
      console.log("Relatório de IA:", report);
      // Exibir o relatório de alguma forma (modal, nova página, download)
      alert("Relatório de IA gerado! Verifique o console para os detalhes. (Implementação de exibição completa pendente)");
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório de IA.",
        variant: "destructive",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'facil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      default: return 'N/A';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Faça login para acessar seu passaporte digital</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ms-primary-blue mb-4">
          Passaporte Digital de Turismo
        </h1>
        <p className="text-gray-600">
          Complete rotas turísticas e ganhe selos digitais. Explore Mato Grosso do Sul de forma interativa!
        </p>

        {/* Seção de Estatísticas do Passaporte */}
        {passportStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nível</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{passportStats.level}</div>
                <p className="text-xs text-muted-foreground">
                  Próximo nível: <span className="font-semibold capitalize">{passportStats.progress_to_next_level.next_level}</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{passportStats.total_points} pts</div>
                <p className="text-xs text-muted-foreground">
                  Faltam {passportStats.progress_to_next_level.points_needed} pts para o próximo nível
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Checkpoints Concluídos</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{passportStats.checkpoints_completed}</div>
                <p className="text-xs text-muted-foreground">
                  Você visitou {passportStats.cities_visited} cidades
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Benefícios Desbloqueados</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{passportStats.benefits_unlocked}</div>
                <p className="text-xs text-muted-foreground">
                  {passportStats.challenges_completed} desafios completados
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Botão para Gerar Relatório com IA */}
        <div className="mb-8 text-center">
          <Button onClick={handleGenerateReport} disabled={reportLoading}>
            {reportLoading ? "Gerando Relatório..." : "Gerar Relatório de Progresso (IA)"}
          </Button>
        </div>

        {/* Botão de Compartilhamento Geral do Passaporte */}
        {passportStats && (
          <div className="mb-8 text-center">
            <ShareButtons
              title={`Meu Passaporte Digital: Nível ${passportStats.level} em Mato Grosso do Sul!`}
              text={`Acabei de atingir o nível ${passportStats.level} no Passaporte Digital de Turismo, com ${passportStats.total_points} pontos e ${passportStats.checkpoints_completed} checkpoints concluídos! Venha explorar MS comigo!`}
              url={`${window.location.origin}/ms/passaporte`}
            />
          </div>
        )}

        {/* Seção de Recompensas do Usuário */}
        <h2 className="text-2xl font-bold text-ms-primary-blue mb-6">Minhas Recompensas</h2>
        {userRewards.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg shadow-sm mb-8">
            <p className="text-gray-600">Você ainda não ganhou nenhuma recompensa. Continue explorando e completando desafios!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {userRewards.map((reward) => (
              <Card key={reward.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    {reward.name}
                    <Badge variant="secondary">{reward.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-2">{reward.description}</p>
                  <p className="text-xs text-gray-500">
                    Recebido em: {new Date(reward.received_at).toLocaleDateString()}
                  </p>
                  {reward.reason && (
                    <p className="text-xs text-gray-500 mt-1">Motivo: {reward.reason}</p>
                  )}
                  {/* Novos campos de resgate */}
                  {reward.local_resgate && (
                    <p className="text-xs text-gray-600 mt-1 flex items-center">
                      <MapPin size={12} className="mr-1 text-ms-primary-blue" />
                      Local de Resgate: {reward.local_resgate}
                    </p>
                  )}
                  {reward.instrucoes_resgate && (
                    <p className="text-xs text-gray-600 mt-1 flex items-center">
                      <Gift size={12} className="mr-1 text-ms-primary-blue" />
                      Instruções: {reward.instrucoes_resgate}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Seção de Desafios */}
        <h2 className="text-2xl font-bold text-ms-primary-blue mb-6">Desafios</h2>
        {availableChallenges.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg shadow-sm mb-8">
            <p className="text-gray-600">Nenhum desafio disponível no momento. Continue explorando!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {availableChallenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    {challenge.name}
                    {challenge.active ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-2">{challenge.description}</p>
                  <p className="text-sm font-semibold text-ms-primary-blue">Recompensa: {challenge.points_reward} pontos</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Requisitos:</p>
                    <ul>
                      <li>{challenge.requirements.checkpoints_required} checkpoints</li>
                      <li>{challenge.requirements.cities_required} cidades</li>
                      {challenge.requirements.categories_required.length > 0 && (
                        <li>Categorias: {challenge.requirements.categories_required.join(', ')}</li>
                      )}
                      {challenge.requirements.time_limit_days && (
                        <li>Limite de tempo: {challenge.requirements.time_limit_days} dias</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Seção de Carimbos do Usuário */}
        <h2 className="text-2xl font-bold text-ms-primary-blue mb-6">Meus Selos Digitais</h2>
        {userStamps.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg shadow-sm mb-8">
            <p className="text-gray-600">Você ainda não ganhou nenhum selo. Comece a explorar as rotas!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {userStamps.map((stamp) => (
              <Card key={stamp.id} className="text-center">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  {stamp.stamp_icon_url ? (
                    <img src={stamp.stamp_icon_url} alt={stamp.stamp_name} className="w-16 h-16 object-contain mb-2" />
                  ) : (
                    <Trophy className="w-16 h-16 text-ms-primary-blue mb-2" />
                  )}
                  <h4 className="font-semibold text-sm">{stamp.stamp_name}</h4>
                  <p className="text-xs text-gray-500">{new Date(stamp.earned_at).toLocaleDateString()}</p>
                  {stamp.cultural_phrase && (
                    <p className="text-xs text-blue-600 italic mt-1">"{stamp.cultural_phrase}"</p>
                  )}
                  {/* Botões de Compartilhamento para Selo Individual */}
                  <ShareButtons
                    title={`Conquistei um selo em MS: ${stamp.stamp_name}!`}
                    text={`Olha o selo que acabei de ganhar no Passaporte Digital de Turismo em Mato Grosso do Sul: ${stamp.stamp_name}! #DescubraMS #Flowtrip`}
                    url={`${window.location.origin}/ms/passaporte`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-bold text-ms-primary-blue mb-6">Explore Nossas Rotas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => {
            const isCompleted = completedRoutes.includes(route.id);
            
            return (
              <Card key={route.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{route.name}</CardTitle>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-800">
                        <Trophy className="w-3 h-3 mr-1" />
                        Completo
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className={getDifficultyColor(route.difficulty_level)}>
                      {getDifficultyLabel(route.difficulty_level)}
                    </Badge>
                    <Badge variant="outline">
                      <Star className="w-3 h-3 mr-1" />
                      {route.points} pts
                    </Badge>
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {route.checkpoints?.length || 0} pontos
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">
                    {route.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>Duração: ~{route.estimated_duration} min</span>
                  </div>
                  {!isCompleted ? (
                    <Button
                      onClick={() => completeRoute(route.id, route.points)}
                      className="w-full"
                      size="sm"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Completar Rota
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" size="sm" disabled>
                      Rota Completada
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {routes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhuma rota disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDigitalPassport;