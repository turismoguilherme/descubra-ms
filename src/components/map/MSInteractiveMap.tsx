import React, { useState, useEffect, useRef } from 'react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { useTouristRegions } from '@/hooks/useTouristRegions';
import svgRegionsPaths from '@/data/svg-regions-paths.json';

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null; // Agora espera slug, não id
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
  console.log(`🔄 [MSInteractiveMap] Render - selectedRegion: ${selectedRegion}`);
  const { regions: touristRegions } = useTouristRegions();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup do timeout quando o componente desmontar
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (region: TouristRegion2025) => {
    // Só mostrar hover se não houver região selecionada
    if (!selectedRegion) {
      setHoveredRegion(region.slug);
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

  const handleRegionClick = (e: React.MouseEvent, regionSlug: string) => {
    // CRÍTICO: Parar propagação para evitar que outros elementos capturem o evento
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    // Buscar região por slug (identificador consistente)
    const region = touristRegions.find(r => r.slug === regionSlug);
    
    if (region) {
      // Chamar imediatamente para resposta instantânea
      onRegionClick(region);
      
      // Log para debug
      console.log(`🗺️ [MSInteractiveMap] Região clicada: ${region.name} (Slug: ${regionSlug})`);
    } else {
      console.warn(`⚠️ [MSInteractiveMap] Região não encontrada: ${regionSlug}`);
      console.warn(`⚠️ [MSInteractiveMap] Regiões disponíveis:`, touristRegions.map(r => `${r.name} (${r.slug})`));
    }
  };

  // Estilo para destacar região ao hover - borda branca brilhante
  // IMPORTANTE: Overlay deve ser completamente invisível quando não estiver ativo
  // para não interferir com a visualização do mapa colorido
  const getOverlayStyle = (regionSlug: string) => {
    // CRÍTICO: Comparação por slug (identificador consistente)
    const hasSelection = Boolean(selectedRegion && selectedRegion.trim() !== '');
    const hasHover = Boolean(hoveredRegion && hoveredRegion.trim() !== '');

    // Só hover se não houver seleção E se for exatamente esta região
    const isHovered = hasHover && hoveredRegion === regionSlug && !hasSelection;
    // Só selecionada se houver seleção E for EXATAMENTE esta região
    const isSelected = hasSelection && selectedRegion === regionSlug;
    const isActive = isHovered || isSelected;

    // Log para debug quando selecionado (apenas uma vez por render)
    if (isSelected && regionSlug === selectedRegion) {
      console.log(`✨ [getOverlayStyle] Destacando APENAS região: ${regionSlug}, selectedRegion: ${selectedRegion}, hasSelection: ${hasSelection}`);
    }

    // Se não estiver ativo, retornar estilo completamente invisível mas ainda clicável
    if (!isActive) {
      return {
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        cursor: 'pointer',
        filter: 'none',
        transition: 'all 0.2s ease',
        fillRule: 'evenodd' as const,
        opacity: 0, // Invisível mas ainda clicável
        visibility: 'visible' as const, // Manter visible para permitir cliques
        pointerEvents: 'all' as const, // CRÍTICO: Manter clicável mesmo quando invisível
      };
    }

    // Apenas aplicar estilo de destaque se for EXATAMENTE a região selecionada/hovered
    // Usar estilo mais visível para garantir que apenas esta região seja destacada
    console.log(`🎯 [getOverlayStyle] Aplicando destaque para: ${regionSlug} (isSelected: ${isSelected}, isHovered: ${isHovered})`);
    return {
      fill: 'rgba(255,255,255,0.3)',
      stroke: '#fff',
      strokeWidth: 6,
      cursor: 'pointer',
      filter: 'drop-shadow(0 0 20px rgba(255,255,255,1))',
      transition: 'all 0.2s ease',
      fillRule: 'evenodd' as const,
      opacity: 1,
      visibility: 'visible' as const,
      pointerEvents: 'all' as const,
    };
  };

  // Obter paths de uma região usando slug (chave consistente no JSON)
  const getRegionPaths = (regionSlug: string): string[] => {
    const paths = svgRegionsPaths.regions[regionSlug as keyof typeof svgRegionsPaths.regions];
    if (!paths || paths.length === 0) {
      console.warn(`⚠️ Nenhum path encontrado para região: ${regionSlug}`);
      return [];
    }
    // Limpar paths: remover quebras de linha e espaços múltiplos, manter apenas espaços simples
    const cleanedPaths = paths.map(path => path.replace(/\s+/g, ' ').trim());
    return cleanedPaths;
  };

  // Ordem de renderização fixa para evitar sobreposição incorreta
  // Regiões menores/centrais devem renderizar por último (ficam por cima)
  const getRenderPriority = (slug: string): number => {
    const priorities: Record<string, number> = {
      'campo-grande-ipes': 10,       // Menor e central - renderizar por último (MAIOR prioridade)
      'bonito-serra-bodoquena': 9,
      'caminhos-fronteira': 8,
      'caminhos-natureza-cone-sul': 7,
      'celeiro-ms': 6,
      'vale-das-aguas': 5,
      'costa-leste': 4,
      'rota-cerrado-pantanal': 3,
      'pantanal': 1,                  // Maior área - renderizar primeiro (MENOR prioridade)
    };
    return priorities[slug] || 5; // Prioridade padrão
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
          style={{ maxHeight: '850px', pointerEvents: 'none' }}
        />

        {/* SVG overlay com áreas clicáveis */}
        {svgLoaded && (
          <svg
            viewBox="0 0 896 1152"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            style={{ maxHeight: '850px', pointerEvents: 'auto' }}
          >
            {/* Áreas clicáveis para cada região usando paths exatos do SVG */}
            {/* IMPORTANTE: Este overlay é invisível e serve apenas para detectar cliques/hover */}
            {/* Os paths seguem exatamente os contornos das áreas coloridas do mapa */}
            {/* Ordem de renderização: regiões menores primeiro, maiores por último (menores ficam por cima e capturam cliques) */}
            {(() => {
              // CRÍTICO: Usar slug como identificador consistente
              const normalizedSelectedSlug = selectedRegion || null;
              
              const regionsWithPaths = touristRegions
                .map((region) => {
                  const paths = getRegionPaths(region.slug);

                  // Comparação por slug (identificador consistente)
                  const isSelected = normalizedSelectedSlug === region.slug;
                  const isHovered = hoveredRegion === region.slug;
                  const isActive = isSelected || isHovered;

                  // Log para debug: verificar se múltiplas regiões estão ativas
                  if (isActive) {
                    console.log(`🎯 [Map] Região ativa: ${region.name} (isSelected: ${isSelected}, isHovered: ${isHovered})`);
                  }
                  
                  // Log para debug quando selecionado
                  if (isSelected) {
                    console.log(`🎯 [Map] Região marcada como selecionada: ${region.name} (Slug: ${region.slug})`);
                  }
                  
                  return { 
                    region, 
                    paths, 
                    pathCount: paths.length,
                    renderPriority: getRenderPriority(region.slug),
                    isActive,
                    isSelected,
                    isHovered
                  };
                })
                .filter(({ paths }) => paths && paths.length > 0)
                // Ordenar: regiões selecionadas/ativas por último (ficam visíveis)
                // Dentro do mesmo grupo, usar prioridade fixa (menores por cima)
                .sort((a, b) => {
                  // REGRA PRINCIPAL: Selecionada sempre por último (fica por cima)
                  if (a.isSelected && !b.isSelected) return 1;
                  if (!a.isSelected && b.isSelected) return -1;
                  // Hover (se não houver seleção) também por último
                  if (a.isHovered && !b.isHovered) return 1;
                  if (!a.isHovered && b.isHovered) return -1;
                  // Para regiões inativas, ordenar por prioridade de renderização
                  return b.renderPriority - a.renderPriority;
                });
              
              return regionsWithPaths.map(({ region, paths }) => {
                // CRÍTICO: Verificação por slug - garantir que apenas uma região seja ativa por vez
                const isActuallySelected = normalizedSelectedSlug === region.slug;
                const isActuallyHovered = hoveredRegion === region.slug && !normalizedSelectedSlug;

                // Aplicar estilo baseado no slug - apenas uma região deve ter destaque ativo
                const overlayStyle = getOverlayStyle(region.slug);

                // Log adicional para debug (apenas para região selecionada)
                if (isActuallySelected) {
                  console.log(`✅ [Render] Renderizando região selecionada: ${region.name} (Slug: ${region.slug})`);
                }
                
                return (
                  <g
                    key={region.slug}
                    style={{ 
                      pointerEvents: 'all', // Grupo captura eventos (melhor performance e detecção)
                      isolation: 'isolate', // Criar novo contexto de empilhamento
                      cursor: 'pointer'
                    }}
                    onClick={(e: React.MouseEvent<SVGGElement>) => {
                      console.log(`🖱️ [Group Click] Região clicada: ${region.name} (Slug: ${region.slug})`);
                      
                      // CRÍTICO: Parar propagação para evitar que outros grupos capturem o evento
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      
                      // Chamar handler com slug
                      handleRegionClick(e, region.slug);
                    }}
                    onMouseEnter={() => {
                      // Só permitir hover se não houver seleção
                      if (!normalizedSelectedSlug) {
                        handleMouseEnter(region);
                      }
                    }}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Renderizar cada path separadamente para cobrir toda a área da região */}
                    {/* Cada path corresponde exatamente a uma área colorida no mapa original */}
                    {paths.map((pathData, index) => (
                      <path
                        key={`${region.slug}-${index}`}
                        d={pathData}
                        style={{
                          ...overlayStyle,
                          // Paths herdam pointerEvents do grupo, mas garantimos que seja 'all'
                          pointerEvents: 'inherit',
                        }}
                        data-region-slug={region.slug}
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
            {touristRegions.find(r => r.slug === hoveredRegion)?.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">Clique para explorar</p>
        </div>
      )}
    </div>
  );
};

export default MSInteractiveMap;
