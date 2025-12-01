import React, { useState } from 'react';
import { touristRegions2025, TouristRegion2025 } from '@/data/touristRegions2025';

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null;
  className?: string;
}

// Mapa interativo usando SVG real de MS com áreas clicáveis
// ViewBox do SVG: 0 0 896 1152
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

  // Estilo para destacar região ao hover - borda branca brilhante
  const getOverlayStyle = (regionId: string) => {
    const isHovered = hoveredRegion === regionId;
    const isSelected = selectedRegion === regionId;
    const isActive = isHovered || isSelected;
    
    return {
      fill: 'transparent',
      stroke: isActive ? '#fff' : 'transparent',
      strokeWidth: isActive ? 4 : 0,
      cursor: 'pointer',
      filter: isActive ? 'drop-shadow(0 0 12px rgba(255,255,255,0.95))' : 'none',
      transition: 'all 0.2s ease',
    };
  };

  // Coordenadas das 9 regiões ajustadas para viewBox 896x1152
  // Baseadas na posição geográfica real de cada região no mapa
  const regionPaths: Record<string, string> = {
    // PANTANAL - Noroeste (amarelo) - Corumbá, Ladário, Aquidauana, Miranda
    "pantanal": `M 150,200 
      C 140,180 135,160 140,140
      C 145,120 160,110 180,105
      C 200,100 220,105 240,115
      C 260,125 275,145 280,170
      C 285,195 280,220 270,245
      C 260,270 240,290 220,300
      C 200,310 180,305 170,290
      C 160,275 155,255 160,235
      C 165,215 175,200 190,190
      Z`,
    
    // ROTA CERRADO PANTANAL - Norte (verde claro) - Sonora, Coxim, Costa Rica
    "rota-cerrado-pantanal": `M 240,115 
      C 280,100 340,90 400,85
      C 460,80 520,90 570,110
      C 620,130 650,160 660,200
      C 670,240 660,280 630,310
      C 600,340 550,360 490,365
      C 430,370 370,360 320,340
      C 270,320 240,290 230,255
      C 220,220 230,190 250,165
      C 270,140 300,125 330,120
      Z`,
    
    // COSTA LESTE - Leste (vermelho) - Três Lagoas, Paranaíba, Cassilândia
    "costa-leste": `M 660,200 
      C 700,220 730,260 740,310
      C 750,360 745,410 720,455
      C 695,500 655,535 605,560
      C 555,585 500,600 450,605
      C 400,610 355,600 320,575
      C 285,550 270,515 280,480
      C 290,445 320,415 360,395
      C 400,375 450,365 500,365
      C 550,365 590,380 620,410
      C 650,440 670,480 660,520
      C 650,560 620,590 580,610
      Z`,
    
    // CAMPO GRANDE DOS IPÊS - Centro (laranja) - Campo Grande, Terenos, Sidrolândia
    "campo-grande-ipes": `M 280,170 
      C 290,200 300,230 320,260
      C 340,290 370,315 410,330
      C 450,345 495,350 540,345
      C 585,340 625,325 655,300
      C 685,275 700,240 695,205
      C 690,170 670,140 640,120
      C 610,100 570,95 530,100
      C 490,105 450,120 420,145
      C 390,170 370,205 360,240
      C 350,275 355,310 375,340
      C 395,370 430,390 470,400
      C 510,410 550,405 585,385
      C 620,365 645,335 655,300
      C 665,265 655,230 630,205
      C 605,180 570,170 535,175
      C 500,180 470,195 450,220
      C 430,245 425,275 435,305
      C 445,335 470,355 500,360
      Z`,
    
    // BONITO-SERRA DA BODOQUENA - Sudoeste (rosa/roxo) - Bonito, Jardim, Bodoquena
    "bonito-serra-bodoquena": `M 170,290 
      C 160,320 150,350 145,380
      C 140,410 140,440 150,470
      C 160,500 180,525 210,545
      C 240,565 280,575 320,570
      C 360,565 395,545 420,515
      C 445,485 460,445 455,405
      C 450,365 425,330 390,305
      C 355,280 310,270 270,275
      C 230,280 200,295 180,320
      C 160,345 150,375 155,405
      C 160,435 175,460 200,480
      Z`,
    
    // CAMINHOS DA FRONTEIRA - Sul (verde) - Ponta Porã, Antônio João
    "caminhos-fronteira": `M 200,480 
      C 220,510 240,535 270,550
      C 300,565 335,570 370,560
      C 405,550 435,530 455,505
      C 475,480 485,450 480,420
      C 475,390 455,365 425,350
      C 395,335 360,335 330,345
      C 300,355 275,375 260,400
      C 245,425 240,455 250,485
      Z`,
    
    // CELEIRO DO MS - Centro-Sul (lilás) - Dourados, Maracaju
    "celeiro-ms": `M 435,305 
      C 460,335 480,365 490,400
      C 500,435 495,470 475,500
      C 455,530 420,550 380,560
      C 340,570 295,565 260,550
      C 225,535 200,510 190,480
      C 180,450 185,420 205,395
      C 225,370 260,355 300,350
      C 340,345 380,350 415,365
      C 450,380 475,405 485,435
      Z`,
    
    // VALE DAS ÁGUAS - Sudeste (ciano) - Nova Andradina, Ivinhema
    "vale-das-aguas": `M 580,610 
      C 610,640 630,675 635,715
      C 640,755 630,795 605,830
      C 580,865 540,890 495,905
      C 450,920 400,925 355,915
      C 310,905 275,880 255,845
      C 235,810 235,770 255,735
      C 275,700 310,675 355,660
      C 400,645 450,640 495,650
      C 540,660 575,680 595,710
      Z`,
    
    // CAMINHOS DA NATUREZA-CONE SUL - Extremo Sul (roxo) - Naviraí, Eldorado
    "caminhos-natureza-cone-sul": `M 480,420 
      C 500,450 510,485 505,520
      C 500,555 480,585 450,610
      C 420,635 380,650 335,655
      C 290,660 245,650 210,630
      C 175,610 150,580 140,545
      C 130,510 135,475 155,445
      C 175,415 210,395 250,385
      C 290,375 335,375 375,385
      C 415,395 450,415 475,445
      Z`
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
          style={{ maxHeight: '600px' }}
        />

        {/* SVG overlay com áreas clicáveis */}
        {svgLoaded && (
          <svg
            viewBox="0 0 896 1152"
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
