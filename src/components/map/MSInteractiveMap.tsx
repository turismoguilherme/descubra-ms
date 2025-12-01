import React, { useState } from 'react';
import { touristRegions2025, TouristRegion2025 } from '@/data/touristRegions2025';

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null;
  className?: string;
}

// Mapa usando imagem real de fundo com áreas clicáveis
const MSInteractiveMap: React.FC<MSInteractiveMapProps> = ({
  onRegionClick,
  onRegionHover,
  selectedRegion,
  className = ""
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

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

  const getOverlayStyle = (regionId: string) => {
    const region = touristRegions2025.find(r => r.id === regionId);
    if (!region) return {};
    
    const isHovered = hoveredRegion === regionId;
    const isSelected = selectedRegion === regionId;
    const isActive = isHovered || isSelected;
    
    return {
      fill: isActive ? region.color : 'transparent',
      opacity: isActive ? 0.4 : 0,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    };
  };

  return (
    <div className={`relative ${className}`}>
      {/* Container do mapa com imagem de fundo */}
      <div className="relative w-full" style={{ aspectRatio: '1/1.15' }}>
        {/* Imagem do mapa real de MS como fundo */}
        <img
          src="https://www.turismo.ms.gov.br/wp-content/uploads/2022/03/MAPA-DE-REGIONALIZACAO-DO-TURISMO-2022.png"
          alt="Mapa Turístico de Mato Grosso do Sul"
          className="w-full h-full object-contain rounded-lg shadow-lg"
          onError={(e) => {
            // Fallback para imagem local se a externa falhar
            const target = e.target as HTMLImageElement;
            target.src = '/images/mapa-ms-turistico.png';
          }}
        />
        
        {/* SVG overlay com áreas clicáveis transparentes */}
        <svg
          viewBox="0 0 100 115"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Áreas clicáveis mapeadas sobre a imagem */}
          
          {/* PANTANAL - Noroeste */}
          <polygon
            points="8,18 12,12 18,8 25,7 30,10 32,18 30,28 26,36 20,42 14,44 10,40 8,32 7,25"
            style={getOverlayStyle('pantanal')}
            stroke={hoveredRegion === 'pantanal' || selectedRegion === 'pantanal' ? '#FFD700' : 'transparent'}
            strokeWidth="0.5"
            onClick={() => handleRegionClick('pantanal')}
            onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'pantanal')!)}
            onMouseLeave={handleMouseLeave}
          />

          {/* ROTA CERRADO PANTANAL - Norte */}
          <polygon
            points="30,10 40,7 55,6 70,7 82,12 85,22 82,32 75,40 65,45 52,46 40,44 32,40 28,32 30,22 32,18 30,10"
            style={getOverlayStyle('rota-cerrado-pantanal')}
            stroke={hoveredRegion === 'rota-cerrado-pantanal' || selectedRegion === 'rota-cerrado-pantanal' ? '#8BC34A' : 'transparent'}
            strokeWidth="0.5"
            onClick={() => handleRegionClick('rota-cerrado-pantanal')}
            onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'rota-cerrado-pantanal')!)}
            onMouseLeave={handleMouseLeave}
          />

          {/* COSTA LESTE - Leste */}
          <polygon
            points="82,12 90,18 95,28 95,42 92,55 86,65 78,72 70,75 65,70 64,60 68,50 75,42 80,35 82,28 85,22 82,12"
            style={getOverlayStyle('costa-leste')}
            stroke={hoveredRegion === 'costa-leste' || selectedRegion === 'costa-leste' ? '#F44336' : 'transparent'}
            strokeWidth="0.5"
            onClick={() => handleRegionClick('costa-leste')}
            onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'costa-leste')!)}
            onMouseLeave={handleMouseLeave}
          />

          {/* CAMPO GRANDE DOS IPÊS - Centro */}
          <polygon
            points="28,32 32,40 40,44 52,46 65,45 75,40 80,35 75,42 68,50 64,60 60,68 52,74 42,76 34,74 28,68 24,60 22,50 24,42 26,36 28,32"
            style={getOverlayStyle('campo-grande-ipes')}
            stroke={hoveredRegion === 'campo-grande-ipes' || selectedRegion === 'campo-grande-ipes' ? '#FF9800' : 'transparent'}
            strokeWidth="0.5"
            onClick={() => handleRegionClick('campo-grande-ipes')}
            onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'campo-grande-ipes')!)}
            onMouseLeave={handleMouseLeave}
          />

          {/* BONITO-SERRA DA BODOQUENA - Sudoeste */}
          <polygon
            points="10,40 14,44 20,42 26,36 24,42 22,50 24,60 26,70 24,80 18,88 12,92 8,90 5,82 5,72 7,60 9,50 10,40"
            style={getOverlayStyle('bonito-serra-bodoquena')}
            stroke={hoveredRegion === 'bonito-serra-bodoquena' || selectedRegion === 'bonito-serra-bodoquena' ? '#E91E63' : 'transparent'}
            strokeWidth="0.5"
            onClick={() => handleRegionClick('bonito-serra-bodoquena')}
            onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'bonito-serra-bodoquena')!)}
            onMouseLeave={handleMouseLeave}
          />

          {/* CAMINHOS DA FRONTEIRA - Sul */}
          <polygon
            points="12,92 18,88 24,80 26,70 28,68 34,74 36,82 34,92 28,100 20,105 12,105 8,98 8,92 12,92"
            style={getOverlayStyle('caminhos-fronteira')}
            stroke={hoveredRegion === 'caminhos-fronteira' || selectedRegion === 'caminhos-fronteira' ? '#4CAF50' : 'transparent'}
            strokeWidth="0.5"
            onClick={() => handleRegionClick('caminhos-fronteira')}
            onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'caminhos-fronteira')!)}
            onMouseLeave={handleMouseLeave}
          />

          {/* CELEIRO DO MS - Centro-Sul */}
          <polygon
            points="42,76 52,74 60,68 64,60 65,70 64,80 60,90 52,98 42,102 35,100 34,92 36,82 34,74 42,76"
            style={getOverlayStyle('celeiro-ms')}
            stroke={hoveredRegion === 'celeiro-ms' || selectedRegion === 'celeiro-ms' ? '#CE93D8' : 'transparent'}
            strokeWidth="0.5"
            onClick={() => handleRegionClick('celeiro-ms')}
            onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'celeiro-ms')!)}
            onMouseLeave={handleMouseLeave}
          />

          {/* VALE DAS ÁGUAS - Sudeste */}
          <polygon
            points="65,70 70,75 78,72 86,65 88,75 85,85 78,92 68,96 60,95 60,90 64,80 65,70"
            style={getOverlayStyle('vale-das-aguas')}
            stroke={hoveredRegion === 'vale-das-aguas' || selectedRegion === 'vale-das-aguas' ? '#00BCD4' : 'transparent'}
            strokeWidth="0.5"
            onClick={() => handleRegionClick('vale-das-aguas')}
            onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'vale-das-aguas')!)}
            onMouseLeave={handleMouseLeave}
          />

          {/* CAMINHOS DA NATUREZA-CONE SUL - Extremo Sul */}
          <polygon
            points="34,92 35,100 42,102 52,98 60,95 68,96 78,92 82,100 78,108 68,115 52,118 38,115 26,108 20,105 28,100 34,92"
            style={getOverlayStyle('caminhos-natureza-cone-sul')}
            stroke={hoveredRegion === 'caminhos-natureza-cone-sul' || selectedRegion === 'caminhos-natureza-cone-sul' ? '#9C27B0' : 'transparent'}
            strokeWidth="0.5"
            onClick={() => handleRegionClick('caminhos-natureza-cone-sul')}
            onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'caminhos-natureza-cone-sul')!)}
            onMouseLeave={handleMouseLeave}
          />
        </svg>
      </div>

      {/* Tooltip flutuante */}
      {hoveredRegion && !selectedRegion && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl px-4 py-3 pointer-events-none z-20 border border-gray-200">
          <p className="font-semibold text-gray-800 text-sm">
            {touristRegions2025.find(r => r.id === hoveredRegion)?.name}
          </p>
          <p className="text-xs text-gray-500">Clique para explorar</p>
        </div>
      )}

      {/* Legenda das cores */}
      <div className="mt-4 p-3 bg-white/80 rounded-lg backdrop-blur-sm">
        <p className="text-xs text-gray-500 text-center mb-2 font-medium">
          Passe o mouse sobre as regiões do mapa
        </p>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {touristRegions2025.map((region) => (
            <div 
              key={region.id}
              className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-all ${
                hoveredRegion === region.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleRegionClick(region.id)}
              onMouseEnter={() => handleMouseEnter(region)}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: region.color }}
              />
              <span className="text-gray-600 truncate text-[10px]">
                {region.name.split('-')[0].split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MSInteractiveMap;
