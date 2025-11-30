import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { RouteExtended, RouteCheckpointExtended, StampProgress } from '@/types/passportDigital';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface PassportMapProps {
  route: RouteExtended;
  checkpoints: RouteCheckpointExtended[];
  progress?: StampProgress | null;
}

const PassportMap: React.FC<PassportMapProps> = ({ route, checkpoints, progress }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Inicializar mapa (usar token do Mapbox se disponível)
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      console.warn('VITE_MAPBOX_TOKEN não configurado. O mapa pode não funcionar corretamente.');
      return; // Não inicializar mapa sem token
    }
    
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: checkpoints[0]?.longitude && checkpoints[0]?.latitude
        ? [checkpoints[0].longitude, checkpoints[0].latitude]
        : [-57.65, -20.45], // Centro de MS
      zoom: 10,
    });

    // Adicionar controles
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Limpar markers anteriores
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Criar set de checkpoints visitados
    const visitedCheckpointIds = new Set(
      progress?.fragments
        .filter(f => f.collected)
        .map(f => f.checkpoint_id) || []
    );

    // Adicionar markers para cada checkpoint
    checkpoints.forEach((checkpoint, index) => {
      if (!checkpoint.latitude || !checkpoint.longitude) return;

      const isVisited = visitedCheckpointIds.has(checkpoint.id);
      const isFirst = index === 0;
      const isLast = index === checkpoints.length - 1;

      // Cor do marker baseado no status
      let color = '#6b7280'; // Cinza para não visitado
      if (isVisited) color = '#10b981'; // Verde para visitado
      if (isFirst) color = '#3b82f6'; // Azul para início
      if (isLast) color = '#8b5cf6'; // Roxo para fim

      // Criar elemento HTML para o marker
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontWeight = 'bold';
      el.style.color = 'white';
      el.style.fontSize = '14px';
      el.textContent = (index + 1).toString();

      // Criar marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([checkpoint.longitude, checkpoint.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-semibold">${checkpoint.name}</h3>
              ${checkpoint.description ? `<p class="text-sm text-muted-foreground">${checkpoint.description}</p>` : ''}
              ${isVisited ? '<span class="text-green-600 text-xs">✓ Visitado</span>' : ''}
            </div>`
          )
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Adicionar linha conectando os checkpoints
    if (checkpoints.length > 1) {
      const coordinates = checkpoints
        .filter(cp => cp.latitude && cp.longitude)
        .map(cp => [cp.longitude!, cp.latitude!] as [number, number]);

      if (coordinates.length > 1) {
        map.current.on('load', () => {
          if (map.current?.getSource('route-line')) {
            (map.current.getSource('route-line') as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates,
              },
            });
          } else {
            map.current?.addSource('route-line', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates,
                },
              },
            });

            map.current?.addLayer({
              id: 'route-line',
              type: 'line',
              source: 'route-line',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 3,
                'line-opacity': 0.6,
              },
            });
          }
        });
      }
    }

    // Ajustar bounds para mostrar todos os checkpoints
    if (checkpoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      checkpoints.forEach(cp => {
        if (cp.latitude && cp.longitude) {
          bounds.extend([cp.longitude, cp.latitude]);
        }
      });
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });
      }
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [checkpoints, progress]);

  return (
    <Card>
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
      </CardContent>
    </Card>
  );
};

export default PassportMap;

