import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface InteractiveMapPickerProps {
  latitude: number;
  longitude: number;
  radius?: number; // Raio de geofence em metros
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange?: (radius: number) => void;
  height?: string;
}

// Componente para atualizar o centro do mapa quando a posição muda
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  
  return null;
}

const InteractiveMapPicker: React.FC<InteractiveMapPickerProps> = ({
  latitude,
  longitude,
  radius = 100,
  onLocationChange,
  onRadiusChange,
  height = '400px',
}) => {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);
  const [currentRadius, setCurrentRadius] = useState(radius);
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  useEffect(() => {
    setCurrentRadius(radius);
  }, [radius]);

  const eventHandlers = {
    dragend: () => {
      const marker = markerRef.current;
      if (marker) {
        const newPos = marker.getLatLng();
        const newPosition: [number, number] = [newPos.lat, newPos.lng];
        setPosition(newPosition);
        onLocationChange(newPos.lat, newPos.lng);
      }
    },
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg" style={{ height }}>
      <MapContainer
        center={position}
        zoom={17}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater lat={position[0]} lng={position[1]} />
        
        {/* Marcador arrastável */}
        <Marker
          position={position}
          draggable={true}
          ref={markerRef}
          eventHandlers={eventHandlers}
        />
        
        {/* Círculo do raio de geofence */}
        <Circle
          center={position}
          radius={currentRadius}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            weight: 2,
          }}
        />
      </MapContainer>
      
      {/* Overlay com informações */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000] border border-gray-200">
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-blue-600" />
            <span className="font-semibold text-gray-700">Localização</span>
          </div>
          <div className="font-mono text-gray-600">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
          <div className="text-gray-500 mt-2">
            Raio: <span className="font-semibold text-blue-600">{currentRadius}m</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            💡 Arraste o marcador para ajustar
          </div>
        </div>
      </div>
      
      {/* Controle de raio */}
      {onRadiusChange && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000] border border-gray-200">
          <label className="text-xs font-semibold text-gray-700 block mb-2">
            Raio de Geofence: {currentRadius}m
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={currentRadius}
            onChange={(e) => {
              const newRadius = parseInt(e.target.value);
              setCurrentRadius(newRadius);
              onRadiusChange(newRadius);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50m</span>
            <span>250m</span>
            <span>500m</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMapPicker;

