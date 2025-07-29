
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Star } from "lucide-react";
import { tourismRouteService, Route, Checkpoint } from "@/services/routes/tourismRouteService"; // Importar o serviço e interfaces
import RouteMap from "@/components/passport/RouteMap"; // Importar o novo componente de mapa
import { useToast } from "@/hooks/use-toast"; // Adicionar useToast
import { useAuth } from "@/hooks/useAuth"; // Importar useAuth
import { UserStamp } from "@/types/passport"; // Importar UserStamp
import { tourismPassportService } from "@/services/passport/tourismPassportService"; // Importar tourismPassportService
// import ShareButtons from "@/components/ShareButtons"; // Remover importação de ShareButtons

const Roteiros = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth(); // Obter usuário logado
  const [routes, setRoutes] = useState<Route[]>([]); // Mudar para routes
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]); // Novo estado para checkpoints
  const [isLoading, setIsLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string>(''); // Para o token do Mapbox
  const [completedCheckpointIds, setCompletedCheckpointIds] = useState<string[]>([]); // Novo estado para checkpoints concluídos

  // TODO: Carregar o Mapbox Token de uma configuração segura (ex: .env ou Supabase config)
  // Por enquanto, usaremos um placeholder. Em produção, ele viria de um config/environment file.
  useEffect(() => {
    console.log("🔍 Roteiros: Componente montado. Verificando Mapbox Token...");
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (token) {
      setMapboxToken(token);
      console.log("✅ Roteiros: Mapbox Token carregado.");
    } else {
      console.warn("⚠️ Roteiros: Mapbox Token NÃO configurado. O mapa pode não carregar.");
      toast({
        title: "Erro de Configuração",
        description: "Token do Mapbox não configurado. O mapa pode não carregar.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const fetchRoutesAndCheckpoints = async () => {
      setIsLoading(true);
      console.log("🔍 Roteiros: Iniciando fetchRoutesAndCheckpoints...");
      try {
        const fetchedRoutes = await tourismRouteService.getRoutes(); // Buscar rotas ativas
        setRoutes(fetchedRoutes);
        console.log("✅ Roteiros: Rotas carregadas:", fetchedRoutes);

        // Buscar todos os checkpoints (para todas as rotas)
        // Isso pode ser otimizado se a API permitir buscar checkpoints por lista de route_ids
        const allCheckpoints = await Promise.all(
          fetchedRoutes.map(route => tourismRouteService.getCheckpointsByRouteId(route.id))
        );
        setCheckpoints(allCheckpoints.flat());
        console.log("✅ Roteiros: Checkpoints carregados:", allCheckpoints.flat());

        if (user) {
          const stamps = await tourismPassportService.getUserStamps(user.id);
          const completedIds = stamps
            .filter(stamp => stamp.checkpoint_id !== null)
            .map(stamp => stamp.checkpoint_id as string);
          setCompletedCheckpointIds(completedIds);
          console.log("✅ Roteiros: IDs de checkpoints concluídos carregados:", completedIds);
        }

      } catch (error) {
        console.error("❌ Roteiros: Erro ao carregar roteiros e checkpoints:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os roteiros e pontos de interesse.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        console.log("🏁 Roteiros: Carregamento de roteiros e checkpoints finalizado. isLoading:", false);
      }
    };

    fetchRoutesAndCheckpoints();
  }, [toast, user]); // Adicionar user como dependência

  console.log("🔍 Roteiros: Renderizando com state - isLoading:", isLoading, "routes.length:", routes.length, "checkpoints.length:", checkpoints.length, "mapboxToken:", !!mapboxToken);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-ms-primary-blue text-white py-10">
          <div className="ms-container">
            <h1 className="text-3xl font-semibold mb-4">Roteiros recomendados</h1>
            <p className="text-xl max-w-2xl">
              Com base no seu perfil, selecionamos os melhores roteiros para você aproveitar sua experiência em Mato Grosso do Sul.
            </p>
          </div>
        </div>

        {/* Seção do Mapa */}
        <div className="ms-container py-10">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ms-primary-blue"></div>
            </div>
          ) : (
            <>
              {mapboxToken ? (
                <RouteMap 
                  routes={routes} 
                  checkpoints={checkpoints} 
                  mapboxToken={mapboxToken}
                  completedCheckpointIds={completedCheckpointIds} // Passar a nova prop
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-600">Configuração do mapa indisponível.</p>
                </div>
              )}

              {/* Lista de Roteiros */}
              <h2 className="text-2xl font-bold text-ms-primary-blue mt-12 mb-6">Explore nossos roteiros</h2>
              {routes.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <p className="text-gray-600 text-lg">Nenhum roteiro disponível no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {routes.map((route) => ( // Alterar de roteiro para route
                    <div
                      key={route.id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden card-hover border border-gray-200"
                    >
                      {route.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={route.image_url}
                            alt={route.name}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        {/* Removi category e rating pois não estão na nova interface Route,
                            e a definição original não tinha esses campos diretos na raiz do objeto de rota.
                            Seria necessário buscá-los de outra forma ou adicioná-los.
                            Por enquanto, vamos omitir para evitar erros de tipo. */}
                        {/* <div className="flex items-center justify-between mb-3">
                          <span className="bg-ms-secondary-yellow text-black text-sm px-3 py-1 rounded-full">
                            {route.category}
                          </span>
                          <div className="flex items-center text-ms-secondary-yellow">
                            <Star className="fill-ms-secondary-yellow text-ms-secondary-yellow" size={18} />
                            <span className="ml-1 text-gray-700">{route.rating}</span>
                          </div>
                        </div> */}

                        <h3 className="text-xl font-semibold mb-2 text-ms-primary-blue">{route.name}</h3>

                        <p className="text-gray-600 mb-4">{route.description || "Sem descrição."}</p>

                        {/* Removi location e days pois não estão na nova interface Route diretamente */}
                        {/* <div className="flex items-center text-gray-500 mb-4">
                          <MapPin size={18} className="mr-1" />
                          <span className="text-sm">{route.location}</span>
                        </div>

                        <div className="flex items-center text-gray-500 mb-6">
                          <Clock size={18} className="mr-1" />
                          <span className="text-sm">{route.days} dias</span>
                        </div> */}

                        <Button
                          className="w-full bg-ms-primary-blue hover:bg-ms-primary-blue/90"
                          onClick={() => navigate(`/ms/roteiros/${route.id}`)} // Alterado para navegar para a nova página de detalhes
                        >
                          Ver detalhes
                        </Button>

                        {/* Adicionar botões de compartilhamento social */}
                        {/* <ShareButtons 
                          title={`Explore o roteiro: ${route.name}!`}
                          text={`Confira este roteiro incrível em Mato Grosso do Sul: ${route.name}.`}
                          url={`${window.location.origin}/ms/passaporte/${route.id}`}
                        /> */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              className="border-ms-primary-blue text-ms-primary-blue hover:bg-ms-primary-blue/10"
              onClick={() => navigate("/ms/passaporte")}
            >
              <Calendar className="mr-2" size={18} />
              Acessar meu passaporte digital
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Roteiros;
