import React from "react";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { Compass, MapPin, ArrowRight, Globe } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTouristRegions } from "@/hooks/useTouristRegions";
import { useBrand } from "@/context/BrandContext";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

const Destinos = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isMS } = useBrand();
  const { t } = useTranslation('pages');
  const { language } = useLanguage();
  // useTouristRegions já busca traduções automaticamente baseado no idioma atual
  const { regions: touristRegions = [], error: regionsError, loading: regionsLoading } = useTouristRegions(language);
  
  const regiaoSlug = searchParams.get('regiao');

  // Se houver filtro de região, redirecionar para a página de detalhes da região
  React.useEffect(() => {
    if (isMS && regiaoSlug && !regionsLoading && !regionsError && touristRegions.length > 0) {
      const regiao = touristRegions.find(r => r.slug === regiaoSlug);
      if (regiao) {
        navigate(`/descubrams/regioes/${regiaoSlug}`, { replace: true });
      }
    }
  }, [regiaoSlug, isMS, regionsLoading, regionsError, touristRegions, navigate]);

  if (regionsLoading) {
    return (
      <UniversalLayout>
        <main className="flex-grow bg-gradient-to-b from-blue-50 via-white to-green-50">
          <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-ms-primary-blue/20"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-ms-primary-blue absolute top-0"></div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">Carregando regiões turísticas...</p>
          </div>
        </main>
      </UniversalLayout>
    );
  }

  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-b from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative ms-container text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Globe size={56} className="text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {t('home.regions.title', { defaultValue: 'Regiões Turísticas' })}
            </h1>
            <p className="text-white/95 text-xl max-w-3xl mx-auto leading-relaxed">
              {t('home.regions.description', { defaultValue: 'Descubra a diversidade de Mato Grosso do Sul através de suas regiões turísticas únicas' })}
            </p>
          </div>
        </div>

        {/* Grid de Regiões Turísticas */}
        <div className="ms-container py-16">
          {touristRegions.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-blue-50 rounded-2xl p-12 max-w-md mx-auto">
                <Compass size={64} className="text-ms-primary-blue mx-auto mb-4 opacity-50" />
                <p className="text-gray-600 text-lg mb-2">
                  Nenhuma região turística encontrada
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {touristRegions.map((regiao, index) => (
                <Link
                  key={regiao.slug}
                  to={`/descubrams/regioes/${regiao.slug}`}
                  className="group block animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 h-full border border-gray-100 hover:border-ms-primary-blue/30">
                    {/* Imagem com cor da região */}
                    <div 
                      className="h-64 relative overflow-hidden"
                      style={{ backgroundColor: regiao.color }}
                    >
                      {regiao.image && (
                        <img
                          src={regiao.image}
                          alt={regiao.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800";
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-xs font-bold shadow-xl">
                        {regiao.cities.length} {regiao.cities.length === 1 ? 'cidade' : 'cidades'}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-ms-primary-blue mb-3 group-hover:text-ms-discovery-teal transition-colors duration-300">
                        {regiao.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {regiao.description}
                      </p>
                      
                      {/* Destaques */}
                      {regiao.highlights && regiao.highlights.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {regiao.highlights.slice(0, 3).map((highlight, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-ms-secondary-yellow/20 text-ms-primary-blue border border-ms-secondary-yellow/30"
                              >
                                {highlight}
                              </span>
                            ))}
                            {regiao.highlights.length > 3 && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{regiao.highlights.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin size={16} className="text-ms-pantanal-green" />
                          <span className="text-xs font-semibold">{regiao.cities[0]}</span>
                          {regiao.cities.length > 1 && (
                            <span className="text-xs text-gray-400">+{regiao.cities.length - 1}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-ms-primary-blue font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                          <span>{t('home.highlights.explore', { defaultValue: 'Explorar' })}</span>
                          <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Botão Ver Mapa Turístico */}
          <div className="mt-16 text-center">
            <Link 
              to="/descubrams/mapa-turistico" 
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
            >
              {t('home.highlights.viewAll', { defaultValue: 'Ver Mapa Turístico Completo' })}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default Destinos;
