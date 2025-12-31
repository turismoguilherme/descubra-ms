import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { InteractionTracker } from "@/services/tracking/InteractionTrackerService";
import { MapPin, ArrowRight, Compass } from "lucide-react";
import { platformContentService } from '@/services/admin/platformContentService';
import { useTranslation } from "react-i18next";
import { touristRegions2025 } from "@/data/touristRegions2025";

// Usar regiões turísticas em vez de destinos individuais

const DestaquesSection = () => {
  const { t } = useTranslation('pages');
  const [content, setContent] = useState<Record<string, string>>({});

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

  // Pegar as 6 principais regiões turísticas
  const regioesDestaque = touristRegions2025.slice(0, 6);

  const getContent = (key: string, fallback: string) => content[key] || fallback;

  const handleRegionClick = (regiao: typeof touristRegions2025[0]) => {
    InteractionTracker.track({
      interaction_type: 'destination_click',
      target_id: regiao.slug,
      target_name: regiao.name,
    });
  };

  return (
    <section className="bg-gradient-to-b from-white via-blue-50/30 to-green-50/30 pt-16 pb-24">
      <div className="ms-container">
        {/* Header melhorado */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Compass size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-5">
            {t('home.highlights.title', { defaultValue: getContent('ms_destinations_title', 'Regiões Turísticas') })}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('home.highlights.description', { defaultValue: getContent('ms_destinations_description', 'Descubra as principais regiões turísticas de Mato Grosso do Sul') })}
          </p>
        </div>

        {/* Grid de Cards - Regiões Turísticas com design melhorado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regioesDestaque.map((regiao, index) => (
              <Link
                key={regiao.slug}
                to={`/descubrams/regioes/${regiao.slug}`}
                className="group block animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleRegionClick(regiao)}
              >
                <div className="relative h-80 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  {/* Imagem de fundo com zoom no hover */}
                  <div 
                    className="absolute inset-0 w-full h-full"
                    style={{ backgroundColor: regiao.color }}
                  >
                    {regiao.image && (
                      <img
                        src={regiao.image}
                        alt={regiao.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800";
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Overlay gradiente sempre visível */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  {/* Badge de quantidade de cidades */}
                  <div 
                    className="absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm"
                    style={{ backgroundColor: `${regiao.color}CC` }}
                  >
                    <MapPin size={12} className="inline mr-1" />
                    {regiao.cities.length} cidades
                  </div>
                  
                  {/* Conteúdo na parte inferior */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2 drop-shadow-lg group-hover:translate-x-1 transition-transform duration-300">
                      {regiao.name}
                    </h3>
                    <p className="text-white/90 text-sm leading-relaxed line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {regiao.description}
                    </p>
                    <div className="flex items-center gap-2 text-white font-semibold text-sm opacity-80 group-hover:opacity-100 transition-all duration-300">
                      <span>{t('home.highlights.explore', { defaultValue: 'Explorar região' })}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {/* Botão Ver Mapa Turístico */}
        <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link 
            to="/descubrams/mapa-turistico" 
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            {t('home.highlights.viewAll', { defaultValue: getContent('ms_destinations_button', 'Ver Mapa Turístico Completo') })}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DestaquesSection;
