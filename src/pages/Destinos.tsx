import React from "react";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { Compass, MapPin, Star, ArrowRight, Palmtree, Mountain, Waves, Building2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const [destinos, setDestinos] = useState<Destination[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [loading, setLoading] = useState(true);

  try {
  

  useEffect(() => {
    const fetchDestinos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('name');

        if (error) throw error;

        // Se não houver destinos no Supabase, usar dados mock
        if (!data || data.length === 0) {
          console.log("🏞️ DESTINOS: Usando dados mock");
          setDestinos([
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
          ]);
        } else {
        setDestinos(data || []);
        }
      } catch (error) {
        console.error('Erro ao buscar destinos:', error);
        if (toast) {
          toast({
            title: "Aviso",
            description: "Carregando destinos de exemplo.",
          });
        } else {
          console.log("🏞️ DESTINOS: Hook toast não disponível, usando dados mock");
        }
        // Definir dados mock em caso de erro também
        setDestinos([
          {
            id: "1",
            name: "Bonito",
            description: "Águas cristalinas e ecoturismo de classe mundial",
            location: "Bonito - MS",
            region: "Sudoeste",
            image_url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000",
            category: "Ecoturismo"
          },
          {
            id: "2",
            name: "Pantanal",
            description: "A maior planície alagável do mundo",
            location: "Corumbá - MS",
            region: "Pantanal",
            image_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5",
            category: "Ecoturismo"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinos();
  }, [toast]);

  const destinosFiltrados = categoriaAtiva === "Todos" 
    ? destinos 
    : destinos.filter(d => d.category === categoriaAtiva);


  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-b from-blue-50 via-white to-green-50">
        {/* Hero Section */}
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
                    to={`/descubramatogrossodosul/destinos/${destino.id}`}
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
                        {destino.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {destino.description}
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
                    <p className="text-gray-600 text-lg mb-2">Nenhum destino encontrado</p>
                    <p className="text-gray-500 text-sm">Tente selecionar outra categoria</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </main>
    </UniversalLayout>
  );
  } catch (error) {
    console.error("🏞️ DESTINOS: Erro no componente Destinos:", error);
    return (
      <UniversalLayout>
        <main className="flex-grow">
          <div className="bg-gradient-to-r from-ms-cerrado-orange to-ms-guavira-purple py-16">
            <div className="ms-container text-center">
              <Compass size={48} className="text-white mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-6">Destinos</h1>
              <p className="text-white/90 text-xl max-w-2xl mx-auto">
                Explore os melhores destinos turísticos de Mato Grosso do Sul
              </p>
            </div>
          </div>

          <div className="ms-container py-12">
            <div className="text-center py-20">
              <div className="bg-red-50 rounded-2xl p-12 max-w-md mx-auto">
                <Compass size={64} className="text-red-500 mx-auto mb-4 opacity-50" />
                <p className="text-red-600 text-lg mb-2">Erro ao carregar destinos</p>
                <p className="text-gray-500 text-sm">Por favor, recarregue a página ou tente novamente mais tarde.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-ms-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Recarregar Página
                </button>
              </div>
            </div>
          </div>
        </main>
      </UniversalLayout>
    );
  }
};

export default Destinos;
