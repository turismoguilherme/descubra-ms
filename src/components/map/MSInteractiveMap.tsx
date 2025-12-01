import React, { useState } from 'react';
import { touristRegions2025, TouristRegion2025 } from '@/data/touristRegions2025';

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null;
  className?: string;
}

// Mapa interativo usando SVG real de MS com áreas clicáveis
// ViewBox do SVG: 0 0 1176 1201
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

  const handleRegionClick = (regionId: string) => {
    const region = touristRegions2025.find(r => r.id === regionId);
    if (region) {
      onRegionClick(region);
    }
  };

  // Estilo para destacar região ao hover - apenas borda branca brilhante
  const getOverlayStyle = (regionId: string) => {
    const isHovered = hoveredRegion === regionId;
    const isSelected = selectedRegion === regionId;
    const isActive = isHovered || isSelected;
    
    return {
      fill: 'transparent',
      stroke: isActive ? '#fff' : 'transparent',
      strokeWidth: isActive ? 4 : 0,
      cursor: 'pointer',
      filter: isActive ? 'drop-shadow(0 0 10px rgba(255,255,255,0.9))' : 'none',
      transition: 'all 0.2s ease',
    };
  };

  // Coordenadas das regiões baseadas no viewBox 1176x1201
  // Ajustadas para cobrir as áreas coloridas do mapa
  const regionPaths: Record<string, string> = {
    // PANTANAL - Noroeste (amarelo)
    "pantanal": `M 200,300 
      C 180,280 160,260 150,240
      C 140,220 135,200 140,180
      C 145,160 160,150 180,145
      C 200,140 220,145 240,155
      C 260,165 275,185 280,210
      C 285,235 280,260 270,285
      C 260,310 240,330 220,340
      C 200,350 180,345 170,330
      C 160,315 155,295 160,275
      C 165,255 175,240 190,230
      Z`,
    
    // ROTA CERRADO PANTANAL - Norte (verde claro)
    "rota-cerrado-pantanal": `M 240,155 
      C 280,140 340,130 400,125
      C 460,120 520,130 570,150
      C 620,170 650,200 660,240
      C 670,280 660,320 630,350
      C 600,380 550,400 490,405
      C 430,410 370,400 320,380
      C 270,360 240,330 230,295
      C 220,260 230,230 250,205
      C 270,180 300,165 330,160
      Z`,
    
    // COSTA LESTE - Leste (vermelho)
    "costa-leste": `M 660,240 
      C 700,260 730,300 740,350
      C 750,400 745,450 720,495
      C 695,540 655,575 605,600
      C 555,625 500,640 450,645
      C 400,650 355,640 320,615
      C 285,590 270,555 280,520
      C 290,485 320,455 360,435
      C 400,415 450,405 500,405
      C 550,405 590,420 620,450
      C 650,480 670,520 660,560
      C 650,600 620,630 580,650
      Z`,
    
    // CAMPO GRANDE DOS IPÊS - Centro (laranja)
    "campo-grande-ipes": `M 280,210 
      C 290,240 300,270 320,300
      C 340,330 370,355 410,370
      C 450,385 495,390 540,385
      C 585,380 625,365 655,340
      C 685,315 700,280 695,245
      C 690,210 670,180 640,160
      C 610,140 570,135 530,140
      C 490,145 450,160 420,185
      C 390,210 370,245 360,280
      C 350,315 355,350 375,380
      C 395,410 430,430 470,440
      C 510,450 550,445 585,425
      C 620,405 645,375 655,340
      C 665,305 655,270 630,245
      C 605,220 570,210 535,215
      C 500,220 470,235 450,260
      C 430,285 425,315 435,345
      C 445,375 470,395 500,400
      Z`,
    
    // BONITO-SERRA DA BODOQUENA - Sudoeste (rosa/roxo)
    "bonito-serra-bodoquena": `M 170,330 
      C 160,360 150,390 145,420
      C 140,450 140,480 150,510
      C 160,540 180,565 210,585
      C 240,605 280,615 320,610
      C 360,605 395,585 420,555
      C 445,525 460,485 455,445
      C 450,405 425,370 390,345
      C 355,320 310,310 270,315
      C 230,320 200,335 180,360
      C 160,385 150,415 155,445
      C 160,475 175,500 200,520
      Z`,
    
    // CAMINHOS DA FRONTEIRA - Sul (verde)
    "caminhos-fronteira": `M 200,520 
      C 220,550 240,575 270,590
      C 300,605 335,610 370,600
      C 405,590 435,570 455,545
      C 475,520 485,490 480,460
      C 475,430 455,405 425,390
      C 395,375 360,375 330,385
      C 300,395 275,415 260,440
      C 245,465 240,495 250,525
      Z`,
    
    // CELEIRO DO MS - Centro-Sul (lilás)
    "celeiro-ms": `M 435,345 
      C 460,375 480,405 490,440
      C 500,475 495,510 475,540
      C 455,570 420,590 380,600
      C 340,610 295,605 260,590
      C 225,575 200,550 190,520
      C 180,490 185,460 205,435
      C 225,410 260,395 300,390
      C 340,385 380,390 415,405
      C 450,420 475,445 485,475
      Z`,
    
    // VALE DAS ÁGUAS - Sudeste (ciano)
    "vale-das-aguas": `M 580,650 
      C 610,680 630,715 635,755
      C 640,795 630,835 605,870
      C 580,905 540,930 495,945
      C 450,960 400,965 355,955
      C 310,945 275,920 255,885
      C 235,850 235,810 255,775
      C 275,740 310,715 355,700
      C 400,685 450,680 495,690
      C 540,700 575,720 595,750
      Z`,
    
    // CAMINHOS DA NATUREZA-CONE SUL - Extremo Sul (roxo)
    "caminhos-natureza-cone-sul": `M 480,460 
      C 500,490 510,525 505,560
      C 500,595 480,625 450,650
      C 420,675 380,690 335,695
      C 290,700 245,690 210,670
      C 175,650 150,620 140,585
      C 130,550 135,515 155,485
      C 175,455 210,435 250,425
      C 290,415 335,415 375,425
      C 415,435 450,455 475,485
      Z`
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-full">
        {/* SVG do mapa real de MS */}
        <img
          src="/images/mapa-ms-regioes.svg"
          alt="Mapa de Mato Grosso do Sul"
          className="w-full h-full object-contain"
          onLoad={() => setSvgLoaded(true)}
          style={{ maxHeight: '600px' }}
        />

        {/* SVG overlay com áreas clicáveis */}
        {svgLoaded && (
          <svg
            viewBox="0 0 1176 1201"
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="xMidYMid meet"
            style={{ maxHeight: '600px' }}
          >
            {/* Áreas clicáveis para cada região */}
            {touristRegions2025.map((region) => (
              <path
                key={region.id}
                d={regionPaths[region.id]}
                style={{ ...getOverlayStyle(region.id), pointerEvents: 'all' }}
                onClick={() => handleRegionClick(region.id)}
                onMouseEnter={() => handleMouseEnter(region)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
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
