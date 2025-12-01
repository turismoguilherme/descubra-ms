import React, { useState } from 'react';
import { touristRegions2025, TouristRegion2025 } from '@/data/touristRegions2025';

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null;
  className?: string;
}

// Contorno real do estado de Mato Grosso do Sul
// Baseado em coordenadas geográficas simplificadas
// Fonte: IBGE - limites do estado
const MS_OUTLINE = `M 85,15 L 95,12 L 140,10 L 200,10 L 260,12 L 320,18 L 370,30 
  L 400,45 L 420,70 L 430,100 L 435,140 L 432,180 L 425,220 L 415,260 
  L 400,295 L 380,325 L 355,355 L 330,380 L 300,405 L 265,425 L 225,440 
  L 185,448 L 145,445 L 110,435 L 80,415 L 55,390 L 40,360 L 30,325 
  L 25,285 L 22,245 L 20,200 L 18,155 L 20,110 L 28,70 L 45,40 L 70,22 Z`;

// Paths das 9 regiões turísticas baseadas no mapa oficial
// Escala: 450x460 viewBox
const regionPaths: Record<string, string> = {
  // PANTANAL - Noroeste (AMARELO) - Corumbá, Ladário, Aquidauana, Miranda
  "pantanal": `M 45,40 L 70,22 L 85,15 L 95,12 L 115,11 
    L 130,25 L 140,50 L 145,80 L 140,115 L 130,145 
    L 115,175 L 95,195 L 75,205 L 55,200 
    L 40,180 L 30,150 L 25,115 L 28,70 L 45,40 Z`,
  
  // ROTA CERRADO PANTANAL - Norte (VERDE CLARO) - Sonora, Coxim, Costa Rica
  "rota-cerrado-pantanal": `M 115,11 L 140,10 L 200,10 L 260,12 L 320,18 L 370,30 
    L 380,55 L 370,90 L 350,120 L 320,140 L 280,150 
    L 240,145 L 200,135 L 165,120 L 145,100 L 140,70 L 135,40 L 130,25 L 115,11 Z`,
  
  // COSTA LESTE - Leste (VERMELHO) - Três Lagoas, Paranaíba, Cassilândia
  "costa-leste": `M 370,30 L 400,45 L 420,70 L 430,100 L 435,140 L 432,180 L 425,220 
    L 410,255 L 390,280 L 365,295 
    L 340,290 L 320,270 L 310,240 L 315,200 L 330,160 L 350,120 L 370,90 L 380,55 L 370,30 Z`,
  
  // CAMPO GRANDE DOS IPÊS - Centro (LARANJA) - Campo Grande, Terenos, Sidrolândia
  "campo-grande-ipes": `M 130,145 L 145,100 L 165,120 L 200,135 L 240,145 L 280,150 
    L 310,165 L 315,200 L 310,240 L 295,275 
    L 265,300 L 225,310 L 185,305 L 155,290 
    L 135,265 L 120,230 L 115,195 L 120,165 L 130,145 Z`,
  
  // BONITO-SERRA DA BODOQUENA - Sudoeste (ROSA) - Bonito, Jardim, Bodoquena
  "bonito-serra-bodoquena": `M 40,180 L 55,200 L 75,205 L 95,195 L 115,175 L 130,145 L 120,165 L 115,195 L 120,230 
    L 125,265 L 120,300 L 100,335 L 75,360 
    L 50,365 L 35,345 L 28,310 L 25,270 L 28,230 L 35,195 L 40,180 Z`,
  
  // CAMINHOS DA FRONTEIRA - Sul (VERDE) - Ponta Porã, Antônio João
  "caminhos-fronteira": `M 75,360 L 100,335 L 120,300 L 125,265 L 135,265 L 155,290 
    L 165,325 L 165,360 L 155,390 
    L 130,415 L 100,425 L 75,415 L 55,390 L 50,365 L 75,360 Z`,
  
  // CELEIRO DO MS / GRANDE DOURADOS - Centro-Sul (LILÁS) - Dourados, Maracaju
  "celeiro-ms": `M 185,305 L 225,310 L 265,300 L 295,275 L 310,240 L 320,270 
    L 315,310 L 295,345 L 265,375 L 225,390 
    L 190,395 L 170,385 L 165,360 L 165,325 L 155,290 L 185,305 Z`,
  
  // VALE DAS ÁGUAS - Sudeste (CIANO) - Nova Andradina, Ivinhema
  "vale-das-aguas": `M 320,270 L 340,290 L 365,295 L 390,280 L 400,295 
    L 395,330 L 380,360 L 355,385 L 320,400 
    L 285,395 L 265,375 L 295,345 L 315,310 L 320,270 Z`,
  
  // CAMINHOS DA NATUREZA-CONE SUL - Extremo Sul (ROXO) - Naviraí, Eldorado, Mundo Novo
  "caminhos-natureza-cone-sul": `M 165,360 L 170,385 L 190,395 L 225,390 L 265,375 L 285,395 L 320,400 
    L 340,420 L 330,445 L 300,460 L 260,468 L 225,470 
    L 185,465 L 150,455 L 120,440 L 100,425 L 130,415 L 155,390 L 165,360 Z`
};

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

  const getRegionFill = (region: TouristRegion2025) => {
    const isHovered = hoveredRegion === region.id;
    const isSelected = selectedRegion === region.id;
    
    if (isSelected) {
      return region.colorHover;
    }
    if (isHovered) {
      return region.colorHover;
    }
    return region.color;
  };

  const getRegionOpacity = (region: TouristRegion2025) => {
    if (selectedRegion && selectedRegion !== region.id) {
      return 0.4;
    }
    return 1;
  };

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 460 490"
        className="w-full h-full"
        style={{ maxHeight: '550px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Definições de filtros e gradientes */}
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="3" stdDeviation="4" floodOpacity="0.2" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Contorno do estado de MS (sombra de fundo) */}
        <path
          d={MS_OUTLINE}
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="3"
          filter="url(#shadow)"
        />

        {/* Regiões turísticas */}
        {touristRegions2025.map((region) => (
          <g key={region.id}>
            <path
              d={regionPaths[region.id]}
              fill={getRegionFill(region)}
              opacity={getRegionOpacity(region)}
              stroke="#fff"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-300 ease-in-out"
              style={{
                filter: (hoveredRegion === region.id || selectedRegion === region.id) ? 'url(#glow)' : 'none',
                transform: (hoveredRegion === region.id || selectedRegion === region.id) ? 'scale(1.02)' : 'scale(1)',
                transformOrigin: 'center',
                transformBox: 'fill-box'
              }}
              onClick={() => onRegionClick(region)}
              onMouseEnter={() => handleMouseEnter(region)}
              onMouseLeave={handleMouseLeave}
            />
          </g>
        ))}

        {/* Labels das regiões */}
        {touristRegions2025.map((region) => {
          // Posições dos centros das regiões no mapa
          const labelPositions: Record<string, { x: number; y: number }> = {
            "pantanal": { x: 85, y: 120 },
            "bonito-serra-bodoquena": { x: 75, y: 280 },
            "campo-grande-ipes": { x: 215, y: 210 },
            "rota-cerrado-pantanal": { x: 250, y: 85 },
            "costa-leste": { x: 375, y: 190 },
            "celeiro-ms": { x: 235, y: 345 },
            "vale-das-aguas": { x: 340, y: 345 },
            "caminhos-fronteira": { x: 115, y: 385 },
            "caminhos-natureza-cone-sul": { x: 230, y: 430 }
          };

          const pos = labelPositions[region.id];
          const isActive = hoveredRegion === region.id || selectedRegion === region.id;

          return (
            <text
              key={`label-${region.id}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              className="pointer-events-none select-none transition-all duration-300"
              style={{
                fontSize: isActive ? '11px' : '9px',
                fontWeight: isActive ? 'bold' : 'normal',
                fill: '#fff',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                opacity: selectedRegion && selectedRegion !== region.id ? 0.5 : 1
              }}
            >
              {region.name.length > 15 
                ? region.name.split('-')[0].trim()
                : region.name.split(' ')[0]
              }
            </text>
          );
        })}
      </svg>

      {/* Tooltip flutuante */}
      {hoveredRegion && !selectedRegion && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl px-4 py-2 pointer-events-none z-10 border border-gray-200">
          <p className="font-semibold text-gray-800 text-sm">
            {touristRegions2025.find(r => r.id === hoveredRegion)?.name}
          </p>
          <p className="text-xs text-gray-500">Clique para explorar</p>
        </div>
      )}
    </div>
  );
};

export default MSInteractiveMap;

