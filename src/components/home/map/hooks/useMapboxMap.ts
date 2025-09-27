
import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

interface UseMapboxMapProps {
  mapboxToken: string;
  center?: [number, number];
  zoom?: number;
}

export const useMapboxMap = ({ mapboxToken, center = [-55.0000, -20.5000], zoom = 6 }: UseMapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    console.log("🧭 useMapboxMap: effect", { hasContainer: Boolean(mapContainer.current), hasMap: Boolean(map.current), hasToken: Boolean(mapboxToken) });
    if (!mapContainer.current || map.current || !mapboxToken) return;
    
    try {
      console.log("🗺️ useMapboxMap: initializing map");
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center,
        zoom,
        interactive: true,
        attributionControl: true
      });
      
      // Add navigation controls
      const nav = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false
      });
      map.current.addControl(nav, 'top-right');
      
      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      
      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }), 'bottom-left');
      
      map.current.on('error', (e) => {
        console.error("❌ useMapboxMap: map error", e);
      });
      
      map.current.on('load', () => {
        console.log("✅ useMapboxMap: map loaded");
      });
      
    } catch (error) {
      console.error("❌ useMapboxMap: initialization error", error);
    }
    
    return () => {
      try {
        if (map.current) {
          console.log("🧹 useMapboxMap: removing map instance");
          map.current.remove();
          map.current = null;
        }
      } catch (e) {
        console.error("❌ useMapboxMap: cleanup error", e);
      }
    };
  }, [mapboxToken, center, zoom]);

  return { mapContainer, map: map.current };
};
