import React, { useState } from 'react';
import { touristRegions2025, TouristRegion2025 } from '@/data/touristRegions2025';

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null;
  className?: string;
}

// SVG paths das 9 regiões turísticas de MS
// Baseado no formato geográfico REAL do estado de Mato Grosso do Sul
// Referência: Mapa de Regionalização do Turismo 2022/2025
// O estado tem formato característico com:
// - Bico no noroeste (Corumbá/Pantanal)
// - Extensão larga no norte (fronteira com MT)
// - Formato mais retangular com bordas irregulares
const regionPaths: Record<string, string> = {
  // Pantanal - Noroeste do estado (AMARELO no mapa oficial)
  // Corumbá, Ladário, Aquidauana, Miranda, Anastácio
  "pantanal": `M 25 45 
    L 40 35 L 65 30 L 90 40 L 110 55 
    L 120 80 L 125 110 L 120 140 L 110 165 
    L 95 185 L 75 195 L 55 190 
    L 40 175 L 30 150 L 25 120 L 20 90 L 25 45 Z`,
  
  // Rota Cerrado Pantanal - Norte (VERDE CLARO no mapa oficial)  
  // Sonora, Pedro Gomes, Coxim, Costa Rica, Alcinópolis, Chapadão do Sul
  "rota-cerrado-pantanal": `M 90 40 
    L 130 30 L 180 25 L 230 25 L 280 30 L 330 40 L 370 55
    L 365 85 L 350 110 L 320 125 L 280 130 
    L 240 125 L 200 115 L 160 100 L 130 80 
    L 120 80 L 110 55 L 90 40 Z`,
  
  // Costa Leste - Leste (VERMELHO no mapa oficial)
  // Três Lagoas, Paranaíba, Cassilândia, Aparecida do Taboado, Selvíria  
  "costa-leste": `M 370 55 
    L 410 70 L 440 100 L 450 140 L 445 180 L 430 220 
    L 405 255 L 375 280 L 345 290 
    L 320 280 L 300 255 L 290 220 L 295 180 
    L 310 145 L 330 115 L 350 110 L 365 85 L 370 55 Z`,
  
  // Campo Grande dos Ipês - Centro (LARANJA no mapa oficial)
  // Campo Grande, Terenos, Sidrolândia, Jaraguari, Rochedo, Corguinho, Rio Negro
  "campo-grande-ipes": `M 120 140 
    L 130 80 L 160 100 L 200 115 L 240 125 L 280 130 
    L 295 180 L 290 220 L 275 255 
    L 245 275 L 205 285 L 170 280 
    L 145 260 L 125 230 L 115 195 L 120 140 Z`,
  
  // Bonito-Serra da Bodoquena - Sudoeste (ROSA/MAGENTA no mapa oficial)
  // Bonito, Jardim, Bodoquena, Nioaque, Guia Lopes, Porto Murtinho, Bela Vista
  "bonito-serra-bodoquena": `M 40 175 
    L 55 190 L 75 195 L 95 185 L 110 165 L 120 140 L 115 195 
    L 125 230 L 130 270 L 120 310 L 95 345 
    L 65 365 L 40 355 L 25 320 L 20 280 L 25 240 L 40 175 Z`,
  
  // Caminhos da Fronteira - Sul/Fronteira (VERDE no mapa oficial)
  // Ponta Porã, Antônio João, Aral Moreira, Coronel Sapucaia, Paranhos, Amambai
  "caminhos-fronteira": `M 65 365 
    L 95 345 L 120 310 L 130 270 L 145 260 
    L 165 295 L 175 335 L 165 375 
    L 140 405 L 105 420 L 70 410 L 50 385 L 65 365 Z`,
  
  // Grande Dourados / Celeiro do MS - Centro-Sul (LILÁS no mapa oficial)
  // Dourados, Maracaju, Rio Brilhante, Itaporã, Fátima do Sul, Caarapó
  "celeiro-ms": `M 170 280 
    L 205 285 L 245 275 L 275 255 L 290 220 L 300 255 
    L 295 295 L 275 330 L 245 355 L 210 365 
    L 175 375 L 175 335 L 165 295 L 145 260 L 170 280 Z`,
  
  // Vale das Águas - Sudeste (CIANO/AZUL CLARO no mapa oficial)
  // Nova Andradina, Ivinhema, Batayporã, Taquarussu, Anaurilândia, Bataguassu
  "vale-das-aguas": `M 300 255 
    L 320 280 L 345 290 L 375 280 L 385 310 
    L 375 345 L 350 375 L 315 390 
    L 280 385 L 260 360 L 275 330 L 295 295 L 300 255 Z`,
  
  // Caminhos da Natureza-Cone Sul - Extremo Sul (ROXO no mapa oficial)
  // Naviraí, Eldorado, Mundo Novo, Iguatemi, Itaquiraí, Japorã, Tacuru
  "caminhos-natureza-cone-sul": `M 165 375 
    L 175 375 L 210 365 L 245 355 L 260 360 L 280 385 L 315 390 
    L 330 420 L 320 455 L 280 480 L 220 485 
    L 160 470 L 120 445 L 105 420 L 140 405 L 165 375 Z`
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
        viewBox="0 0 470 510"
        className="w-full h-full"
        style={{ maxHeight: '580px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Definições de filtros e gradientes */}
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="3" stdDeviation="4" floodOpacity="0.25" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gradiente de fundo */}
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8f9fa" />
            <stop offset="100%" stopColor="#e9ecef" />
          </linearGradient>
        </defs>

        {/* Contorno do estado de MS (fundo) - formato baseado no mapa real */}
        <path
          d={`M 20 40 
            L 40 30 L 90 25 L 180 20 L 280 25 L 370 50 L 410 65 
            L 450 135 L 448 200 L 430 260 L 400 310 L 375 350 
            L 340 400 L 320 460 L 280 485 L 220 490 L 160 475 
            L 110 445 L 70 415 L 45 375 L 30 330 L 20 280 
            L 15 220 L 15 150 L 18 90 L 20 40 Z`}
          fill="url(#bgGradient)"
          stroke="#ccc"
          strokeWidth="2"
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
          // Posições dos centros das regiões baseadas no mapa atualizado
          const labelPositions: Record<string, { x: number; y: number }> = {
            "pantanal": { x: 70, y: 115 },
            "bonito-serra-bodoquena": { x: 80, y: 275 },
            "campo-grande-ipes": { x: 200, y: 195 },
            "rota-cerrado-pantanal": { x: 240, y: 75 },
            "costa-leste": { x: 370, y: 175 },
            "celeiro-ms": { x: 225, y: 320 },
            "vale-das-aguas": { x: 325, y: 335 },
            "caminhos-fronteira": { x: 120, y: 375 },
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

