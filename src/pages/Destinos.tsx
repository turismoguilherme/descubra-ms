import React from "react";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { Compass, MapPin, Star, ArrowRight, Palmtree, Mountain, Waves, Building2, Calendar, X, Fish, TreePine, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useTouristRegions } from "@/hooks/useTouristRegions";
import { useBrand } from "@/context/BrandContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const categorias = [
  { name: "Todos", icon: Compass },
  { name: "Ecoturismo", icon: Palmtree },
  { name: "Turismo Rural", icon: Mountain },
  { name: "Pesca Esportiva", icon: Waves },
  { name: "Turismo Cultural", icon: Building2 },
  { name: "Aventura", icon: Star }
];

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  region: string;
  image_url: string;
  category?: string;
}

const Destinos = () => {
  // Componente Destinos - versão atualizada sem dependência de toast
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isMS } = useBrand();
  
  // Usar useTouristRegions - sempre chamado (regra dos hooks), mas usado apenas para MS
  const { regions: touristRegions = [], error: regionsError } = useTouristRegions();
  
  const regiaoSlug = searchParams.get('regiao');
  const cidadeParam = searchParams.get('cidade');
  
  // Buscar região filtrada pelo slug (apenas para MS e se não houver erro)
  const regiaoFiltrada = isMS && regiaoSlug && !regionsError && touristRegions.length > 0
    ? touristRegions.find(r => r.slug === regiaoSlug)
    : null;
  
  // Determinar o path base da plataforma
  const getBasePath = () => {
    if (location.pathname.startsWith('/descubramatogrossodosul')) {
      return '/descubramatogrossodosul/destinos';
    }
    // Para ViajARTur ou outras plataformas, usar path atual sem parâmetros
    return location.pathname.split('?')[0];
  };
  
  const { language } = useLanguage();
  const [destinos, setDestinos] = useState<Destination[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<Map<string, any>>(new Map());
  
  // Função para obter ícone do destaque (similar ao MapaTuristico)
  const getHighlightIcon = (highlight: string) => {
    const highlightLower = highlight.toLowerCase();
    if (highlightLower.includes('flutuação') || highlightLower.includes('água') || highlightLower.includes('rio')) {
      return <Waves className="w-3 h-3" />;
    } else if (highlightLower.includes('pesca')) {
      return <Fish className="w-3 h-3" />;
    } else if (highlightLower.includes('natureza') || highlightLower.includes('ecoturismo')) {
      return <TreePine className="w-3 h-3" />;
    } else if (highlightLower.includes('foto') || highlightLower.includes('fotografia')) {
      return <Camera className="w-3 h-3" />;
    }
    return <Star className="w-3 h-3" />;
  };
  
  // Função para remover filtro
  const handleRemoveFilter = () => {
    navigate(getBasePath());
  };

  useEffect(() => {
    const fetchDestinos = async () => {
      setLoading(true);
      try {
        // Tentar renovar a sessão se necessário (para evitar 401)
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.expires_at) {
          const expiresAtMs = session.expires_at * 1000;
          const nowMs = Date.now();
          const timeLeftMs = expiresAtMs - nowMs;
          
          // Se o token expirar em menos de 5 minutos, tentar renovar
          if (timeLeftMs < 5 * 60 * 1000 && timeLeftMs > 0) {
            await supabase.auth.refreshSession();
          } else if (timeLeftMs <= 0) {
            await supabase.auth.refreshSession();
          }
        }

        // Construir query base
        let query = supabase.from('destinations').select('*');
        
        // Aplicar filtros (apenas para MS com regiões turísticas)
        if (isMS && regiaoFiltrada && regiaoFiltrada.cities.length > 0) {
          // Filtrar por cidades da região usando ilike para matching parcial
          // Como location pode ser "Bonito - MS", precisamos fazer matching parcial
          const cityFilters = regiaoFiltrada.cities.map(city => 
            `location.ilike.%${city}%`
          ).join(',');
          query = query.or(cityFilters);
        } else if (cidadeParam) {
          // Filtrar por cidade específica
          query = query.ilike('location', `%${cidadeParam}%`);
        }
        
        const { data, error } = await query.order('name');

        // Se erro 401 (JWT expirado), tentar renovar e buscar novamente
        if (error && (error.message?.includes('JWT') || error.message?.includes('expired') || error.message?.includes('401'))) {
          console.log("🔄 DESTINOS: Token expirado, tentando renovar...");
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            // Tentar buscar novamente após renovar (aplicar mesmos filtros)
            let retryQuery = supabase.from('destinations').select('*');
            
            if (isMS && regiaoFiltrada && regiaoFiltrada.cities.length > 0) {
              const cityFilters = regiaoFiltrada.cities.map(city => 
                `location.ilike.%${city}%`
              ).join(',');
              retryQuery = retryQuery.or(cityFilters);
            } else if (cidadeParam) {
              retryQuery = retryQuery.ilike('location', `%${cidadeParam}%`);
            }
            
            const { data: retryData, error: retryError } = await retryQuery.order('name');
            
            if (retryError) {
              throw retryError;
            }
            
            if (!retryData || retryData.length === 0) {
              console.log("🏞️ DESTINOS: Nenhum destino encontrado, usando dados mock");
              setDestinos(getMockDestinations());
            } else {
              setDestinos(retryData || []);
            }
          } else {
            // Se não conseguir renovar, usar dados mock
            throw error;
          }
        } else if (error) {
          throw error;
        } else if (!data || data.length === 0) {
          console.log("🏞️ DESTINOS: Nenhum destino encontrado, usando dados mock");
          setDestinos(getMockDestinations());
        } else {
          setDestinos(data || []);
        }
      } catch (error: any) {
        console.error('❌ Erro ao buscar destinos:', error);
        // Sempre usar dados mock em caso de erro
        const mockData = getMockDestinations();
        setDestinos(mockData);
        console.log('✅ DESTINOS: Usando dados mock devido ao erro:', mockData.length, 'destinos');
        // Não mostrar toast de erro para não assustar o usuário - dados mock já são carregados
      } finally {
        setLoading(false);
      }
    };

    fetchDestinos();
  }, [regiaoFiltrada, cidadeParam, isMS]);

  // Buscar traduções quando idioma ou destinos mudarem
  useEffect(() => {
    const loadTranslations = async () => {
      if (language === 'pt-BR' || destinos.length === 0) {
        setTranslations(new Map());
        return;
      }

      try {
        const { destinationTranslationService } = await import('@/services/translation/DestinationTranslationService');
        const translationMap = new Map();

        // Buscar traduções para todos os destinos em paralelo
        const translationPromises = destinos.map(async (destino) => {
          try {
            const translation = await destinationTranslationService.getTranslation(destino.id, language);
            if (translation) {
              translationMap.set(destino.id, translation);
            }
          } catch (error) {
            console.error(`Erro ao buscar tradução para destino ${destino.id}:`, error);
          }
        });

        await Promise.all(translationPromises);
        setTranslations(translationMap);
      } catch (error) {
        console.error('Erro ao carregar traduções:', error);
      }
    };

    loadTranslations();
  }, [destinos, language]);

  // Helper para obter nome traduzido
  const getTranslatedName = (destino: Destination) => {
    if (language === 'pt-BR') return destino.name;
    const translation = translations.get(destino.id);
    return translation?.name || destino.name;
  };

  // Helper para obter descrição traduzida
  const getTranslatedDescription = (destino: Destination) => {
    if (language === 'pt-BR') return destino.description;
    const translation = translations.get(destino.id);
    return translation?.description || destino.description;
  };

  // Função auxiliar para dados mock
  const getMockDestinations = (): Destination[] => [
    {
      id: "1",
      name: "Bonito",
      description: "Águas cristalinas e ecoturismo de classe mundial. Explore grutas, rios e cachoeiras em um dos destinos mais preservados do Brasil.",
      location: "Bonito - MS",
      region: "Sudoeste",
      image_url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000",
      category: "Ecoturismo"
    },
    {
      id: "2",
      name: "Pantanal",
      description: "A maior planície alagável do mundo e sua biodiversidade única. Observe onças-pintadas, ariranhas e mais de 650 espécies de aves.",
      location: "Corumbá - MS",
      region: "Pantanal",
      image_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5",
      category: "Ecoturismo"
    },
    {
      id: "3",
      name: "Corumbá",
      description: "A capital do Pantanal, com rico histórico e cultura. Porto histórico às margens do Rio Paraguai, com forte influência cultural.",
      location: "Corumbá - MS",
      region: "Pantanal",
      image_url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
      category: "Turismo Cultural"
    },
    {
      id: "4",
      name: "Campo Grande",
      description: "A capital do estado, com atrativos urbanos e culturais. Cidade planejada com amplas avenidas e rica gastronomia regional.",
      location: "Campo Grande - MS",
      region: "Centro",
      image_url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
      category: "Turismo Cultural"
    },
    {
      id: "5",
      name: "Ponta Porã",
      description: "Fronteira com o Paraguai, ideal para compras e cultura. Cidade gêmea de Pedro Juan Caballero, com comércio intenso.",
      location: "Ponta Porã - MS",
      region: "Sul",
      image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      category: "Turismo Cultural"
    },
    {
      id: "6",
      name: "Três Lagoas",
      description: "Praia de água doce e desenvolvimento econômico. Lagoas naturais e artificiais ideais para esportes náuticos.",
      location: "Três Lagoas - MS",
      region: "Leste",
      image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      category: "Aventura"
    }
  ];

  // Aplicar filtros: primeiro por categoria, depois por região/cidade se necessário
  let destinosFiltrados = categoriaAtiva === "Todos" 
    ? destinos 
    : destinos.filter(d => d.category === categoriaAtiva);
  
  // Se houver região filtrada, aplicar filtro adicional por cidades da região (apenas para MS)
  // (Isso é necessário para dados mock, pois a query do Supabase já filtra os dados do banco)
  if (isMS && regiaoFiltrada && regiaoFiltrada.cities.length > 0) {
    destinosFiltrados = destinosFiltrados.filter(destino => {
      // Verificar se a location do destino contém alguma das cidades da região
      return regiaoFiltrada.cities.some(city => 
        destino.location.toLowerCase().includes(city.toLowerCase())
      );
    });
  } else if (cidadeParam) {
    // Filtrar por cidade específica (para dados mock)
    destinosFiltrados = destinosFiltrados.filter(destino =>
      destino.location.toLowerCase().includes(cidadeParam.toLowerCase())
    );
  }


  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-b from-blue-50 via-white to-green-50">
        {/* Hero Section - Adaptado para região filtrada (apenas MS) */}
        {isMS && regiaoFiltrada ? (
          <div 
            className="relative py-20"
            style={{ backgroundColor: regiaoFiltrada.color }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative ms-container text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                  <MapPin size={56} className="text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {regiaoFiltrada.name}
              </h1>
              <p className="text-white/95 text-xl max-w-3xl mx-auto leading-relaxed">
                {regiaoFiltrada.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-20">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative ms-container text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                  <Compass size={56} className="text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Destinos em Destaque
              </h1>
              <p className="text-white/95 text-xl max-w-3xl mx-auto leading-relaxed">
                Explore os mais belos e diversos destinos de Mato Grosso do Sul. 
                Da exuberância do Pantanal às águas cristalinas de Bonito.
              </p>
            </div>
          </div>
        )}

        {/* Seção de Informações da Região (quando filtrado - apenas MS) */}
        {isMS && regiaoFiltrada && (
          <div className="ms-container py-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in slide-in-from-top duration-300">
              {/* Destaques */}
              {regiaoFiltrada.highlights && regiaoFiltrada.highlights.length > 0 && (
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-ms-secondary-yellow" />
                    Destaques
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {regiaoFiltrada.highlights.map((highlight, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {getHighlightIcon(highlight)}
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Cidades */}
              {regiaoFiltrada.cities && regiaoFiltrada.cities.length > 0 && (
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-ms-primary-blue" />
                    Cidades da Região
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {regiaoFiltrada.cities.map((city, index) => (
                      <Badge 
                        key={index}
                        variant="outline"
                        className="text-sm"
                      >
                        {city}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão para remover filtro */}
              <div className="p-6">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={handleRemoveFilter}
                >
                  <X className="w-4 h-4 mr-2" />
                  Ver todos os destinos
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Principais Interesses Turísticos */}
        <div className="ms-container py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-ms-primary-blue mb-6">
              Principais Interesses Turísticos
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {categorias.map((cat) => {
                const Icon = cat.icon;
                return (
              <button
                    key={cat.name}
                    onClick={() => setCategoriaAtiva(cat.name)}
                    className={`group flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                      categoriaAtiva === cat.name 
                        ? "bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white shadow-lg" 
                        : "bg-blue-50 text-ms-primary-blue hover:bg-blue-100 hover:shadow-md"
                    }`}
                  >
                    <Icon size={20} className={`transition-transform group-hover:rotate-12 ${
                      categoriaAtiva === cat.name ? "text-white" : "text-ms-discovery-teal"
                    }`} />
                    <span>{cat.name}</span>
              </button>
                );
              })}
            </div>
          </div>
          
          {/* Grid de Destinos */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-ms-primary-blue/20"></div>
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-ms-primary-blue absolute top-0"></div>
              </div>
              <p className="text-gray-600 mt-4 text-lg">Carregando destinos incríveis...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {destinosFiltrados.map((destino) => (
                <Link 
                  key={destino.id} 
                    to={`${getBasePath()}/${destino.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                    <div className="relative h-64 overflow-hidden">
                    <img 
                      src={destino.image_url ? `${destino.image_url}?t=${destino.updated_at ? new Date(destino.updated_at).getTime() : Date.now()}` : ''} 
                      alt={destino.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        console.warn('Erro ao carregar imagem do destino:', destino.image_url);
                        const placeholderSvg = `data:image/svg+xml,${encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                          <rect width="400" height="300" fill="#e5e7eb"/>
                          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
                            Imagem não disponível
                          </text>
                        </svg>`)}`;
                        (e.target as HTMLImageElement).src = placeholderSvg;
                      }}
                    />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {destino.region}
                      </div>
                      {destino.category && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-ms-primary-blue px-3 py-1 rounded-full text-xs font-medium shadow-md">
                          {destino.category}
                  </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-ms-primary-blue mb-3 group-hover:text-ms-discovery-teal transition-colors">
                        {getTranslatedName(destino)}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {getTranslatedDescription(destino)}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin size={16} className="text-ms-pantanal-green" />
                          <span className="text-sm font-medium">{destino.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-ms-primary-blue font-semibold group-hover:gap-2 transition-all">
                          <span className="text-sm">Explorar</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                  </div>
                </Link>
              ))}
              </div>
              
              {destinosFiltrados.length === 0 && !loading && (
                <div className="text-center py-20">
                  <div className="bg-blue-50 rounded-2xl p-12 max-w-md mx-auto">
                    <Compass size={64} className="text-ms-primary-blue mx-auto mb-4 opacity-50" />
                    <p className="text-gray-600 text-lg mb-2">
                      {regiaoFiltrada 
                        ? `Nenhum destino encontrado em ${regiaoFiltrada.name}`
                        : cidadeParam
                        ? `Nenhum destino encontrado em ${cidadeParam}`
                        : "Nenhum destino encontrado"}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      {regiaoFiltrada || cidadeParam
                        ? "Tente selecionar outra categoria ou remover o filtro"
                        : "Tente selecionar outra categoria"}
                    </p>
                    {(regiaoFiltrada || cidadeParam) && (
                      <Button 
                        variant="outline"
                        onClick={handleRemoveFilter}
                        className="mt-2"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Ver todos os destinos
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </main>
    </UniversalLayout>
  );
};

export default Destinos;
