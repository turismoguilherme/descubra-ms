
import { useEffect } from "react";
import { Region } from "@/types/tourism";
import MapboxTokenInput from "./MapboxTokenInput";
import MapStyles from "./components/MapStyles";
import { useMapboxMap } from "./hooks/useMapboxMap";
import { RegionMarkers } from "./components/RegionMarkers";

interface RegionMapProps {
  regions: Region[];
  mapboxToken: string;
  onTokenSubmit: (token: string) => void;
  mapError: boolean;
}

const RegionMap = ({ regions, mapboxToken, onTokenSubmit, mapError }: RegionMapProps) => {
  const { mapContainer, map } = useMapboxMap({ mapboxToken });

  useEffect(() => {
    if (!map || !regions || regions.length === 0) return;

    const handleMapLoad = () => {
      console.log("Mapa carregado, adicionando marcadores coloridos");
      
      // Initialize markers
      const regionMarkers = new RegionMarkers(map);
      
      // Add markers
      regionMarkers.addMarkers(regions);
    };

    if (map.isStyleLoaded()) {
      handleMapLoad();
    } else {
      map.on('load', handleMapLoad);
    }

    return () => {
      map.off('load', handleMapLoad);
    };
  }, [map, regions]);
  
  if (mapError || !mapboxToken) {
    return (
      <div className="relative bg-gray-100 rounded-xl border border-gray-200 shadow-lg overflow-hidden min-h-[500px]">
        <MapboxTokenInput mapboxToken={mapboxToken} onTokenSubmit={onTokenSubmit} />
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full min-h-[500px]"></div>
      {regions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-xl backdrop-blur-sm">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl text-gray-300 mb-3">🗺️</div>
            <p className="text-gray-600 font-medium">Nenhuma região disponível para exibição</p>
            <p className="text-gray-400 text-sm mt-2">Verifique sua conexão e tente novamente</p>
          </div>
        </div>
      )}
      <MapStyles />
    </div>
  );
};

export default RegionMap;
