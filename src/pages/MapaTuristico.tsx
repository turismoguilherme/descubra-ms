import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UniversalLayout from '@/components/layout/UniversalLayout';
import MSInteractiveMap from '@/components/map/MSInteractiveMap';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { useTouristRegions } from '@/hooks/useTouristRegions';
import { MapPin, ArrowRight, ArrowLeft, X, Star, Camera, Fish, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MapaTuristico: React.FC = () => {
  const navigate = useNavigate();
  const { regions: touristRegions, loading: regionsLoading } = useTouristRegions();
  const [selectedRegion, setSelectedRegion] = useState<TouristRegion2025 | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<TouristRegion2025 | null>(null);

  // Scroll para o topo quando a página carregar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  console.log(`🔄 [MapaTuristico] Render - selectedRegion: ${selectedRegion?.slug || 'null'}`);

  const handleRegionClick = (region: TouristRegion2025) => {
    console.log(`🗺️ [Mapa] Clique em: ${region.name} (${region.slug})`);

    // Verificar se já está selecionada
    if (selectedRegion?.slug === region.slug) {
      console.log(`🗺️ [Mapa] Deselecionando: ${region.name}`);
      setSelectedRegion(null);
    } else {
      console.log(`🗺️ [Mapa] Selecionando: ${region.name}`);
      setSelectedRegion(region);
    }
  };

  const handleRegionHover = (region: TouristRegion2025 | null) => {
    setHoveredRegion(region);
  };

  const handleCityClick = (cityName: string) => {
    // Navegar para a página de regiões turísticas (destinos agora mostra apenas regiões)
    navigate(`/descubrams/destinos`);
  };

  const handleCloseRegion = () => {
    setSelectedRegion(null);
  };

  const getHighlightIcon = (highlight: string) => {
    const lower = highlight.toLowerCase();
    if (lower.includes('pesca')) return <Fish className="w-4 h-4" />;
    if (lower.includes('foto') || lower.includes('observa')) return <Camera className="w-4 h-4" />;
    if (lower.includes('eco') || lower.includes('natureza')) return <TreePine className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  return (
    <UniversalLayout>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header da página */}
        <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white py-8">
          <div className="ms-container">
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <Link to="/descubrams" className="hover:text-white transition-colors">
                Início
              </Link>
              <span>/</span>
              <span className="text-white">Mapa Turístico</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mapa Turístico
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Explore as 9 regiões turísticas de Mato Grosso do Sul de forma interativa
            </p>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="ms-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Coluna esquerda - Informações */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="sticky top-24">
                {/* Título e descrição */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-ms-primary-blue font-script text-2xl">Descubra</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Mato Grosso do Sul
                  </h2>
                  <p className="text-lg font-semibold text-ms-primary-blue mb-4">
                    Polo Turístico
                  </p>
                  <p className="text-gray-600">
                    Selecione no mapa a região turística que deseja conhecer e mergulhe em suas paisagens, tradições e experiências.
                  </p>
                </div>

                {/* Lista de regiões ou detalhes da região selecionada */}
                {selectedRegion ? (
                  // Detalhes da região selecionada
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in slide-in-from-left duration-300">
                    {/* Header da região */}
                    <div 
                      className="p-6 text-white relative"
                      style={{ backgroundColor: selectedRegion.color }}
                    >
                      <button
                        onClick={handleCloseRegion}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <h3 className="text-2xl font-bold mb-2">{selectedRegion.name}</h3>
                      <p className="text-white/90 text-sm">{selectedRegion.description}</p>
                    </div>

                    {/* Destaques */}
                    <div className="p-6 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-ms-secondary-yellow" />
                        Destaques
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRegion.highlights.map((highlight, index) => (
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

                    {/* Cidades */}
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-ms-primary-blue" />
                        Cidades para explorar
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedRegion.cities.map((city, index) => (
                          <button
                            key={index}
                            onClick={() => handleCityClick(city)}
                            className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-ms-primary-blue hover:text-white rounded-xl transition-all duration-300"
                          >
                            <span className="font-medium text-sm">{city}</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Botão explorar */}
                    <div className="p-6 pt-0">
                      <Button 
                        className="w-full bg-ms-primary-blue hover:bg-ms-primary-blue/90"
                        onClick={() => navigate(`/descubrams/regioes/${selectedRegion.slug}`)}
                      >
                        Explorar {selectedRegion.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Lista de todas as regiões
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">
                        9 Regiões Turísticas
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {touristRegions.map((region) => (
                        <button
                          key={region.id}
                          onClick={() => handleRegionClick(region)}
                          onMouseEnter={() => setHoveredRegion(region)}
                          onMouseLeave={() => setHoveredRegion(null)}
                          className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-all duration-200 ${
                            hoveredRegion?.slug === region.slug ? 'bg-gray-50' : ''
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: region.color }}
                          />
                          <span className="font-medium text-gray-800 text-left flex-1">
                            {region.name}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legenda */}
                <div className="mt-6 p-4 bg-white/80 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-gray-500 text-center">
                    💡 Clique em uma região no mapa ou na lista para ver os destinos
                  </p>
                </div>
              </div>
            </div>

            {/* Coluna direita - Mapa */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <div className="aspect-square lg:aspect-auto lg:h-[850px]">
                  {regionsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-ms-primary-blue border-t-transparent"></div>
                    </div>
                  ) : (
                    <MSInteractiveMap
                      onRegionClick={handleRegionClick}
                      onRegionHover={handleRegionHover}
                      selectedRegion={selectedRegion?.slug || null}
                      className="w-full h-full"
                    />
                  )}
                </div>

                {/* Legenda de cores */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Legenda</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {touristRegions.slice(0, 9).map((region) => (
                      <div 
                        key={region.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: region.color }}
                        />
                        <span className="text-gray-600 truncate">
                          {region.name.split('-')[0].split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de CTAs */}
        <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal py-16">
          <div className="ms-container text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Não sabe por onde começar?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Converse com o Guatá, Chatbot Guia Inteligente de Turismo do MS, e receba recomendações personalizadas!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/descubrams/guata">
                <Button size="lg" className="bg-ms-secondary-yellow text-gray-900 hover:bg-ms-secondary-yellow/90 font-semibold">
                  🦜 Falar com o Guatá
                </Button>
              </Link>
              <Link to="/descubrams/destinos">
                <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  Ver Todos os Destinos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default MapaTuristico;

