import React, { useState } from 'react';
import { touristRegions2025, TouristRegion2025 } from '@/data/touristRegions2025';

interface MSInteractiveMapProps {
  onRegionClick: (region: TouristRegion2025) => void;
  onRegionHover?: (region: TouristRegion2025 | null) => void;
  selectedRegion?: string | null;
  className?: string;
}

// Mapa do Mato Grosso do Sul - Traçado baseado no mapa oficial
// Formato: Retângulo irregular com projeção no noroeste (Pantanal)
// ViewBox calibrado para o formato real do estado

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

  const getRegionStyle = (regionId: string) => {
    const region = touristRegions2025.find(r => r.id === regionId);
    if (!region) return {};
    
    const isHovered = hoveredRegion === regionId;
    const isSelected = selectedRegion === regionId;
    const isActive = isHovered || isSelected;
    
    return {
      fill: isActive ? region.colorHover : region.color,
      opacity: selectedRegion && selectedRegion !== regionId ? 0.5 : 1,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    };
  };

  const handleRegionClick = (regionId: string) => {
    const region = touristRegions2025.find(r => r.id === regionId);
    if (region) {
      onRegionClick(region);
    }
  };

  // Cores oficiais do mapa turístico de MS
  const colors = {
    pantanal: '#FFD700',           // Amarelo
    cerradoPantanal: '#8BC34A',    // Verde claro
    costaLeste: '#F44336',         // Vermelho
    campoGrande: '#FF9800',        // Laranja
    bonito: '#E91E63',             // Rosa/Magenta
    fronteira: '#4CAF50',          // Verde
    celeiro: '#CE93D8',            // Lilás
    valeAguas: '#00BCD4',          // Ciano
    coneSul: '#9C27B0',            // Roxo
  };

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 480"
        className="w-full h-full"
        style={{ maxHeight: '580px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }}
      >
        {/* ========================================
            MAPA DE MATO GROSSO DO SUL
            Traçado baseado no mapa oficial de regionalização
            ======================================== */}

        {/* PANTANAL - Amarelo - Noroeste 
            Corumbá, Ladário, Aquidauana, Miranda, Anastácio */}
        <path
          d="M 35,75 
             L 45,55 L 65,40 L 90,30 L 115,28 L 140,32
             L 145,50 L 142,75 L 135,100 L 125,125 
             L 110,148 L 90,165 L 70,175 L 52,172 
             L 38,158 L 30,138 L 28,115 L 30,95 
             Z"
          style={getRegionStyle('pantanal')}
          stroke="#fff"
          strokeWidth="2"
          onClick={() => handleRegionClick('pantanal')}
          onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'pantanal')!)}
          onMouseLeave={handleMouseLeave}
        />

        {/* ROTA CERRADO PANTANAL - Verde claro - Norte
            Sonora, Pedro Gomes, Coxim, Costa Rica, Rio Verde, Chapadão do Sul */}
        <path
          d="M 140,32 
             L 175,28 L 215,25 L 260,25 L 305,30 L 345,42
             L 355,65 L 352,95 L 340,125 L 320,150 
             L 290,168 L 255,178 L 220,180 L 185,175 
             L 155,165 L 135,150 L 125,125 L 135,100 
             L 142,75 L 145,50 L 140,32
             Z"
          style={getRegionStyle('rota-cerrado-pantanal')}
          stroke="#fff"
          strokeWidth="2"
          onClick={() => handleRegionClick('rota-cerrado-pantanal')}
          onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'rota-cerrado-pantanal')!)}
          onMouseLeave={handleMouseLeave}
        />

        {/* COSTA LESTE - Vermelho - Leste
            Três Lagoas, Paranaíba, Cassilândia, Aparecida do Taboado, Selvíria */}
        <path
          d="M 345,42 
             L 370,55 L 388,78 L 395,108 L 392,145 
             L 382,185 L 368,220 L 350,252 L 328,278 
             L 305,295 L 285,302 L 268,295 L 258,278 
             L 260,252 L 272,222 L 290,192 L 305,168 
             L 320,150 L 340,125 L 352,95 L 355,65 
             Z"
          style={getRegionStyle('costa-leste')}
          stroke="#fff"
          strokeWidth="2"
          onClick={() => handleRegionClick('costa-leste')}
          onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'costa-leste')!)}
          onMouseLeave={handleMouseLeave}
        />

        {/* CAMPO GRANDE DOS IPÊS - Laranja - Centro
            Campo Grande, Terenos, Sidrolândia, Jaraguari, Rochedo, Corguinho, Rio Negro */}
        <path
          d="M 110,148 
             L 125,125 L 135,150 L 155,165 L 185,175 
             L 220,180 L 255,178 L 290,168 L 305,168 
             L 290,192 L 272,222 L 260,252 L 250,280 
             L 232,302 L 205,315 L 175,318 L 150,310 
             L 130,295 L 118,272 L 112,245 L 110,215 
             L 108,185 L 105,165 L 110,148
             Z"
          style={getRegionStyle('campo-grande-ipes')}
          stroke="#fff"
          strokeWidth="2"
          onClick={() => handleRegionClick('campo-grande-ipes')}
          onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'campo-grande-ipes')!)}
          onMouseLeave={handleMouseLeave}
        />

        {/* BONITO-SERRA DA BODOQUENA - Rosa/Magenta - Sudoeste
            Bonito, Jardim, Bodoquena, Nioaque, Guia Lopes, Porto Murtinho, Bela Vista */}
        <path
          d="M 52,172 
             L 70,175 L 90,165 L 110,148 L 105,165 
             L 108,185 L 110,215 L 112,245 L 118,272 
             L 115,300 L 105,330 L 88,358 L 68,378 
             L 48,385 L 32,375 L 25,352 L 22,322 
             L 25,288 L 32,252 L 40,218 L 48,188 
             L 52,172
             Z"
          style={getRegionStyle('bonito-serra-bodoquena')}
          stroke="#fff"
          strokeWidth="2"
          onClick={() => handleRegionClick('bonito-serra-bodoquena')}
          onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'bonito-serra-bodoquena')!)}
          onMouseLeave={handleMouseLeave}
        />

        {/* CAMINHOS DA FRONTEIRA - Verde - Sul/Fronteira
            Ponta Porã, Antônio João, Aral Moreira, Coronel Sapucaia, Paranhos, Amambai */}
        <path
          d="M 68,378 
             L 88,358 L 105,330 L 115,300 L 118,272 
             L 130,295 L 150,310 L 155,338 L 152,368 
             L 142,398 L 125,422 L 102,438 L 78,445 
             L 58,438 L 45,420 L 40,398 L 45,385 
             L 48,385 L 68,378
             Z"
          style={getRegionStyle('caminhos-fronteira')}
          stroke="#fff"
          strokeWidth="2"
          onClick={() => handleRegionClick('caminhos-fronteira')}
          onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'caminhos-fronteira')!)}
          onMouseLeave={handleMouseLeave}
        />

        {/* CELEIRO DO MS / GRANDE DOURADOS - Lilás - Centro-Sul
            Dourados, Maracaju, Rio Brilhante, Itaporã, Fátima do Sul, Caarapó */}
        <path
          d="M 175,318 
             L 205,315 L 232,302 L 250,280 L 258,278 
             L 268,295 L 272,322 L 268,352 L 255,382 
             L 235,408 L 210,425 L 182,432 L 158,428 
             L 155,405 L 152,375 L 152,368 L 155,338 
             L 150,310 L 175,318
             Z"
          style={getRegionStyle('celeiro-ms')}
          stroke="#fff"
          strokeWidth="2"
          onClick={() => handleRegionClick('celeiro-ms')}
          onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'celeiro-ms')!)}
          onMouseLeave={handleMouseLeave}
        />

        {/* VALE DAS ÁGUAS - Ciano - Sudeste
            Nova Andradina, Ivinhema, Batayporã, Taquarussu, Anaurilândia, Bataguassu */}
        <path
          d="M 268,295 
             L 285,302 L 305,295 L 328,278 L 350,252 
             L 358,275 L 355,308 L 342,342 L 322,372 
             L 295,395 L 268,408 L 248,405 L 255,382 
             L 268,352 L 272,322 L 268,295
             Z"
          style={getRegionStyle('vale-das-aguas')}
          stroke="#fff"
          strokeWidth="2"
          onClick={() => handleRegionClick('vale-das-aguas')}
          onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'vale-das-aguas')!)}
          onMouseLeave={handleMouseLeave}
        />

        {/* CAMINHOS DA NATUREZA-CONE SUL - Roxo - Extremo Sul
            Naviraí, Eldorado, Mundo Novo, Iguatemi, Itaquiraí, Japorã, Tacuru */}
        <path
          d="M 152,368 
             L 152,375 L 155,405 L 158,428 L 182,432 
             L 210,425 L 235,408 L 248,405 L 268,408 
             L 295,395 L 310,415 L 305,442 L 285,465 
             L 255,480 L 218,488 L 178,485 L 142,472 
             L 112,452 L 102,438 L 125,422 L 142,398 
             L 152,368
             Z"
          style={getRegionStyle('caminhos-natureza-cone-sul')}
          stroke="#fff"
          strokeWidth="2"
          onClick={() => handleRegionClick('caminhos-natureza-cone-sul')}
          onMouseEnter={() => handleMouseEnter(touristRegions2025.find(r => r.id === 'caminhos-natureza-cone-sul')!)}
          onMouseLeave={handleMouseLeave}
        />

        {/* ========== LABELS DAS REGIÕES ========== */}
        
        <text x="85" y="105" fill="#fff" fontSize="11" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          Pantanal
        </text>
        
        <text x="245" y="95" fill="#fff" fontSize="10" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          Rota Cerrado Pantanal
        </text>
        
        <text x="340" y="175" fill="#fff" fontSize="11" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          Costa Leste
        </text>
        
        <text x="195" y="235" fill="#fff" fontSize="10" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          Campo Grande
        </text>
        <text x="195" y="250" fill="#fff" fontSize="10" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          dos Ipês
        </text>
        
        <text x="72" y="285" fill="#fff" fontSize="10" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          Bonito
        </text>
        
        <text x="100" y="400" fill="#fff" fontSize="9" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          Caminhos da
        </text>
        <text x="100" y="412" fill="#fff" fontSize="9" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          Fronteira
        </text>
        
        <text x="210" y="375" fill="#fff" fontSize="11" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          Celeiro
        </text>
        
        <text x="305" y="345" fill="#fff" fontSize="11" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          Vale
        </text>
        
        <text x="210" y="455" fill="#fff" fontSize="9" fontWeight="600" textAnchor="middle" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}} className="pointer-events-none">
          Caminhos da Natureza
        </text>

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
