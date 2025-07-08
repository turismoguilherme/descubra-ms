
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
      el.innerHTML = `<div class="marker-pin bg-ms-secondary-yellow"></div>`;
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h3 class="text-base font-semibold">${cat.nome}</h3>
                  <p class="text-sm">${cat.endereco}</p>
                  <p class="text-sm">${cat.horario}</p>`);

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
