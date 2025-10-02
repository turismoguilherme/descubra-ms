import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Star, Clock, Users, Phone, Mail, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TourismInventory } from '@/services/inventory/inventoryService';

interface InventoryMapProps {
  items: TourismInventory[];
  loading: boolean;
  onItemClick: (item: TourismInventory) => void;
}

export const InventoryMap: React.FC<InventoryMapProps> = ({
  items,
  loading,
  onItemClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedItem, setSelectedItem] = useState<TourismInventory | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    const initMap = () => {
      const mapInstance = new google.maps.Map(mapRef.current!, {
        zoom: 10,
        center: { lat: -20.4697, lng: -54.6201 }, // Campo Grande, MS
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
      setMapLoaded(true);
    };

    // Load Google Maps if not already loaded
    if (typeof google === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [mapLoaded]);

  // Update markers when items change
  useEffect(() => {
    if (!map || !items.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    items.forEach(item => {
      if (item.latitude && item.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: item.latitude, lng: item.longitude },
          map: map,
          title: item.name,
          icon: {
            url: getMarkerIcon(item),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
          }
        });

        // Add click listener
        marker.addListener('click', () => {
          setSelectedItem(item);
          onItemClick(item);
        });

        newMarkers.push(marker);
        bounds.extend({ lat: item.latitude, lng: item.longitude });
      }
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, items]);

  const getMarkerIcon = (item: TourismInventory): string => {
    const color = getCategoryColor(item.category?.name || '');
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10z" fill="${color}"/>
        <circle cx="16" cy="12" r="4" fill="white"/>
        ${item.is_featured ? '<circle cx="24" cy="8" r="6" fill="#06B6D4"/>' : ''}
      </svg>
    `)}`;
  };

  const getCategoryColor = (categoryName: string): string => {
    const colors: Record<string, string> = {
      'Atrativos Naturais': '#10B981',
      'Atrativos Culturais': '#8B5CF6',
      'Gastronomia': '#F59E0B',
      'Hospedagem': '#3B82F6',
      'Eventos': '#EF4444',
      'Serviços': '#6B7280',
      'Comércio': '#84CC16',
      'Entretenimento': '#EC4899'
    };
    return colors[categoryName] || '#6B7280';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'draft': return 'Rascunho';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando mapa...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg"
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>

      {/* Selected Item Details */}
      {selectedItem && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {/* Image */}
              <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {selectedItem.images && selectedItem.images.length > 0 ? (
                  <img
                    src={selectedItem.images[0]}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Sem imagem
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedItem.name}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {selectedItem.short_description || selectedItem.description}
                    </p>
                    
                    {/* Location */}
                    {selectedItem.address && (
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{selectedItem.address}</span>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="flex items-center space-x-4 text-gray-500 text-sm mb-3">
                      {selectedItem.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{selectedItem.phone}</span>
                        </div>
                      )}
                      {selectedItem.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span className="truncate">{selectedItem.email}</span>
                        </div>
                      )}
                      {selectedItem.website && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          <span className="truncate">Website</span>
                        </div>
                      )}
                    </div>

                    {/* Tags and Info */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={getStatusColor(selectedItem.status)}>
                        {getStatusLabel(selectedItem.status)}
                      </Badge>
                      
                      {selectedItem.category && (
                        <Badge variant="outline">
                          {selectedItem.category.name}
                        </Badge>
                      )}
                      
                      {selectedItem.subcategory && (
                        <Badge variant="outline">
                          {selectedItem.subcategory.name}
                        </Badge>
                      )}
                      
                      {selectedItem.is_featured && (
                        <Badge className="bg-cyan-100 text-cyan-800">
                          Destaque
                        </Badge>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                      {selectedItem.average_rating && selectedItem.average_rating > 0 && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          <span>{selectedItem.average_rating.toFixed(1)}</span>
                          <span className="ml-1">({selectedItem.review_count} avaliações)</span>
                        </div>
                      )}
                      
                      {selectedItem.capacity && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>Capacidade: {selectedItem.capacity}</span>
                        </div>
                      )}
                      
                      {selectedItem.opening_hours && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Horários disponíveis</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items without coordinates */}
      {items.filter(item => !item.latitude || !item.longitude).length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Itens sem localização ({items.filter(item => !item.latitude || !item.longitude).length})
            </h3>
            <div className="space-y-2">
              {items
                .filter(item => !item.latitude || !item.longitude)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category?.name}</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      Sem coordenadas
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
