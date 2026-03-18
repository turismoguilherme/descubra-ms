import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
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
  const onRegionClickRef = useRef(onRegionClick);
  const onRegionHoverRef = useRef(onRegionHover);
  const findRegionBySlugRef = useRef<(slug: string) => TouristRegion2025 | undefined>(() => undefined);
  const selectedRegionRef = useRef(selectedRegion);
  const hoveredRegionRef = useRef(hoveredRegion);

  // Buscar SVG como texto
  useEffect(() => {
    console.log('🗺️ [MSInteractiveMap] Iniciando carregamento do SVG...');
    fetch('/images/mapa-ms-regioes.svg')
      .then(res => {
        console.log('🗺️ [MSInteractiveMap] Resposta do fetch:', res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.text();
      })
      .then(text => {
        console.log('🗺️ [MSInteractiveMap] SVG carregado com sucesso, tamanho:', text.length, 'caracteres');
        if (!text || text.trim().length === 0) {
          throw new Error('SVG está vazio');
        }
        setSvgContent(text);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('❌ [MSInteractiveMap] Erro ao carregar SVG do mapa:', err);
        console.error('❌ [MSInteractiveMap] Erro completo:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setIsLoading(false);
        // Manter svgContent como null para mostrar estado de erro
        setSvgContent(null);
      });
  }, []);

  const findRegionBySlug = useCallback((slug: string): TouristRegion2025 | undefined => {
    return touristRegions.find(r => r.slug === slug);
  }, [touristRegions]);

  onRegionClickRef.current = onRegionClick;
  onRegionHoverRef.current = onRegionHover;
  findRegionBySlugRef.current = findRegionBySlug;
  selectedRegionRef.current = selectedRegion;
  hoveredRegionRef.current = hoveredRegion;

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

  // Encontrar o elemento SVG no container (suporta innerHTML já aplicado ou primeiro filho)
  const findSvgInContainer = useCallback((): SVGSVGElement | null => {
    const container = svgContainerRef.current;
    if (!container) return null;
    const byQuery = container.querySelector('svg');
    if (byQuery) return byQuery as SVGSVGElement;
    const first = container.firstElementChild;
    if (first?.tagName === 'svg') return first as SVGSVGElement;
    return null;
  }, []);

  // Attach event handlers ao SVG inline (useLayoutEffect para rodar após o DOM estar atualizado)
  useLayoutEffect(() => {
    if (!svgContent || !svgContainerRef.current) {
      return;
    }
    if (touristRegions.length === 0) {
      return;
    }

    let svgElRef: SVGSVGElement | null = null;
    const handleClick = (e: Event) => {
      if (!svgElRef) return;
      const me = e as MouseEvent;
      const target = me.target as Element;
      const svgCoords = clientToSvgCoords(svgElRef, me.clientX, me.clientY);
      const slug = getRegionSlugFromElement(target, svgCoords?.y);
      if (slug) {
        e.stopPropagation();
        const region = findRegionBySlugRef.current(slug);
        if (region) onRegionClickRef.current(region);
      }
    };

    const handleMouseOver = (e: Event) => {
      if (selectedRegionRef.current || !svgElRef) return;
      const me = e as MouseEvent;
      const target = me.target as Element;
      const svgCoords = clientToSvgCoords(svgElRef, me.clientX, me.clientY);
      const slug = getRegionSlugFromElement(target, svgCoords?.y);
      if (slug && slug !== hoveredRegionRef.current) {
        setHoveredRegion(slug);
        const region = findRegionBySlugRef.current(slug);
        if (region) onRegionHoverRef.current?.(region);
      }
    };

    const handleMouseOut = (e: Event) => {
      if (selectedRegionRef.current || !svgElRef) return;
      const relatedTarget = (e as MouseEvent).relatedTarget as Element | null;
      if (relatedTarget && svgElRef.contains(relatedTarget)) {
        const me = e as MouseEvent;
        const svgCoords = clientToSvgCoords(svgElRef, me.clientX, me.clientY);
        const newSlug = getRegionSlugFromElement(relatedTarget, svgCoords?.y);
        if (newSlug) return;
      }
      setHoveredRegion(null);
      onRegionHoverRef.current?.(null);
    };

    const observer = new MutationObserver(() => {
      const svgEl = findSvgInContainer();
      if (svgEl) {
        observer.disconnect();
        attachHandlers(svgEl);
      }
    });

    if (svgContainerRef.current) {
      observer.observe(svgContainerRef.current, { childList: true, subtree: true });
    }

    // Tentar encontrar o SVG em vários momentos (DOM pode não estar pronto no primeiro tick)
    const tryAttach = () => {
      const svgEl = findSvgInContainer();
      if (svgEl) {
        observer.disconnect();
        attachHandlers(svgEl);
        return true;
      }
      return false;
    };

    if (tryAttach()) return;

    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    const rafIds: number[] = [];
    const rafId = requestAnimationFrame(() => {
      if (tryAttach()) return;
      const t1 = setTimeout(() => {
        if (tryAttach()) return;
        const t2 = setTimeout(() => tryAttach(), 150);
        timeoutIds.push(t2);
      }, 50);
      timeoutIds.push(t1);
    });
    rafIds.push(rafId);

    // Função auxiliar para anexar handlers
    function attachHandlers(svgEl: SVGSVGElement) {
      
      svgElRef = svgEl;
      console.log('✅ [MSInteractiveMap] SVG encontrado no DOM, anexando handlers...');
      
      // Se já foram anexados, remover primeiro
      if (eventHandlersAttached.current) {
        console.log('⚠️ [MSInteractiveMap] Handlers já anexados, removendo e reanexando...');
        svgEl.removeEventListener('click', handleClick);
        svgEl.removeEventListener('mouseover', handleMouseOver);
        svgEl.removeEventListener('mouseout', handleMouseOut);
        eventHandlersAttached.current = false;
      }

      svgEl.setAttribute('width', '100%');
      svgEl.setAttribute('height', '100%');
      svgEl.style.maxHeight = '850px';
      svgEl.style.display = 'block'; // Garantir que está visível
      svgEl.style.visibility = 'visible'; // Garantir visibilidade
      
      console.log('✅ [MSInteractiveMap] SVG configurado:', {
        width: svgEl.getAttribute('width'),
        height: svgEl.getAttribute('height'),
        display: svgEl.style.display,
        visibility: svgEl.style.visibility,
        clientWidth: svgEl.clientWidth,
        clientHeight: svgEl.clientHeight
      });

      // Marcar grupos/paths com data-region para highlighting
      const groups = svgEl.querySelectorAll('g[fill]');
      console.log(`✅ [MSInteractiveMap] Encontrados ${groups.length} grupos com fill`);
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

      svgEl.addEventListener('click', handleClick);
      svgEl.addEventListener('mouseover', handleMouseOver);
      svgEl.addEventListener('mouseout', handleMouseOut);
      eventHandlersAttached.current = true;
      
      console.log('✅ [MSInteractiveMap] Event handlers anexados com sucesso');
    }

    return () => {
      observer.disconnect();
      rafIds.forEach(id => cancelAnimationFrame(id));
      timeoutIds.forEach(id => clearTimeout(id));
      if (svgElRef && eventHandlersAttached.current) {
        svgElRef.removeEventListener('click', handleClick);
        svgElRef.removeEventListener('mouseover', handleMouseOver);
        svgElRef.removeEventListener('mouseout', handleMouseOut);
        eventHandlersAttached.current = false;
      }
    };
  }, [svgContent, touristRegions.length, findSvgInContainer, getRegionSlugFromElement]);

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

  console.log('🔄 [MSInteractiveMap] Render - svgContent:', !!svgContent, 'isLoading:', isLoading, 'regions:', touristRegions.length);

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-full">
        {svgContent ? (
          <div
            ref={svgContainerRef}
            className="w-full h-full"
            style={{ maxHeight: '850px', minHeight: '400px' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : !isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center p-6">
              <div className="text-4xl text-gray-400 mb-3">🗺️</div>
              <p className="text-gray-600 font-medium">Erro ao carregar o mapa</p>
              <p className="text-gray-400 text-sm mt-2">O arquivo SVG não pôde ser carregado</p>
              <p className="text-gray-400 text-xs mt-1">Verifique o console para mais detalhes</p>
            </div>
          </div>
        ) : null}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-ms-primary-blue border-t-transparent mx-auto"></div>
              <p className="text-gray-600 text-sm mt-4">Carregando mapa...</p>
            </div>
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
