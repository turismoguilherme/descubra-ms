
import mapboxgl from "mapbox-gl";
import { Region } from "@/types/tourism";
import { getRegionCoordinates, getDensityColor } from "../utils/mapUtils";

export class RegionMarkers {
  private map: mapboxgl.Map;
  private markers: mapboxgl.Marker[] = [];

  constructor(map: mapboxgl.Map) {
    this.map = map;
  }

  addMarkers(regions: Region[]) {
    if (!this.map || !regions) return;

    // Remove existing markers
    this.clearMarkers();

    regions.forEach((region, index) => {
      const coords = getRegionCoordinates(region.name, index);
      const densityColor = getDensityColor(region.density);
      
      // Create marker element exactly like in the reference image
      const el = document.createElement('div');
      el.className = 'region-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${densityColor};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        font-family: Arial, sans-serif;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        z-index: 100;
      `;
      
      // Add the number inside the circle
      el.textContent = (index + 1).toString();
      
      // Add hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)';
        el.style.zIndex = '200';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.zIndex = '100';
      });
      
      // Create popup with region information
      const getDensityText = (density: number) => {
        if (density > 0.7) return 'Alta Densidade';
        if (density > 0.4) return 'Média Densidade';
        return 'Baixa Densidade';
      };

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'region-popup'
      }).setHTML(`
        <div style="padding: 12px; min-width: 180px;">
          <h3 style="margin: 0 0 8px 0; color: ${densityColor}; font-weight: bold; font-size: 16px;">
            ${region.name}
          </h3>
          <div style="font-size: 14px; margin-bottom: 6px; color: #333;">
            <strong>${getDensityText(region.density)}</strong>
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
            Densidade: ${((region.density || 0) * 100).toFixed(0)}%
          </div>
          <div style="font-size: 12px; color: #666;">
            Visitantes: ${region.visitors?.toFixed(1) || '0.0'}%
          </div>
        </div>
      `);

      // Create and add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([coords.lng, coords.lat])
        .setPopup(popup)
        .addTo(this.map);
      
      this.markers.push(marker);
    });

    console.log(`Adicionados ${this.markers.length} marcadores coloridos no mapa`);
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }
}
