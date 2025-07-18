
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Target, Map as MapIcon, Satellite } from 'lucide-react';
import { useMapbox } from '@/hooks/useMapbox';
import { useFlowTrip } from '@/context/FlowTripContext';
import { toast } from 'sonner';

const InteractiveMap = () => {
  const { addStamp, addPoints } = useFlowTrip();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [mapStyle, setMapStyle] = useState<'map' | 'satellite'>('map');
  
  const { map, mapContainer, mapLoaded } = useMapbox({
    style: mapStyle,
    center: [-54.6295, -20.4428], // Campo Grande, MS
    zoom: 6
  });

  // Destinos exemplo em Mato Grosso do Sul
  const destinations = [
    {
      id: 1,
      name: 'Pantanal',
      coordinates: [-56.0892, -19.0208],
      description: 'A maior planície alagável do mundo',
      points: 100,
      type: 'natureza'
    },
    {
      id: 2,
      name: 'Bonito',
      coordinates: [-56.4729, -21.1320],
      description: 'Águas cristalinas e cavernas',
      points: 80,
      type: 'ecoturismo'
    },
    {
      id: 3,
      name: 'Campo Grande',
      coordinates: [-54.6295, -20.4428],
      description: 'Capital de Mato Grosso do Sul',
      points: 50,
      type: 'urbano'
    },
    {
      id: 4,
      name: 'Chapada dos Guimarães',
      coordinates: [-55.7500, -15.4611],
      description: 'Cachoeiras e trilhas espetaculares',
      points: 90,
      type: 'aventura'
    }
  ];

  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Add markers for destinations
    destinations.forEach(destination => {
      const marker = document.createElement('div');
      marker.className = 'w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center hover:scale-110 transition-transform';
      marker.innerHTML = '<div class="w-3 h-3 bg-white rounded-full"></div>';
      
      marker.addEventListener('click', () => {
        setSelectedDestination(destination);
        map.flyTo({
          center: destination.coordinates as [number, number],
          zoom: 10,
          duration: 2000
        });
      });

      new (window as any).mapboxgl.Marker(marker)
        .setLngLat(destination.coordinates)
        .addTo(map);
    });
  }, [map, mapLoaded]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada pelo navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude
        ];
        setUserLocation(coords);
        
        if (map) {
          map.flyTo({
            center: coords,
            zoom: 12,
            duration: 2000
          });

          // Add user location marker
          const userMarker = document.createElement('div');
          userMarker.className = 'w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse';
          
          new (window as any).mapboxgl.Marker(userMarker)
            .setLngLat(coords)
            .addTo(map);
        }

        toast.success('Localização encontrada!');
      },
      (error) => {
        toast.error('Erro ao obter localização');
        console.error('Geolocation error:', error);
      }
    );
  };

  const checkInAtLocation = async () => {
    if (!selectedDestination) {
      toast.error('Selecione um destino primeiro');
      return;
    }

    try {
      await addStamp({
        activity_type: 'check_in',
        points_earned: selectedDestination.points,
        stamp_type: 'location'
      });

      toast.success(`Check-in realizado em ${selectedDestination.name}! +${selectedDestination.points} pontos`);
      setSelectedDestination(null);
    } catch (error) {
      toast.error('Erro ao realizar check-in');
    }
  };

  const getDestinationTypeColor = (type: string) => {
    switch (type) {
      case 'natureza': return 'bg-green-100 text-green-800';
      case 'ecoturismo': return 'bg-blue-100 text-blue-800';
      case 'urbano': return 'bg-gray-100 text-gray-800';
      case 'aventura': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            Mapa Interativo - Mato Grosso do Sul
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={getCurrentLocation}
              variant="outline"
              size="sm"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Minha Localização
            </Button>
            
            <Button
              onClick={() => setMapStyle(mapStyle === 'map' ? 'satellite' : 'map')}
              variant="outline"
              size="sm"
            >
              <Satellite className="h-4 w-4 mr-2" />
              {mapStyle === 'map' ? 'Satélite' : 'Mapa'}
            </Button>

            {selectedDestination && (
              <Button 
                onClick={checkInAtLocation}
                className="bg-green-500 hover:bg-green-600"
                size="sm"
              >
                <Target className="h-4 w-4 mr-2" />
                Check-in (+{selectedDestination.points} pts)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[500px] overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Carregando mapa...</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Destination */}
          {selectedDestination && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {selectedDestination.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={getDestinationTypeColor(selectedDestination.type)}>
                  {selectedDestination.type}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {selectedDestination.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pontos:</span>
                  <Badge variant="outline" className="text-primary">
                    +{selectedDestination.points} pts
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Destinations List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Destinos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedDestination?.id === destination.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                  onClick={() => {
                    setSelectedDestination(destination);
                    if (map) {
                      map.flyTo({
                        center: destination.coordinates as [number, number],
                        zoom: 10,
                        duration: 2000
                      });
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{destination.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      +{destination.points}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {destination.description}
                  </p>
                  <Badge 
                    className={`text-xs ${getDestinationTypeColor(destination.type)}`}
                    variant="secondary"
                  >
                    {destination.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Como usar:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Clique nos marcadores no mapa</li>
                <li>• Ou selecione na lista ao lado</li>
                <li>• Use sua localização para check-ins</li>
                <li>• Ganhe pontos por cada visita</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
