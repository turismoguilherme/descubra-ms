import React, { useState, useEffect } from 'react';
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
    // Só mostrar hover se não houver região selecionada
    if (!selectedRegion) {
      setHoveredRegion(region.id);
      onRegionHover?.(region);
    }
  };

  const handleMouseLeave = () => {
    // Só limpar hover se não houver região selecionada
    if (!selectedRegion) {
      setHoveredRegion(null);
      onRegionHover?.(null);
    }
  };

  const handleRegionClick = (e: React.MouseEvent, regionId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const region = touristRegions2025.find(r => r.id === regionId);
    if (region) {
      onRegionClick(region);
    }
  };

  // Estilo para destacar região ao hover - borda branca brilhante
  // IMPORTANTE: Overlay deve ser completamente invisível quando não estiver ativo
  // para não interferir com a visualização do mapa colorido
  const getOverlayStyle = (regionId: string) => {
    // IMPORTANTE: Apenas destacar se for EXATAMENTE a região selecionada ou hovered
    // Não destacar outras regiões mesmo que tenham paths sobrepostos
    const isHovered = hoveredRegion === regionId && !selectedRegion; // Só hover se não houver seleção
    const isSelected = selectedRegion === regionId; // Apenas a selecionada
    const isActive = isHovered || isSelected;
    
    // Se não estiver ativo, retornar estilo completamente invisível e sem pointer events
    if (!isActive) {
      return {
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        cursor: 'pointer',
        filter: 'none',
        transition: 'all 0.2s ease',
        fillRule: 'evenodd' as const,
        opacity: 0,
        visibility: 'hidden' as const,
        pointerEvents: 'all' as const, // Manter clicável mesmo quando invisível
      };
    }
    
    return {
      fill: 'rgba(255,255,255,0.2)',
      stroke: '#fff',
      strokeWidth: 4,
      cursor: 'pointer',
      filter: 'drop-shadow(0 0 12px rgba(255,255,255,1))',
      transition: 'all 0.2s ease',
      fillRule: 'evenodd' as const,
      opacity: 1,
      visibility: 'visible' as const,
      pointerEvents: 'all' as const,
    };
  };

  // Obter paths de uma região e limpar (remover quebras de linha e espaços extras)
  const getRegionPaths = (regionId: string): string[] => {
    const paths = svgRegionsPaths.regions[regionId as keyof typeof svgRegionsPaths.regions];
    if (!paths || paths.length === 0) {
      console.warn(`⚠️ Nenhum path encontrado para região: ${regionId}`);
      return [];
    }
    // Limpar paths: remover quebras de linha e espaços múltiplos, manter apenas espaços simples
    const cleanedPaths = paths.map(path => path.replace(/\s+/g, ' ').trim());
    return cleanedPaths;
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
            {/* Ordem de renderização: regiões menores primeiro, maiores por último (menores ficam por cima e capturam cliques) */}
            {(() => {
              const regionsWithPaths = touristRegions2025
                .map((region) => {
                  const paths = getRegionPaths(region.id);
                  const isSelected = selectedRegion === region.id;
                  const isHovered = hoveredRegion === region.id;
                  const isActive = isSelected || isHovered;
                  return { 
                    region, 
                    paths, 
                    pathCount: paths.length,
                    isActive,
                    isSelected,
                    isHovered
                  };
                })
                .filter(({ paths }) => paths && paths.length > 0)
                // Ordenar: regiões menores por último (para ficarem por cima e capturarem cliques)
                // Regiões ativas sempre por último para ficarem visíveis
                .sort((a, b) => {
                  if (a.isActive && !b.isActive) return 1; // Ativas por último
                  if (!a.isActive && b.isActive) return -1;
                  // Dentro do mesmo grupo, menores por último (ficam por cima)
                  return b.pathCount - a.pathCount;
                });
              
              return regionsWithPaths.map(({ region, paths, isActive }) => {
                const overlayStyle = getOverlayStyle(region.id);
                // Se a região não estiver ativa, ainda renderizar mas completamente invisível
                // para manter a funcionalidade de clique
                return (
                  <g
                    key={region.id}
                    style={{ pointerEvents: 'none' }}
                    onMouseEnter={() => handleMouseEnter(region)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Renderizar cada path separadamente para cobrir toda a área da região */}
                    {/* Cada path corresponde exatamente a uma área colorida no mapa original */}
                    {paths.map((pathData, index) => (
                      <path
                        key={`${region.id}-${index}`}
                        d={pathData}
                        style={overlayStyle}
                        data-region-id={region.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          // Garantir que apenas esta região seja clicada
                          handleRegionClick(e, region.id);
                        }}
                        onMouseDown={(e) => {
                          // Prevenir que outros paths capturem o evento
                          e.stopPropagation();
                        }}
                        onMouseUp={(e) => {
                          // Prevenir propagação também no mouseUp
                          e.stopPropagation();
                        }}
                      />
                    ))}
                  </g>
                );
              });
            })()}
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
