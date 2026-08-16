
import React from "react";
import mapboxgl from "mapbox-gl";

interface CAT {
  id: number;
  nome: string;
  endereco: string;
  horario: string;
  coordenadas: { lat: number; lng: number };
  cidade: string;
  regiao: string;
}

interface CATMarkerProps {
  map: mapboxgl.Map | null;
  cats: CAT[];
}

const CATMarker = ({ map, cats }: CATMarkerProps) => {
  React.useEffect(() => {
    if (!map) return;

    const markers: mapboxgl.Marker[] = [];

    // Add CAT markers
    cats.forEach(cat => {
      const el = document.createElement('div');
      el.className = 'custom-marker cat-marker';
      
      // Secure DOM manipulation instead of innerHTML
      const markerPin = document.createElement('div');
      markerPin.className = 'marker-pin bg-ms-secondary-yellow';
      el.appendChild(markerPin);
      
      // Secure popup content creation
      const popupContent = document.createElement('div');
      
      const title = document.createElement('h3');
      title.className = 'text-base font-semibold';
      title.textContent = cat.nome;
      
      const address = document.createElement('p');
      address.className = 'text-sm';
      address.textContent = cat.endereco;
      
      const schedule = document.createElement('p');
      schedule.className = 'text-sm';
      schedule.textContent = cat.horario;
      
      popupContent.appendChild(title);
      popupContent.appendChild(address);
      popupContent.appendChild(schedule);
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setDOMContent(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([cat.coordenadas.lng, cat.coordenadas.lat])
        .setPopup(popup)
        .addTo(map);
      
      markers.push(marker);
    });

    return () => {
      // Clean up markers when component unmounts or dependencies change
      markers.forEach(marker => marker.remove());
    };
  }, [map, cats]);

  return null; // This component doesn't render anything visible
};

export default CATMarker;
