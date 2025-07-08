
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { HeatMapData } from "@/types/management";

// Temporary access token - in production, use environment variables
const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsc3o0YWsybjBlcngya3FsNm8xeHdpZXEifQ.SfhLzB9S6xrM9svYfGxmhg";

interface HeatMapVisualizationProps {
  heatMapData: HeatMapData[];
  region: string;
}

const HeatMapVisualization = ({ heatMapData, region }: HeatMapVisualizationProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // Set map center based on region
  const getMapCenter = (): [number, number] => {
    if (region === "campo-grande") {
      return [-54.6163, -20.4640];
    } else if (region === "pantanal") {
      return [-56.6499, -19.0000];
    } else if (region === "bonito") {
      return [-56.4822, -21.1261];
    } else {
      return [-55.0000, -20.5000]; // Center of MS state
    }
  };
  
  // Set zoom level based on region
  const getMapZoom = () => {
    if (region === "all") {
      return 5;
    } else {
      return 10;
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize map if it doesn't exist
    if (!map.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: getMapCenter(),
        zoom: getMapZoom(),
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } else {
      // Update existing map
      map.current.flyTo({
        center: getMapCenter(),
        zoom: getMapZoom(),
        essential: true,
      });
    }
    
    // Wait for map to load before adding data
    const loadHeatMapData = () => {
      if (!map.current) return;
      
      // Remove existing markers
      document.querySelectorAll('.mapboxgl-marker').forEach(el => el.remove());
      
      // Add markers for each data point
      heatMapData.forEach((item) => {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'heatmap-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        
        // Set color based on density
        if (item.density > 0.7) {
          el.style.backgroundColor = '#2E7D32'; // green
        } else if (item.density > 0.4) {
          el.style.backgroundColor = '#FFC107'; // yellow
        } else {
          el.style.backgroundColor = '#D32F2F'; // red
        }
        
        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <h3 class="font-medium text-base">${item.regionId}</h3>
            <p class="text-sm">Densidade: ${Math.round(item.density * 100)}%</p>
          `);
        
        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat([item.coordinates.lng, item.coordinates.lat])
          .setPopup(popup)
          .addTo(map.current!);
      });
      
      // Attempt to add heatmap layer if possible
      try {
        if (map.current.getSource('heatmap-source')) {
          map.current.removeSource('heatmap-source');
        }
        
        if (map.current.getLayer('heatmap-layer')) {
          map.current.removeLayer('heatmap-layer');
        }
        
        // Add heatmap data source
        map.current.addSource('heatmap-source', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': heatMapData.map(item => ({
              'type': 'Feature',
              'properties': {
                'density': item.density,
                'regionId': item.regionId
              },
              'geometry': {
                'type': 'Point',
                'coordinates': [item.coordinates.lng, item.coordinates.lat]
              }
            }))
          }
        });
        
        // Add heatmap layer
        map.current.addLayer({
          'id': 'heatmap-layer',
          'type': 'heatmap',
          'source': 'heatmap-source',
          'paint': {
            'heatmap-weight': ['get', 'density'],
            'heatmap-intensity': 1,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.2, 'rgba(0, 0, 255, 0.5)',
              0.4, 'rgba(255, 255, 0, 0.5)',
              0.6, 'rgba(255, 165, 0, 0.5)',
              0.8, 'rgba(255, 0, 0, 0.5)',
              1, 'rgba(255, 0, 0, 1)'
            ],
            'heatmap-radius': 20,
            'heatmap-opacity': 0.7
          }
        }, 'waterway-label');
      } catch (error) {
        console.log('Error adding heatmap:', error);
        // Continue without heatmap if there's an error
      }
    };
    
    if (map.current.loaded()) {
      loadHeatMapData();
    } else {
      map.current.on('load', loadHeatMapData);
    }
    
    // Cleanup function
    return () => {
      // We don't remove the map on every effect cleanup
      // because that would create a new map on every region change
      // Instead, we'll just update the existing map
    };
  }, [region, heatMapData]);

  return (
    <div className="border rounded-lg h-96 overflow-hidden bg-gray-50">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default HeatMapVisualization;
