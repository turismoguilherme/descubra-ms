
import { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { config } from "@/config/environment";

interface UseMapboxOptions {
  style?: "map" | "satellite";
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

export const useMapbox = (options: UseMapboxOptions = {}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const {
    style = "map",
    center = [-55.0000, -20.5000], // Center of Mato Grosso do Sul
    zoom = 5,
    minZoom = 3,
    maxZoom = 20
  } = options;
  
  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    const mapboxToken = config.mapbox.getToken();
    if (!config.mapbox.isValidToken(mapboxToken)) {
      console.error("Invalid or missing Mapbox token");
      return;
    }
    
    mapboxgl.accessToken = mapboxToken;
    
    const mapStyle = style === "map" 
      ? 'mapbox://styles/mapbox/streets-v12' 
      : 'mapbox://styles/mapbox/satellite-streets-v12';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: center,
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Set loaded state when map is ready
    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map style when style changes
  useEffect(() => {
    if (!map.current) return;
    
    const mapStyle = style === "map" 
      ? 'mapbox://styles/mapbox/streets-v12' 
      : 'mapbox://styles/mapbox/satellite-streets-v12';
    
    map.current.setStyle(mapStyle);
  }, [style]);

  return { map: map.current, mapContainer, mapLoaded };
};
