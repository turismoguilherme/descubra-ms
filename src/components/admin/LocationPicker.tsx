import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Navigation, Target, Copy, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InteractiveMapPicker from './InteractiveMapPicker';
import { geolocationService } from '@/services/passport/geolocationService';
import {
  searchAddressInMs,
  resultsIncludeHouseNumber,
  type MsSearchResult,
} from '@/utils/nominatimMsSearch';

const MS_MAP_DEFAULT = {
  latitude: -20.4697,
  longitude: -54.6201,
  address: 'Mato Grosso do Sul — arraste o marcador para o ponto exato',
};

type PinSource = 'default_ms' | 'initial' | 'gps' | 'search' | 'popular' | 'map';

type SelectedLocation = {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
  addressShort?: string;
  houseNumber?: string | null;
};

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
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchResults, setSearchResults] = useState<MsSearchResult[]>([]);
  const [geofenceRadius, setGeofenceRadius] = useState(initialLocation?.geofenceRadius || 100);
  const [observations, setObservations] = useState(initialLocation?.observations || '');
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  const [mapMountKey, setMapMountKey] = useState(0);
  const [pinSource, setPinSource] = useState<PinSource | null>(null);
  const [gpsAccuracyM, setGpsAccuracyM] = useState<number | null>(null);
  const mapAdjustedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSearchWarning(null);
      setSelectedLocation(null);
      setPinSource(null);
      setGpsAccuracyM(null);
      mapAdjustedRef.current = false;
      return;
    }

    setMapMountKey((k) => k + 1);
    mapAdjustedRef.current = false;

    if (initialLocation?.latitude != null && initialLocation?.longitude != null) {
      setSelectedLocation({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        address: initialLocation.address || 'Checkpoint atual',
      });
      setGeofenceRadius(initialLocation.geofenceRadius || 100);
      setObservations(initialLocation.observations || '');
      setPinSource('initial');
      return;
    }

    setSelectedLocation(MS_MAP_DEFAULT);
    setPinSource('default_ms');
    setSearchWarning(
      'Mapa aberto no centro de MS. Use busca, GPS ou arraste o marcador antes de confirmar.'
    );
  }, [isOpen, initialLocation]);

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

  const getCurrentLocation = async () => {
    setIsLocating(true);
    setSearchWarning(null);
    try {
      const loc = await geolocationService.getBestCurrentLocation();
      const accuracy = Math.round(loc.accuracy);
      setGpsAccuracyM(accuracy);
      setPinSource('gps');
      mapAdjustedRef.current = false;
      setSelectedLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: `Localização GPS (precisão ~${accuracy} m)`,
      });
      toast({
        title: 'Localização obtida',
        description: `Precisão do GPS: cerca de ${accuracy} m`,
      });
      if (accuracy > 100) {
        setSearchWarning(
          'GPS impreciso (comum em notebook). Confira o marcador no mapa ou use o celular no local do atrativo.'
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLocating(false);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchWarning(null);

    try {
      const { results, requestedHouseNumber } = await searchAddressInMs(searchQuery);

      if (results.length === 0) {
        setSearchResults([]);
        setSearchWarning(
          'Nenhum resultado. Tente cidade no texto (ex.: ", Bonito") ou marque no mapa com GPS.'
        );
        return;
      }

      setSearchResults(results);

      if (
        requestedHouseNumber &&
        !resultsIncludeHouseNumber(results, requestedHouseNumber)
      ) {
        setSearchWarning(
          'O número informado não apareceu no mapa base (OpenStreetMap). O ponto pode ser só a rua — arraste o marcador até a porta correta.'
        );
      }
    } catch (error: unknown) {
      console.error('Erro ao buscar endereço:', error);
      setSearchResults([]);
      setSearchWarning(
        'Erro na busca. Use GPS ou arraste o marcador — não usamos coordenadas automáticas inventadas.'
      );
      toast({
        title: 'Erro na busca',
        description: 'Marque o local no mapa antes de confirmar.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultSelect = (result: MsSearchResult) => {
    setSelectedLocation(result);
    setPinSource('search');
    mapAdjustedRef.current = false;
    setSearchWarning(null);
  };

  const handlePopularSelect = (location: (typeof predefinedLocations)[0]) => {
    setSelectedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      name: location.name,
    });
    setPinSource('popular');
    mapAdjustedRef.current = false;
    setSearchWarning(null);
  };

  const handleMapLocationChange = (lat: number, lng: number) => {
    mapAdjustedRef.current = true;
    setPinSource('map');
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
    if (!selectedLocation) return;

    const onlyDefault =
      pinSource === 'default_ms' && !mapAdjustedRef.current;

    if (onlyDefault) {
      const ok = window.confirm(
        'Você ainda está no ponto padrão do mapa (centro de MS), sem busca nem GPS.\n\nConfirmar mesmo assim? O check-in dos turistas usará essas coordenadas.'
      );
      if (!ok) return;
    }

    onLocationSelect({
      ...selectedLocation,
      observations: observations.trim() || undefined,
      geofenceRadius: geofenceRadius,
    });
    onClose();
    toast({
      title: 'Localização aplicada ao formulário',
      description:
        'Clique em Salvar no checkpoint para o check-in dos turistas usar este ponto.',
    });
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

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'centro': return 'bg-blue-100 text-blue-800';
      case 'aeroporto': return 'bg-green-100 text-green-800';
      case 'turistico': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'centro': return '🏢';
      case 'aeroporto': return '✈️';
      case 'turistico': return '🌟';
      default: return '📍';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Selecionar Localização
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
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
                        onClick={() => handleSearchResultSelect(result)}
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Localização Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={getCurrentLocation}
                  variant="outline"
                  className="w-full"
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Target className="h-4 w-4 mr-2" />
                  )}
                  {isLocating ? 'Obtendo GPS...' : 'Usar Minha Localização Atual'}
                </Button>
                {gpsAccuracyM != null && (
                  <p className="text-xs text-muted-foreground text-center">
                    Última leitura: precisão ~{gpsAccuracyM} m
                  </p>
                )}
              </CardContent>
            </Card>

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
                      onClick={() => handlePopularSelect(location)}
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mapa Interativo</CardTitle>
              </CardHeader>
              <CardContent>
                {isOpen && selectedLocation ? (
                  <InteractiveMapPicker
                    remountKey={mapMountKey}
                    layoutActive={isOpen}
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

            {selectedLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes da Localização</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Referência:</label>
                    <p className="text-sm">{selectedLocation.address || selectedLocation.name || 'Local personalizado'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Coordenadas (check-in usa este ponto):</label>
                    <div className="flex items-center gap-2 mt-1">
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
                        (turista precisa estar dentro deste raio)
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
                      placeholder="Ex: Entrada principal, portão azul..."
                      className="mt-1 text-sm"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

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

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Depois de confirmar, use <strong>Salvar</strong> no checkpoint. O turista só carimba se o GPS dele
            estiver dentro do raio em relação a estas coordenadas.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;
