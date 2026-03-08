import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { useTouristRegions } from '@/hooks/useTouristRegions';
import { getRegionByColor, isAmbiguousPurple, resolveAmbiguousPurple } from '@/data/regionColorMapping';

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null;
  className?: string;
}

/**
 * Determina o slug da região de um grupo SVG <g> baseado no fill e posição.
 * Para cores roxas ambíguas (Campo Grande vs Celeiro), usa a coordenada Y.
 */
function resolveRegionForGroup(gElement: Element): string | null {
  const fill = gElement.getAttribute('fill');
  if (!fill || fill === 'None' || fill === 'none') return null;

  const hex = fill.replace('#', '').toUpperCase();
  const slug = getRegionByColor(hex);
  if (!slug) return null;

  // Para cores roxas que aparecem tanto em Campo Grande quanto em Celeiro,
  // verificar posição Y do primeiro path para distinguir
  if (isAmbiguousPurple(hex)) {
    const pathEl = gElement.querySelector('path');
    if (pathEl) {
      const d = pathEl.getAttribute('d') || '';
      return resolveAmbiguousPurple(d);
    }
  }

  return slug;
}

const MSInteractiveMap: React.FC<MSInteractiveMapProps> = ({
  onRegionClick,
  onRegionHover,
  selectedRegion,
  className = ""
}) => {
  const { regions: touristRegions } = useTouristRegions();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const eventHandlersAttached = useRef(false);

  // Buscar SVG como texto
  useEffect(() => {
    fetch('/images/mapa-ms-regioes.svg')
      .then(res => res.text())
      .then(text => {
        setSvgContent(text);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar SVG do mapa:', err);
        setIsLoading(false);
      });
  }, []);

  const findRegionBySlug = useCallback((slug: string): TouristRegion2025 | undefined => {
    return touristRegions.find(r => r.slug === slug);
  }, [touristRegions]);

  // Determinar região de um elemento clicado subindo na hierarquia
  const getRegionSlugFromElement = useCallback((element: Element): string | null => {
    let current: Element | null = element;
    while (current && current.tagName !== 'svg') {
      if (current.tagName === 'g') {
        const regionSlug = current.getAttribute('data-region');
        if (regionSlug) return regionSlug;
      }
      current = current.parentElement;
    }
    return null;
  }, []);

  // Attach event handlers e data-region ao SVG inline
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current || eventHandlersAttached.current) return;
    if (touristRegions.length === 0) return;

    const svgEl = svgContainerRef.current.querySelector('svg');
    if (!svgEl) return;

    svgEl.setAttribute('width', '100%');
    svgEl.setAttribute('height', '100%');
    svgEl.style.maxHeight = '850px';

    // Resolver e marcar cada <g> com data-region
    const groups = svgEl.querySelectorAll('g[fill]');
    groups.forEach(g => {
      const slug = resolveRegionForGroup(g);
      if (slug) {
        (g as HTMLElement).style.cursor = 'pointer';
        g.setAttribute('data-region', slug);
      }
    });

    // Delegação de eventos no SVG
    const handleClick = (e: Event) => {
      const target = e.target as Element;
      const slug = getRegionSlugFromElement(target);
      if (slug) {
        e.stopPropagation();
        const region = findRegionBySlug(slug);
        if (region) {
          onRegionClick(region);
        }
      }
    };

    const handleMouseOver = (e: Event) => {
      if (selectedRegion) return;
      const target = e.target as Element;
      const slug = getRegionSlugFromElement(target);
      if (slug && slug !== hoveredRegion) {
        setHoveredRegion(slug);
        const region = findRegionBySlug(slug);
        if (region) onRegionHover?.(region);
      }
    };

    const handleMouseOut = (e: Event) => {
      if (selectedRegion) return;
      const relatedTarget = (e as MouseEvent).relatedTarget as Element | null;
      if (relatedTarget && svgEl.contains(relatedTarget)) {
        const newSlug = getRegionSlugFromElement(relatedTarget);
        if (newSlug) return;
      }
      setHoveredRegion(null);
      onRegionHover?.(null);
    };

    svgEl.addEventListener('click', handleClick);
    svgEl.addEventListener('mouseover', handleMouseOver);
    svgEl.addEventListener('mouseout', handleMouseOut);
    eventHandlersAttached.current = true;

    return () => {
      svgEl.removeEventListener('click', handleClick);
      svgEl.removeEventListener('mouseover', handleMouseOver);
      svgEl.removeEventListener('mouseout', handleMouseOut);
      eventHandlersAttached.current = false;
    };
  }, [svgContent, touristRegions, selectedRegion, hoveredRegion, onRegionClick, onRegionHover, findRegionBySlug, getRegionSlugFromElement]);

  // Aplicar destaque visual
  useEffect(() => {
    if (!svgContainerRef.current) return;
    const svgEl = svgContainerRef.current.querySelector('svg');
    if (!svgEl) return;

    const activeSlug = selectedRegion || hoveredRegion;
    const groups = svgEl.querySelectorAll('g[data-region]');

    groups.forEach(g => {
      const regionSlug = g.getAttribute('data-region');
      const gEl = g as SVGGElement;

      if (activeSlug && regionSlug === activeSlug) {
        gEl.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.8))';
        gEl.style.transition = 'filter 0.2s ease';
      } else if (activeSlug && regionSlug !== activeSlug) {
        gEl.style.filter = 'brightness(0.7)';
        gEl.style.transition = 'filter 0.2s ease';
      } else {
        gEl.style.filter = 'none';
        gEl.style.transition = 'filter 0.2s ease';
      }
    });
  }, [selectedRegion, hoveredRegion]);

  const activeSlug = selectedRegion || hoveredRegion;
  const activeRegion = activeSlug ? findRegionBySlug(activeSlug) : null;

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-full">
        {svgContent && (
          <div
            ref={svgContainerRef}
            className="w-full h-full"
            style={{ maxHeight: '850px' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-ms-primary-blue border-t-transparent"></div>
          </div>
        )}
      </div>

      {activeRegion && !selectedRegion && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl px-4 py-3 pointer-events-none z-20 border-l-4 border-ms-primary-blue animate-in fade-in slide-in-from-top-2">
          <p className="font-bold text-gray-800">{activeRegion.name}</p>
          <p className="text-xs text-gray-500 mt-1">Clique para explorar</p>
        </div>
      )}
    </div>
  );
};

export default MSInteractiveMap;
