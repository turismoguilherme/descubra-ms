import React, { useState } from 'react';
import { touristRegions2025, TouristRegion2025 } from '@/data/touristRegions2025';
import svgRegionsPaths from '@/data/svg-regions-paths.json';

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null;
  className?: string;
}

// Mapa interativo usando SVG real de MS com áreas clicáveis
// ViewBox do SVG: 0 0 896 1152
// Paths extraídos exatamente do SVG baseado nas cores das regiões
const MSInteractiveMap: React.FC<MSInteractiveMapProps> = ({
  onRegionClick,
  onRegionHover,
  selectedRegion,
  className = ""
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);

  const handleMouseEnter = (region: TouristRegion2025) => {
    setHoveredRegion(region.id);
    onRegionHover?.(region);
  };

  const handleMouseLeave = () => {
    setHoveredRegion(null);
    onRegionHover?.(null);
  };

  const handleRegionClick = (e: React.MouseEvent, regionId: string) => {
    e.stopPropagation();
    const region = touristRegions2025.find(r => r.id === regionId);
    if (region) {
      onRegionClick(region);
    }
  };

  // Estilo para destacar região ao hover - borda branca brilhante
  // IMPORTANTE: Overlay deve ser completamente invisível quando não estiver ativo
  // para não interferir com a visualização do mapa colorido
  const getOverlayStyle = (regionId: string) => {
    const isHovered = hoveredRegion === regionId;
    const isSelected = selectedRegion === regionId;
    const isActive = isHovered || isSelected;
    
    return {
      // Quando inativo: completamente transparente (sem fill, sem stroke)
      fill: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
      stroke: isActive ? '#fff' : 'transparent',
      strokeWidth: isActive ? 3 : 0,
      cursor: 'pointer',
      // Apenas mostrar efeito quando ativo
      filter: isActive ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none',
      transition: 'all 0.2s ease',
      fillRule: 'evenodd' as const,
      // Garantir que não haja renderização visual quando inativo
      opacity: isActive ? 1 : 0,
    };
  };

  // Obter paths de uma região e limpar (remover quebras de linha e espaços extras)
  const getRegionPaths = (regionId: string): string[] => {
    const paths = svgRegionsPaths.regions[regionId as keyof typeof svgRegionsPaths.regions];
    if (!paths || paths.length === 0) return [];
    // Limpar paths: remover quebras de linha e espaços múltiplos, manter apenas espaços simples
    return paths.map(path => path.replace(/\s+/g, ' ').trim());
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-full">
        {/* SVG do mapa real de MS */}
        <img
          src="/images/mapa-ms-regioes.svg"
          alt="Mapa das Regiões Turísticas de Mato Grosso do Sul"
          className="w-full h-full object-contain"
          onLoad={() => setSvgLoaded(true)}
          style={{ maxHeight: '850px' }}
        />

        {/* SVG overlay com áreas clicáveis */}
        {svgLoaded && (
          <svg
            viewBox="0 0 896 1152"
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="xMidYMid meet"
            style={{ maxHeight: '850px' }}
          >
            {/* Áreas clicáveis para cada região usando paths exatos do SVG */}
            {/* IMPORTANTE: Este overlay é invisível e serve apenas para detectar cliques/hover */}
            {/* Os paths seguem exatamente os contornos das áreas coloridas do mapa */}
            {touristRegions2025.map((region) => {
              const paths = getRegionPaths(region.id);
              if (!paths || paths.length === 0) return null;
              
              return (
                <g
                  key={region.id}
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onClick={(e) => handleRegionClick(e, region.id)}
                  onMouseEnter={() => handleMouseEnter(region)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Renderizar cada path separadamente para cobrir toda a área da região */}
                  {/* Cada path corresponde exatamente a uma área colorida no mapa original */}
                  {paths.map((pathData, index) => (
                    <path
                      key={`${region.id}-${index}`}
                      d={pathData}
                      style={{ ...getOverlayStyle(region.id), pointerEvents: 'all' }}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        )}

        {/* Loading */}
        {!svgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-ms-primary-blue border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredRegion && !selectedRegion && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl px-4 py-3 pointer-events-none z-20 border-l-4 border-ms-primary-blue animate-in fade-in slide-in-from-top-2">
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
