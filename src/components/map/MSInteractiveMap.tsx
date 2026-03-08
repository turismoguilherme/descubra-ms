import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { useTouristRegions } from '@/hooks/useTouristRegions';
import { getRegionByColor, isAmbiguousPurple } from '@/data/regionColorMapping';

const CAMPO_GRANDE_CELEIRO_Y_THRESHOLD = 650;

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null;
  className?: string;
}

/**
 * Converte coordenadas de tela (clientX/Y) para coordenadas SVG.
 */
function clientToSvgCoords(svgEl: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } | null {
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return null;
  const point = svgEl.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const svgPoint = point.matrixTransform(ctm.inverse());
  return { x: svgPoint.x, y: svgPoint.y };
}

/**
 * Determina o slug da região para um grupo <g>, considerando se a cor é ambígua.
 * Para cores ambíguas, usa coordenadas SVG do clique para decidir.
 */
function resolveRegionForGroup(gElement: Element, svgY?: number): string | null {
  const fill = gElement.getAttribute('fill');
  if (!fill || fill === 'None' || fill === 'none') return null;

  const hex = fill.replace('#', '').toUpperCase();
  const slug = getRegionByColor(hex);
  if (!slug) return null;

  // Para cores que existem em ambas as regiões, usar coordenada Y
  if (isAmbiguousPurple(hex)) {
    if (svgY !== undefined) {
      return svgY > CAMPO_GRANDE_CELEIRO_Y_THRESHOLD ? 'celeiro-ms' : 'campo-grande-ipes';
    }
    // Fallback: usar primeiro ponto M do path
    const pathEl = gElement.querySelector('path');
    if (pathEl) {
      const d = pathEl.getAttribute('d') || '';
      const match = d.match(/M\s+([\d.]+)\s+([\d.]+)/);
      if (match) {
        const y = parseFloat(match[2]);
        return y > CAMPO_GRANDE_CELEIRO_Y_THRESHOLD ? 'celeiro-ms' : 'campo-grande-ipes';
      }
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

  /**
   * Determina região a partir de um elemento, subindo na hierarquia.
   * Para cores ambíguas, usa svgY para decidir Campo Grande vs Celeiro.
   */
  const getRegionSlugFromElement = useCallback((element: Element, svgY?: number): string | null => {
    let current: Element | null = element;
    while (current && current.tagName !== 'svg') {
      if (current.tagName === 'g') {
        const fill = current.getAttribute('fill');
        if (fill && fill !== 'None' && fill !== 'none') {
          return resolveRegionForGroup(current, svgY);
        }
      }
      current = current.parentElement;
    }
    return null;
  }, []);

  // Attach event handlers ao SVG inline
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current || eventHandlersAttached.current) return;
    if (touristRegions.length === 0) return;

    const svgEl = svgContainerRef.current.querySelector('svg') as SVGSVGElement | null;
    if (!svgEl) return;

    svgEl.setAttribute('width', '100%');
    svgEl.setAttribute('height', '100%');
    svgEl.style.maxHeight = '850px';

    // Marcar grupos com data-region (para highlighting) e data-ambiguous
    const groups = svgEl.querySelectorAll('g[fill]');
    groups.forEach(g => {
      const fill = (g.getAttribute('fill') || '').replace('#', '').toUpperCase();
      if (isAmbiguousPurple(fill)) {
        (g as HTMLElement).style.cursor = 'pointer';
        g.setAttribute('data-ambiguous', 'true');
        // Marcar com data-region baseado no path (fallback)
        const slug = resolveRegionForGroup(g);
        if (slug) g.setAttribute('data-region', slug);
      } else {
        const slug = resolveRegionForGroup(g);
        if (slug) {
          (g as HTMLElement).style.cursor = 'pointer';
          g.setAttribute('data-region', slug);
        }
      }
    });

    const handleClick = (e: Event) => {
      const me = e as MouseEvent;
      const target = me.target as Element;
      const svgCoords = clientToSvgCoords(svgEl, me.clientX, me.clientY);
      const slug = getRegionSlugFromElement(target, svgCoords?.y);
      if (slug) {
        e.stopPropagation();
        const region = findRegionBySlug(slug);
        if (region) onRegionClick(region);
      }
    };

    const handleMouseOver = (e: Event) => {
      if (selectedRegion) return;
      const me = e as MouseEvent;
      const target = me.target as Element;
      const svgCoords = clientToSvgCoords(svgEl, me.clientX, me.clientY);
      const slug = getRegionSlugFromElement(target, svgCoords?.y);
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
        const me = e as MouseEvent;
        const svgCoords = clientToSvgCoords(svgEl, me.clientX, me.clientY);
        const newSlug = getRegionSlugFromElement(relatedTarget, svgCoords?.y);
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
      const gEl = g as SVGGElement;
      const regionSlug = g.getAttribute('data-region');
      const isAmbiguous = g.getAttribute('data-ambiguous') === 'true';

      // Para grupos ambíguos, verificar se o data-region corresponde ao ativo
      // Mas como o path cruza 2 regiões, usar lógica especial
      if (isAmbiguous && activeSlug) {
        // Grupos ambíguos: acender se o slug do grupo corresponde ao ativo
        // Mas atenuar se o slug NÃO corresponde
        if (regionSlug === activeSlug) {
          gEl.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.8))';
        } else {
          gEl.style.filter = 'brightness(0.7)';
        }
      } else if (activeSlug && regionSlug === activeSlug) {
        gEl.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.8))';
      } else if (activeSlug && regionSlug !== activeSlug) {
        gEl.style.filter = 'brightness(0.7)';
      } else {
        gEl.style.filter = 'none';
      }
      gEl.style.transition = 'filter 0.2s ease';
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
