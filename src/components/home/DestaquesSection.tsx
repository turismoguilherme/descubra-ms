import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { InteractionTracker } from "@/services/tracking/InteractionTrackerService";
import { MapPin, ArrowRight, Compass, Loader2 } from "lucide-react";
import { platformContentService } from '@/services/admin/platformContentService';
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  region?: string;
  image_url: string;
}

const destinosMock = [
  {
    id: "1",
    name: "Bonito",
    image_url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
    description: "Águas cristalinas e ecoturismo de classe mundial",
    location: "Bonito - MS",
    region: "Sudoeste"
  },
  {
    id: "2",
    name: "Pantanal",
    image_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
    description: "A maior planície alagável do mundo e sua biodiversidade única",
    location: "Pantanal - MS",
    region: "Pantanal"
  },
  {
    id: "3",
    name: "Corumbá",
    image_url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
    description: "A capital do Pantanal, com rica história e cultura",
    location: "Corumbá - MS",
    region: "Pantanal"
  },
  {
    id: "4",
    name: "Campo Grande",
    image_url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    description: "A capital do estado, com atrativos urbanos e culturais",
    location: "Campo Grande - MS",
    region: "Centro"
  }
];

const DestaquesSection = () => {
  const { language } = useLanguage();
  const { t } = useTranslation('pages');
  const [content, setContent] = useState<Record<string, string>>({});
  const [destinos, setDestinos] = useState<Destination[]>([]);
  const [translations, setTranslations] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('ms_destinations_');
        const contentMap: Record<string, string> = {};
        contents.forEach(item => {
          contentMap[item.content_key] = item.content_value || '';
        });
        setContent(contentMap);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
      }
    };
    loadContent();
  }, []);

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
          
          if (timeLeftMs < 5 * 60 * 1000 && timeLeftMs > 0) {
            await supabase.auth.refreshSession();
          } else if (timeLeftMs <= 0) {
            await supabase.auth.refreshSession();
          }
        }

        // Buscar os primeiros 4 destinos do banco de dados
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('name')
          .limit(4);

        // Se erro 401 (JWT expirado), tentar renovar e buscar novamente
        if (error && (error.message?.includes('JWT') || error.message?.includes('expired') || error.message?.includes('401'))) {
          console.log("🔄 DESTAQUES: Token expirado, tentando renovar...");
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError && refreshData.session) {
            const { data: retryData, error: retryError } = await supabase
              .from('destinations')
              .select('*')
              .order('name')
              .limit(4);
            
            if (retryError) {
              throw retryError;
            }
            
            if (!retryData || retryData.length === 0) {
              console.log("🏞️ DESTAQUES: Nenhum destino encontrado, usando dados mock");
              setDestinos(destinosMock);
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
          console.log("🏞️ DESTAQUES: Nenhum destino encontrado, usando dados mock");
          setDestinos(destinosMock);
        } else {
          console.log(`✅ DESTAQUES: ${data.length} destinos carregados do banco`);
          setDestinos(data || []);
        }
      } catch (error: any) {
        console.error('❌ Erro ao buscar destinos em destaque:', error);
        // Em caso de erro, usar dados mock
        setDestinos(destinosMock);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinos();
  }, []);

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
    if (language === 'pt-BR') return destino.description || 'Descubra este destino incrível em Mato Grosso do Sul';
    const translation = translations.get(destino.id);
    return translation?.description || destino.description || 'Descubra este destino incrível em Mato Grosso do Sul';
  };

  const getContent = (key: string, fallback: string) => content[key] || fallback;

  const handleDestinationClick = (destino: Destination) => {
    InteractionTracker.track({
      interaction_type: 'destination_click',
      target_id: destino.id,
      target_name: destino.name,
    });
  };

  // Extrair região do location (ex: "Bonito - MS" -> "Sudoeste")
  const getRegionFromLocation = (location: string): string => {
    const locationLower = location.toLowerCase();
    if (locationLower.includes('bonito') || locationLower.includes('bodoquena')) {
      return 'Sudoeste';
    }
    if (locationLower.includes('pantanal') || locationLower.includes('corumbá') || locationLower.includes('corumba')) {
      return 'Pantanal';
    }
    if (locationLower.includes('campo grande')) {
      return 'Centro';
    }
    // Tentar extrair do location ou usar padrão
    return location.split('-')[0].trim() || 'MS';
  };

  return (
    <section className="bg-gradient-to-b from-white via-blue-50/50 to-green-50/50 pt-12 pb-20">
      <div className="ms-container">
        {/* Header simples */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-3 rounded-full">
              <Compass size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-ms-primary-blue mb-4">
            {t('home.highlights.title', { defaultValue: getContent('ms_destinations_title', 'Destinos em Destaque') })}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('home.highlights.description', { defaultValue: getContent('ms_destinations_description', 'Descubra os principais destinos turísticos de Mato Grosso do Sul') })}
          </p>
        </div>

        {/* Grid de Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md h-full border border-gray-100 animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinos.map((destino) => {
              const regiao = destino.region || getRegionFromLocation(destino.location);
              return (
                <Link 
                  key={destino.id} 
                  to={`/descubramatogrossodosul/destinos?cidade=${encodeURIComponent(destino.name)}`} 
                  className="group block"
                  onClick={() => handleDestinationClick(destino)}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full border border-gray-100">
                    <div className="h-56 overflow-hidden relative">
                      <img 
                        src={destino.image_url || "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800"} 
                        alt={destino.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                        {regiao}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-ms-primary-blue mb-2 group-hover:text-ms-discovery-teal transition-colors">
                        {getTranslatedName(destino)}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {getTranslatedDescription(destino)}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin size={14} className="text-ms-pantanal-green" />
                          <span className="text-xs font-medium">{regiao}</span>
                        </div>
                        <div className="flex items-center gap-1 text-ms-primary-blue font-medium text-sm group-hover:gap-2 transition-all">
                          <span>{t('home.highlights.explore', { defaultValue: 'Explorar' })}</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Botão Ver Todos */}
        <div className="mt-12 text-center">
          <Link 
            to="/descubramatogrossodosul/destinos" 
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {t('home.highlights.viewAll', { defaultValue: getContent('ms_destinations_button', 'Ver Todos os Destinos') })}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DestaquesSection;
