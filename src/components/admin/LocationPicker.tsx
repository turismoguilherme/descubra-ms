import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Navigation, Target, Copy, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InteractiveMapPicker from './InteractiveMapPicker';

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
    observations?: string;
    geofenceRadius?: number;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    observations?: string;
    geofenceRadius?: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [geofenceRadius, setGeofenceRadius] = useState(initialLocation?.geofenceRadius || 100);
  const [observations, setObservations] = useState(initialLocation?.observations || '');
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  const { toast } = useToast();

  // Atualizar localização quando initialLocation mudar
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setGeofenceRadius(initialLocation.geofenceRadius || 100);
      setObservations(initialLocation.observations || '');
    }
  }, [initialLocation]);

  // Locais pré-definidos populares em MS
  const predefinedLocations = [
    {
      name: 'Centro de Bonito',
      address: 'Rua Coronel Pilad Rebuá, Centro, Bonito - MS',
      latitude: -20.7289,
      longitude: -56.4789,
      type: 'centro'
    },
    {
      name: 'Aeroporto de Campo Grande',
      address: 'Aeroporto Internacional de Campo Grande, MS',
      latitude: -20.4689,
      longitude: -54.6728,
      type: 'aeroporto'
    },
    {
      name: 'Pantanal Visitor Center',
      address: 'Estrada Parque Pantanal, MS',
      latitude: -19.0028,
      longitude: -57.6558,
      type: 'turistico'
    },
    {
      name: 'Centro de Campo Grande',
      address: 'Av. Afonso Pena, Centro, Campo Grande - MS',
      latitude: -20.4428,
      longitude: -54.6464,
      type: 'centro'
    },
    {
      name: 'Centro de Corumbá',
      address: 'Rua Frei Mariano, Centro, Corumbá - MS',
      latitude: -19.0078,
      longitude: -57.6547,
      type: 'centro'
    },
    {
      name: 'Centro de Aquidauana',
      address: 'Rua Teodoro Rondon, Centro, Aquidauana - MS',
      latitude: -20.4710,
      longitude: -55.7874,
      type: 'centro'
    }
  ];

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Geolocalização não suportada pelo navegador",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: 'Localização atual'
        };
        setSelectedLocation(location);
        toast({
          title: "Localização obtida",
          description: `Precisão: ${Math.round(position.coords.accuracy)}m`
        });
      },
      (error) => {
        toast({
          title: "Erro",
          description: "Não foi possível obter a localização atual",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Usar Nominatim (OpenStreetMap) - gratuito e não requer API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Mato Grosso do Sul, Brasil')}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ViaJAR-Tourism-Platform/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Verificar se a busca original tinha número mas os resultados não
        const originalHasNumber = /\d+/.test(searchQuery);
        let foundNumberInResults = false;
        
        const results = (data as NominatimResult[]).map((item) => {
          // Extrair número da casa se existir
          const addressParts = item.display_name.split(',');
          const firstPart = addressParts[0] || searchQuery;
          // Tentar encontrar número no primeiro segmento (ex: "Rua X, 123" ou "Rua X 123")
          const numberMatch = firstPart.match(/\s+(\d+)/);
          const streetName = numberMatch ? firstPart.replace(/\s+\d+.*$/, '').trim() : firstPart;
          const houseNumber = numberMatch ? numberMatch[1] : null;
          
          if (houseNumber) foundNumberInResults = true;
          
          return {
            name: streetName,
            address: item.display_name, // Endereço completo
            addressShort: houseNumber ? `${streetName}, ${houseNumber}` : streetName, // Nome + número destacado
            houseNumber: houseNumber,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            type: 'busca'
          };
        });
        
        setSearchResults(results);
        
        // Avisar se número não foi encontrado
        if (originalHasNumber && !foundNumberInResults && results.length > 0) {
          setSearchWarning('⚠️ O número da casa não foi encontrado. O resultado mostra apenas a rua. Use o mapa para ajustar o local exato arrastando o marcador.');
        } else {
          setSearchWarning(null);
        }
      } else {
        // Fallback para resultado mockado se API falhar
        setSearchResults([{
          name: searchQuery,
          address: `${searchQuery}, MS`,
          latitude: -20.4428,
          longitude: -54.6464,
          type: 'busca'
        }]);
      }
    } catch (error: unknown) {
      console.error('Erro ao buscar endereço:', error);
      // Fallback para resultado mockado em caso de erro
      setSearchResults([{
        name: searchQuery,
        address: `${searchQuery}, MS`,
        latitude: -20.4428,
        longitude: -54.6464,
        type: 'busca'
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSearchWarning(null); // Limpar aviso ao selecionar
  };

  const handleMapLocationChange = (lat: number, lng: number) => {
    if (selectedLocation) {
      setSelectedLocation({
        ...selectedLocation,
        latitude: lat,
        longitude: lng,
      });
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setGeofenceRadius(newRadius);
  };

  const confirmSelection = () => {
    if (selectedLocation) {
      onLocationSelect({
        ...selectedLocation,
        observations: observations.trim() || undefined,
        geofenceRadius: geofenceRadius,
      });
      onClose();
      toast({
        title: "Localização selecionada",
        description: selectedLocation.address || `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`
      });
    }
  };

  const copyCoordinates = () => {
    if (selectedLocation) {
      const coords = `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`;
      navigator.clipboard.writeText(coords);
      toast({
        title: "Coordenadas copiadas",
        description: coords
      });
    }
  };

  const getLocationTypeColor = (type) => {
    switch (type) {
      case 'centro': return 'bg-blue-100 text-blue-800';
      case 'aeroporto': return 'bg-green-100 text-green-800';
      case 'turistico': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationTypeIcon = (type) => {
    switch (type) {
      case 'centro': return '🏢';
      case 'aeroporto': return '✈️';
      case 'turistico': return '🌟';
      default: return '📍';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Selecionar Localização
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Painel Esquerdo - Métodos de Seleção */}
          <div className="space-y-6">
            {/* Busca por Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o endereço (ex: Rua das Flores, 123, Bonito - MS)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                  />
                  <Button 
                    onClick={searchLocation} 
                    disabled={isSearching}
                    size="sm"
                  >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
                
                {searchWarning && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-800">{searchWarning}</p>
                    </div>
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Resultados:</p>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        onClick={() => handleLocationSelect(result)}
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900">
                              {result.addressShort || result.name}
                              {result.houseNumber && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                  #{result.houseNumber}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{result.address}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              📍 {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Localização Atual */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Localização Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={getCurrentLocation}
                  variant="outline"
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Usar Minha Localização Atual
                </Button>
              </CardContent>
            </Card>

            {/* Locais Pré-definidos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Locais Populares em MS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predefinedLocations.map((location, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getLocationTypeIcon(location.type)}</span>
                          <div>
                            <p className="font-medium text-sm">{location.name}</p>
                            <p className="text-xs text-gray-600">{location.address}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getLocationTypeColor(location.type)}
                        >
                          {location.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel Direito - Localização Selecionada */}
          <div className="space-y-6">
            {/* Mapa Interativo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mapa Interativo</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedLocation ? (
                  <InteractiveMapPicker
                    latitude={selectedLocation.latitude}
                    longitude={selectedLocation.longitude}
                    radius={geofenceRadius}
                    onLocationChange={handleMapLocationChange}
                    onRadiusChange={handleRadiusChange}
                    height="400px"
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">Selecione uma localização</p>
                      <p className="text-xs mt-1">O mapa aparecerá aqui</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalhes da Localização Selecionada */}
            {selectedLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes da Localização</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nome:</label>
                    <p className="text-sm">{'address' in selectedLocation ? (selectedLocation.address || 'Local personalizado') : 'Local personalizado'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Endereço Completo:</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {'addressShort' in selectedLocation && selectedLocation.addressShort ? (
                        <>
                          <span className="font-semibold">{selectedLocation.addressShort}</span>
                          {'houseNumber' in selectedLocation && selectedLocation.houseNumber && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                              Nº {selectedLocation.houseNumber}
                            </span>
                          )}
                          <br />
                          <span className="text-xs text-gray-600 mt-1 block">
                            {selectedLocation.address}
                          </span>
                        </>
                      ) : (
                        selectedLocation.address || 'Não especificado'
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      💡 Este será o ponto exato onde os usuários devem fazer check-in
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Coordenadas:</label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyCoordinates}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Raio de Geofence:</label>
                    <p className="text-sm text-gray-900 mt-1">
                      <span className="font-semibold text-blue-600">{geofenceRadius}m</span>
                      <span className="text-xs text-gray-500 ml-2">
                        (Usuários precisam estar dentro deste raio para fazer check-in)
                      </span>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="observations" className="text-sm font-medium text-gray-700">
                      Observações sobre o Local (Opcional)
                    </Label>
                    <Textarea
                      id="observations"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Ex: Entrada principal do atrativo, portão azul, próximo ao estacionamento..."
                      className="mt-1 text-sm"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Descreva detalhes que ajudem a identificar o local exato (cor da fachada, pontos de referência, etc.)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <div className="flex gap-3">
              <Button
                onClick={confirmSelection}
                disabled={!selectedLocation}
                className="flex-1"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Confirmar Localização
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>

        {/* Dica */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Você pode buscar por endereços, usar sua localização atual, 
            ou escolher um dos locais populares pré-definidos para Mato Grosso do Sul.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker; 