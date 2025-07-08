
import React from "react";
import mapboxgl from "mapbox-gl";

interface Destination {
  id: number;
  nome: string;
  regiao: string;
  lat: number;
  lng: number;
}

interface DestinationMarkerProps {
  map: mapboxgl.Map | null;
  destinations: Destination[];
}

const DestinationMarker = ({ map, destinations }: DestinationMarkerProps) => {
  React.useEffect(() => {
    if (!map) return;

    const markers: mapboxgl.Marker[] = [];

    // Add destination markers
    destinations.forEach(destino => {
      const el = document.createElement('div');
      el.className = 'custom-marker destination-marker';
      el.innerHTML = `<div class="marker-pin bg-ms-pantanal-green"></div>`;
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h3 class="text-base font-semibold">${destino.nome}</h3>
                  <p class="text-sm">Região: ${destino.regiao}</p>`);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([destino.lng, destino.lat])
        .setPopup(popup)
        .addTo(map);
      
      markers.push(marker);
    });

    return () => {
      // Clean up markers when component unmounts or dependencies change
      markers.forEach(marker => marker.remove());
    };
  }, [map, destinations]);

  return null; // This component doesn't render anything visible
};

export default DestinationMarker;
