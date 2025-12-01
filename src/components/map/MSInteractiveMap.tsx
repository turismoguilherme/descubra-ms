import React, { useState } from 'react';
import { touristRegions2025, TouristRegion2025 } from '@/data/touristRegions2025';

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null;
  className?: string;
}

// Mapa interativo de MS usando imagem real com áreas clicáveis
const MSInteractiveMap: React.FC<MSInteractiveMapProps> = ({
  onRegionClick,
  onRegionHover,
  selectedRegion,
  className = ""
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleMouseEnter = (region: TouristRegion2025) => {
    setHoveredRegion(region.id);
    onRegionHover?.(region);
  };

  const handleMouseLeave = () => {
    setHoveredRegion(null);
    onRegionHover?.(null);
  };

  const handleRegionClick = (regionId: string) => {
    const region = touristRegions2025.find(r => r.id === regionId);
    if (region) {
      onRegionClick(region);
    }
  };

  // Estilo para destacar região ao hover
  const getOverlayStyle = (regionId: string) => {
    const isHovered = hoveredRegion === regionId;
    const isSelected = selectedRegion === regionId;
    const isActive = isHovered || isSelected;
    
    return {
      fill: 'transparent',
      stroke: isActive ? '#fff' : 'transparent',
      strokeWidth: isActive ? 3 : 0,
      cursor: 'pointer',
      filter: isActive ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none',
      transition: 'all 0.2s ease',
    };
  };

  // URLs de fallback para a imagem do mapa
  const mapImageUrls = [
    '/images/mapa-regioes-ms.png',
    'https://www.setur.ms.gov.br/wp-content/uploads/2023/05/mapa-turistico-ms.png',
    'https://www.turismo.ms.gov.br/wp-content/uploads/2024/01/mapa-ms.png',
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Container do mapa */}
      <div 
        className="relative w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl overflow-hidden shadow-lg"
      >
        {/* Imagem do mapa */}
        <img
          src={mapImageUrls[0]}
          alt="Mapa das Regiões Turísticas de Mato Grosso do Sul"
          className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const currentIndex = mapImageUrls.indexOf(target.src);
            if (currentIndex < mapImageUrls.length - 1) {
              target.src = mapImageUrls[currentIndex + 1];
            } else {
              setImageError(true);
            }
          }}
        />

        {/* Fallback se imagem não carregar */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-8">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Para ver o mapa, salve a imagem em:
              </p>
              <code className="bg-gray-200 px-3 py-1 rounded text-sm">
                public/images/mapa-regioes-ms.png
              </code>
            </div>
          </div>
        )}

        {/* SVG overlay com áreas clicáveis - posicionadas sobre a imagem */}
        {imageLoaded && !imageError && (
          <svg
            viewBox="0 0 100 120"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: 'none' }}
          >
            {/* Áreas clicáveis para cada região - ajustadas para a imagem */}
            
            {/* PANTANAL - Amarelo - Noroeste */}
            <path
              d="M 12,22 L 18,18 L 26,16 L 32,18 L 34,26 L 32,36 L 26,44 L 18,48 L 12,46 L 8,38 L 8,28 Z"
              style={{ ...getOverlayStyle('pantanal'), pointerEvents: 'all' }}
              onClick={() => handleRegionClick('pantanal')}
              onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'pantanal')!)}
              onMouseLeave={handleMouseLeave}
            />

            {/* ROTA CERRADO PANTANAL - Verde - Norte */}
            <path
              d="M 32,18 L 45,14 L 62,14 L 78,18 L 82,28 L 78,40 L 68,48 L 54,50 L 42,48 L 34,42 L 32,32 L 34,26 L 32,18 Z"
              style={{ ...getOverlayStyle('rota-cerrado-pantanal'), pointerEvents: 'all' }}
              onClick={() => handleRegionClick('rota-cerrado-pantanal')}
              onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'rota-cerrado-pantanal')!)}
              onMouseLeave={handleMouseLeave}
            />

            {/* COSTA LESTE - Vermelho - Leste */}
            <path
              d="M 78,18 L 88,24 L 92,36 L 90,50 L 84,62 L 76,70 L 68,72 L 64,66 L 66,54 L 72,44 L 78,38 L 82,28 L 78,18 Z"
              style={{ ...getOverlayStyle('costa-leste'), pointerEvents: 'all' }}
              onClick={() => handleRegionClick('costa-leste')}
              onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'costa-leste')!)}
              onMouseLeave={handleMouseLeave}
            />

            {/* CAMPO GRANDE DOS IPÊS - Laranja - Centro */}
            <path
              d="M 32,36 L 34,42 L 42,48 L 54,50 L 68,48 L 72,44 L 66,54 L 64,66 L 58,74 L 48,78 L 38,76 L 30,70 L 26,60 L 26,50 L 28,44 L 32,36 Z"
              style={{ ...getOverlayStyle('campo-grande-ipes'), pointerEvents: 'all' }}
              onClick={() => handleRegionClick('campo-grande-ipes')}
              onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'campo-grande-ipes')!)}
              onMouseLeave={handleMouseLeave}
            />

            {/* BONITO-SERRA DA BODOQUENA - Rosa/Roxo - Sudoeste */}
            <path
              d="M 13,46 L 19,48 L 26,45 L 30,44 L 28,52 L 27,60 L 29,72 L 25,84 L 18,92 L 10,90 L 6,82 L 6,70 L 8,58 L 11,48 L 13,46 Z"
              style={{ ...getOverlayStyle('bonito-serra-bodoquena'), pointerEvents: 'all' }}
              onClick={() => handleRegionClick('bonito-serra-bodoquena')}
              onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'bonito-serra-bodoquena')!)}
              onMouseLeave={handleMouseLeave}
            />

            {/* CAMINHOS DA FRONTEIRA - Verde - Sul */}
            <path
              d="M 16,92 L 24,84 L 28,72 L 30,70 L 38,76 L 40,86 L 36,96 L 28,104 L 18,106 L 10,100 L 8,92 L 16,92 Z"
              style={{ ...getOverlayStyle('caminhos-fronteira'), pointerEvents: 'all' }}
              onClick={() => handleRegionClick('caminhos-fronteira')}
              onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'caminhos-fronteira')!)}
              onMouseLeave={handleMouseLeave}
            />

            {/* CELEIRO DO MS - Lilás - Centro-Sul */}
            <path
              d="M 48,78 L 58,74 L 64,66 L 68,72 L 68,82 L 62,92 L 52,98 L 42,98 L 38,92 L 40,86 L 38,76 L 48,78 Z"
              style={{ ...getOverlayStyle('celeiro-ms'), pointerEvents: 'all' }}
              onClick={() => handleRegionClick('celeiro-ms')}
              onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'celeiro-ms')!)}
              onMouseLeave={handleMouseLeave}
            />

            {/* VALE DAS ÁGUAS - Ciano - Sudeste */}
            <path
              d="M 68,72 L 76,70 L 84,62 L 86,72 L 82,84 L 74,92 L 64,96 L 58,94 L 62,92 L 68,82 L 68,72 Z"
              style={{ ...getOverlayStyle('vale-das-aguas'), pointerEvents: 'all' }}
              onClick={() => handleRegionClick('vale-das-aguas')}
              onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'vale-das-aguas')!)}
              onMouseLeave={handleMouseLeave}
            />

            {/* CAMINHOS DA NATUREZA-CONE SUL - Roxo - Extremo Sul */}
            <path
              d="M 36,96 L 40,86 L 38,92 L 42,98 L 52,98 L 62,92 L 58,94 L 64,96 L 74,92 L 78,100 L 72,110 L 58,116 L 42,116 L 28,110 L 22,104 L 28,104 L 36,96 Z"
              style={{ ...getOverlayStyle('caminhos-natureza-cone-sul'), pointerEvents: 'all' }}
              onClick={() => handleRegionClick('caminhos-natureza-cone-sul')}
              onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'caminhos-natureza-cone-sul')!)}
              onMouseLeave={handleMouseLeave}
            />
          </svg>
        )}

        {/* Loading state */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-ms-primary-blue border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Tooltip flutuante */}
      {hoveredRegion && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl px-4 py-3 pointer-events-none z-20 border-l-4 border-ms-primary-blue">
          <p className="font-bold text-gray-800">
            {touristRegions2025.find(r => r.id === hoveredRegion)?.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">Clique para explorar</p>
        </div>
      )}
    </div>
  );
};

export default MSInteractiveMap;
