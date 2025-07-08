
import { HeatMapData } from "@/types/management";

// Demo data - In a real app, this would come from API
export const mockHeatMapData: Record<string, HeatMapData[]> = {
  "all": [
    { regionId: "campo-grande", density: 0.4, coordinates: { lat: -20.4640, lng: -54.6163 } },
    { regionId: "pantanal", density: 0.8, coordinates: { lat: -19.0000, lng: -56.6499 } },
    { regionId: "bonito", density: 0.9, coordinates: { lat: -21.1261, lng: -56.4822 } },
    { regionId: "caminhos-dos-ipes", density: 0.3, coordinates: { lat: -20.9040, lng: -55.1163 } },
    { regionId: "cerrado", density: 0.2, coordinates: { lat: -22.0000, lng: -54.0000 } },
  ],
  "campo-grande": [
    { regionId: "mercado-municipal", density: 0.3, coordinates: { lat: -20.4619, lng: -54.6322 } },
    { regionId: "parque-nacoes", density: 0.8, coordinates: { lat: -20.4540, lng: -54.5772 } },
    { regionId: "shopping-campo-grande", density: 0.6, coordinates: { lat: -20.4522, lng: -54.6055 } },
    { regionId: "morenao", density: 0.4, coordinates: { lat: -20.5072, lng: -54.6204 } },
  ],
  // Add more regions as needed
};
