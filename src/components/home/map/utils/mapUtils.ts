
import { Region } from "@/types/tourism";

export const getRegionCoordinates = (regionName: string, index: number) => {
  const regionCoordinates: Record<string, { lat: number; lng: number }> = {
    "Pantanal": { lat: -18.5, lng: -56.5 },
    "Bonito": { lat: -21.1268, lng: -56.4844 },
    "Bonito/Serra da Bodoquena": { lat: -21.1268, lng: -56.4844 },
    "Campo Grande": { lat: -20.4695, lng: -54.6201 },
    "Campo Grande e Região": { lat: -20.4695, lng: -54.6201 },
    "Corumbá": { lat: -19.0094, lng: -57.6534 },
    "Costa Leste": { lat: -20.7849, lng: -51.7007 },
    "Caminhos da Fronteira": { lat: -22.5296, lng: -55.7203 },
    "Grande Dourados": { lat: -22.2230, lng: -54.8120 },
    "Cerrado Pantanal": { lat: -21.7, lng: -55.5 },
    "Cone Sul": { lat: -22.8, lng: -54.5 },
    "Caminho dos Ipês": { lat: -20.5, lng: -54.4 }
  };
  
  return regionCoordinates[regionName] || {
    lat: -20.5000 + (index * 0.3) - 1,
    lng: -55.0000 + (index * 0.5) - 2
  };
};

// Cores exatas da imagem de referência
export const getDensityColor = (density: number): string => {
  if (density > 0.7) return '#2E7D32'; // Verde escuro (alta densidade)
  if (density > 0.4) return '#FF8F00'; // Laranja (média densidade)  
  return '#D32F2F'; // Vermelho (baixa densidade)
};

export const getDensityLabel = (density: number): string => {
  if (density > 0.7) return '🟢 Alta densidade turística';
  if (density > 0.4) return '🟡 Média densidade turística';
  return '🔴 Baixa densidade turística';
};

export const createGeoJSONData = (regions: Region[]) => {
  return {
    type: 'FeatureCollection' as const,
    features: regions.map((region, index) => {
      const coords = getRegionCoordinates(region.name, index);
      return {
        type: 'Feature' as const,
        properties: {
          density: region.density,
          weight: region.density * 100,
          color: getDensityColor(region.density)
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [coords.lng, coords.lat]
        }
      };
    })
  };
};
