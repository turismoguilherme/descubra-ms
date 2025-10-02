import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapboxMap } from '@/components/home/map/hooks/useMapboxMap';
import { Route, Checkpoint } from '@/services/routes/tourismRouteService';

interface RouteMapProps {
  routes: Route[];
  checkpoints: Checkpoint[];
  mapboxToken: string;
  completedCheckpointIds?: string[]; // Nova prop para IDs de checkpoints concluídos
}

const RouteMap = ({
  routes,
  checkpoints,
  mapboxToken,
  completedCheckpointIds = [] // Definir valor padrão
}: RouteMapProps) => {
  const { mapContainer, map } = useMapboxMap({ mapboxToken });
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    console.log("🗺️ RouteMap: effect start", {
      hasMap: Boolean(map),
      routesCount: routes?.length,
      checkpointsCount: checkpoints?.length,
      tokenProvided: Boolean(mapboxToken)
    });

    if (!map || !routes || routes.length === 0) {
      console.warn("🟡 RouteMap: missing map or routes");
      return;
    }

    const addRouteLayers = () => {
      try {
        console.log("➕ RouteMap: adding layers and markers");
        // Remover camadas e fontes antigas para evitar duplicação
        if (map.getSource('routes')) {
          console.log("♻️ RouteMap: removing old routes source/layer");
          map.removeLayer('routes-line');
          map.removeSource('routes');
        }
        if (map.getSource('checkpoints')) {
          console.log("♻️ RouteMap: removing old checkpoints source/layer");
          map.removeLayer('checkpoints-circle');
          map.removeSource('checkpoints');
        }
        
        // Remover marcadores antigos
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Adicionar fonte e camada para as rotas (linhas)
        const geojsonRoutes = {
          type: 'FeatureCollection',
          features: routes.map(route => ({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: checkpoints
                .filter(cp => cp.route_id === route.id) // Apenas checkpoints desta rota
                .sort((a, b) => a.order - b.order) // Ordenar por ordem
                .map(cp => [cp.longitude, cp.latitude]) // [longitude, latitude]
            },
            properties: {
              name: route.name,
              description: route.description,
              id: route.id,
            },
          })),
        };

        console.log("🧱 RouteMap: geojsonRoutes", geojsonRoutes);

        map.addSource('routes', {
          type: 'geojson',
          data: geojsonRoutes as any, // Mapbox typings can be strict here
        });

        map.addLayer({
          id: 'routes-line',
          type: 'line',
          source: 'routes',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#888',
            'line-width': 6,
            'line-opacity': 0.7,
          },
        });

        // Adicionar marcadores para cada checkpoint
        checkpoints.forEach(cp => {
          const el = document.createElement('div');
          el.className = 'mapbox-marker';
          
          // Verificar se o checkpoint foi concluído
          const isCompleted = completedCheckpointIds.includes(cp.id);

          if (isCompleted) {
            el.classList.add('mapbox-marker-completed');
          }

          // Opcional: usar stamp_image_url para o ícone do marcador
          if (cp.stamp_image_url) {
            const img = document.createElement('img');
            img.src = cp.stamp_image_url;
            img.style.width = '30px'; // Ajuste o tamanho conforme necessário
            img.style.height = '30px';
            img.style.borderRadius = '50%';
            img.style.border = '2px solid white';
            el.appendChild(img);
          } else {
            el.innerHTML = '📍'; // Ícone padrão se não houver imagem
          }
          
          const marker = new mapboxgl.Marker(el)
            .setLngLat([cp.longitude, cp.latitude])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${cp.name}</h3><p>${cp.description || ''}</p>`))
            .addTo(map);
          
          markersRef.current.push(marker);
        });

        // Ajustar o zoom para a primeira rota, se houver
        if (routes.length > 0 && checkpoints.length > 0) {
          const firstRouteCheckpoints = checkpoints.filter(cp => cp.route_id === routes[0].id);
          if (firstRouteCheckpoints.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            firstRouteCheckpoints.forEach(cp => bounds.extend([cp.longitude, cp.latitude]));
            console.log("🔎 RouteMap: fitting bounds", firstRouteCheckpoints.length);
            map.fitBounds(bounds, { padding: 50, duration: 0 });
          }
        }
      } catch (err) {
        console.error("❌ RouteMap: error adding layers/markers", err);
      }
    };

    if (map.isStyleLoaded()) {
      addRouteLayers();
    } else {
      map.on('load', addRouteLayers);
    }

    return () => {
      try {
        if (map) {
          if (map.getSource('routes')) {
            map.removeLayer('routes-line');
            map.removeSource('routes');
          }
          if (map.getSource('checkpoints')) {
            map.removeLayer('checkpoints-circle');
            map.removeSource('checkpoints');
          }
          markersRef.current.forEach(marker => marker.remove());
          markersRef.current = [];
        }
      } catch (err) {
        console.error("❌ RouteMap: cleanup error", err);
      }
    };
  }, [map, routes, checkpoints, completedCheckpointIds, mapboxToken]);

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full min-h-[500px]"></div>
      {routes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-xl backdrop-blur-sm">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl text-gray-300 mb-3">🗺️</div>
            <p className="text-gray-600 font-medium">Nenhuma rota disponível para exibição</p>
            <p className="text-gray-400 text-sm mt-2">Cadastre rotas na área administrativa.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap; 