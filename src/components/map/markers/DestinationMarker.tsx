
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
      
      // Secure DOM manipulation instead of innerHTML
      const markerPin = document.createElement('div');
      markerPin.className = 'marker-pin bg-ms-pantanal-green';
      el.appendChild(markerPin);
      
      // Secure popup content creation
      const popupContent = document.createElement('div');
      
      const title = document.createElement('h3');
      title.className = 'text-base font-semibold';
      title.textContent = destino.nome;
      
      const region = document.createElement('p');
      region.className = 'text-sm';
      region.textContent = `Região: ${destino.regiao}`;
      
      popupContent.appendChild(title);
      popupContent.appendChild(region);
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setDOMContent(popupContent);

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
