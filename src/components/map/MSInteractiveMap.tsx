import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { useTouristRegions } from '@/hooks/useTouristRegions';
import { getRegionByColor, isAmbiguousPurple, isSpanningPath } from '@/data/regionColorMapping';

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
    // Fallback: bounding box nativo do SVG (preciso)
    try {
      const bbox = (gElement as unknown as SVGGElement).getBBox();
      const centerY = bbox.y + bbox.height / 2;
      return centerY > CAMPO_GRANDE_CELEIRO_Y_THRESHOLD ? 'celeiro-ms' : 'campo-grande-ipes';
    } catch {
      // getBBox pode falhar se elemento não estiver no DOM
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
   * Primeiro verifica data-region no próprio elemento ou ancestrais (path ou group).
   * Para cores ambíguas, usa svgY para decidir Campo Grande vs Celeiro.
   */
  const getRegionSlugFromElement = useCallback((element: Element, svgY?: number): string | null => {
    // 1) Verificar data-region no próprio elemento ou ancestrais (path-level ou group-level)
    const regionEl = element.closest('[data-region]');
    if (regionEl) {
      const slug = regionEl.getAttribute('data-region');
      // Para ambíguos com svgY, re-resolver com posição do mouse
      if (slug && svgY !== undefined) {
        const fill = (regionEl.closest('g[fill]') || regionEl).getAttribute('fill');
        if (fill) {
          const hex = fill.replace('#', '').toUpperCase();
          if (isAmbiguousPurple(hex)) {
            return svgY > CAMPO_GRANDE_CELEIRO_Y_THRESHOLD ? 'celeiro-ms' : 'campo-grande-ipes';
          }
        }
      }
      return slug;
    }
    // 2) Fallback: subir hierarquia procurando <g fill>
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

    // Marcar grupos/paths com data-region para highlighting
    const groups = svgEl.querySelectorAll('g[fill]');
    groups.forEach(g => {
      const fill = (g.getAttribute('fill') || '').replace('#', '').toUpperCase();
      if (isAmbiguousPurple(fill)) {
        // AMBÍGUO: classificar cada path individualmente pelo seu próprio bounding box
        (g as HTMLElement).style.cursor = 'pointer';
        g.setAttribute('data-ambiguous', 'true');
        // NÃO colocar data-region no <g> — colocar em cada <path>
        const paths = g.querySelectorAll('path');
        paths.forEach(pathEl => {
          try {
            const bbox = (pathEl as SVGPathElement).getBBox();
            const centerY = bbox.y + bbox.height / 2;
            const slug = centerY > CAMPO_GRANDE_CELEIRO_Y_THRESHOLD ? 'celeiro-ms' : 'campo-grande-ipes';
            pathEl.setAttribute('data-region', slug);
          } catch {
            // fallback: usar grupo inteiro
            const slug = resolveRegionForGroup(g);
            if (slug) pathEl.setAttribute('data-region', slug);
          }
        });
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
    // Selecionar TODOS os elementos com data-region (paths individuais + grupos)
    const regionElements = svgEl.querySelectorAll('[data-region]');

    regionElements.forEach(el => {
      const svgEl2 = el as SVGElement;
      const regionSlug = el.getAttribute('data-region');

      if (activeSlug && regionSlug === activeSlug) {
        svgEl2.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.8))';
      } else if (activeSlug && regionSlug !== activeSlug) {
        svgEl2.style.filter = 'brightness(0.7)';
      } else {
        svgEl2.style.filter = 'none';
      }
      svgEl2.style.transition = 'filter 0.2s ease';
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
