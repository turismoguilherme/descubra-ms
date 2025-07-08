
import mapboxgl from "mapbox-gl";
import { Region } from "@/types/tourism";
import { createGeoJSONData } from "../utils/mapUtils";

export class HeatmapLayer {
  private map: mapboxgl.Map;

  constructor(map: mapboxgl.Map) {
    this.map = map;
  }

  addHeatmapLayer(regions: Region[]) {
    if (!this.map) return;
    
    try {
      // Remove existing heatmap if it exists
      if (this.map.getLayer('heatmap-layer')) {
        this.map.removeLayer('heatmap-layer');
      }
      if (this.map.getSource('heatmap-source')) {
        this.map.removeSource('heatmap-source');
      }
      
      const heatmapData = createGeoJSONData(regions);
      
      // Add source
      this.map.addSource('heatmap-source', {
        type: 'geojson',
        data: heatmapData
      });
      
      // Add heatmap layer with cores muito mais vibrantes e coloridas
      this.map.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap-source',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'weight'],
            0, 0,
            100, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            9, 4
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.1, 'rgba(255, 0, 255, 0.8)',     // Magenta vibrante
            0.2, 'rgba(0, 255, 255, 0.8)',     // Ciano brilhante
            0.3, 'rgba(0, 255, 0, 0.9)',       // Verde neon
            0.4, 'rgba(255, 255, 0, 0.9)',     // Amarelo brilhante
            0.6, 'rgba(255, 165, 0, 1)',       // Laranja vibrante
            0.8, 'rgba(255, 69, 0, 1)',        // Vermelho laranja
            1, 'rgba(255, 0, 0, 1)'            // Vermelho intenso
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 35,
            9, 70
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            9, 0.8
          ]
        }
      }, 'waterway-label');
      
      console.log("Heatmap layer super colorido adicionado com sucesso");
    } catch (error) {
      console.log("Erro ao adicionar heatmap layer:", error);
    }
  }
}
