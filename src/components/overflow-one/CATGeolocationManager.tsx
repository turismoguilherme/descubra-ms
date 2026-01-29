import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { MapPin, Plus, Edit, Trash2, Navigation, CheckCircle, AlertCircle, Building2, Users, BarChart3 } from 'lucide-react';
import { useMultiTenantOverflowOne } from '@/hooks/useMultiTenantOverflowOne';
import { catLocationService, CATLocation as ServiceCATLocation } from '@/services/public/catLocationService';
import { useAuth } from '@/hooks/useAuth';
import AttendantManagement from '@/components/secretary/AttendantManagement';
import TouristServicesAnalytics from '@/components/secretary/TouristServicesAnalytics';

interface CATLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // em metros
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATGeolocationManager: React.FC = () => {
  const { user } = useAuth();
  const { currentTenant, stateName, cityName } = useMultiTenantOverflowOne();
  const [catLocations, setCatLocations] = useState<CATLocation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulário para novo CAT
  const [newCAT, setNewCAT] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: '200'
  });
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  useEffect(() => {
    loadCATLocations();
    getUserCurrentLocation();
  }, []);

  const loadCATLocations = async () => {
    setLoading(true);
    try {
      const data = await catLocationService.getCATLocations({
        city: cityName || undefined,
        state: stateName || undefined,
      });

      // Converter para formato do componente
      const convertedCATs: CATLocation[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        address: item.address || '',
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        radius: item.radius || 100,
        isActive: item.is_active,
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString(),
      }));

      setCatLocations(convertedCATs);
    } catch (error) {
      console.error('Erro ao carregar CATs:', error);
      // Fallback para lista vazia em caso de erro
      setCatLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setIsLoadingLocation(false);
        }
      );
    }
  };

  // Buscar endereço e preencher coordenadas automaticamente
  const searchAddress = async (address: string) => {
    if (!address || address.length < 5) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    setSearchingAddress(true);
    try {
      // Usar Nominatim (OpenStreetMap) - gratuito e não requer API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', ' + (cityName || '') + ', ' + (stateName || 'MS') + ', Brasil')}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ViaJAR-Tourism-Platform/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAddressSuggestions(data);
        setShowAddressSuggestions(data.length > 0);
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
    } finally {
      setSearchingAddress(false);
    }
  };

  const selectAddress = (suggestion: unknown) => {
    const address = suggestion.display_name || suggestion.name;
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    setNewCAT(prev => ({
      ...prev,
      address: address,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));

    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  };

  const useCurrentLocation = () => {
    if (userLocation) {
      setNewCAT(prev => ({
        ...prev,
        latitude: userLocation.lat.toFixed(6),
        longitude: userLocation.lng.toFixed(6)
      }));
    }
  };

  const handleAddCAT = async () => {
    if (!newCAT.name || !newCAT.address) {
      alert('Preencha pelo menos o nome e endereço do CAT');
      return;
    }

    // Se não tem coordenadas, tentar buscar pelo endereço automaticamente
    let lat = parseFloat(newCAT.latitude);
    let lng = parseFloat(newCAT.longitude);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      if (newCAT.address) {
        setSearchingAddress(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newCAT.address + ', ' + (cityName || '') + ', ' + (stateName || 'MS') + ', Brasil')}&limit=1`,
            {
              headers: {
                'User-Agent': 'ViaJAR-Tourism-Platform/1.0'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              lat = parseFloat(data[0].lat);
              lng = parseFloat(data[0].lon);
              setNewCAT(prev => ({
                ...prev,
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6)
              }));
            } else {
              alert('Endereço não encontrado. Por favor, verifique o endereço ou use o botão "Usar Minha Localização".');
              setSearchingAddress(false);
              return;
            }
          }
        } catch (error) {
          console.error('Erro ao buscar coordenadas:', error);
          alert('Erro ao buscar coordenadas. Por favor, use o botão "Usar Minha Localização" ou tente novamente.');
          setSearchingAddress(false);
          return;
        } finally {
          setSearchingAddress(false);
        }
      } else {
        alert('Não foi possível obter as coordenadas. Por favor, use a busca de endereço (selecione uma sugestão) ou o botão "Usar Minha Localização".');
        return;
      }
    }

    await saveCAT(lat, lng);
  };

  const saveCAT = async (lat: number, lng: number) => {
    console.log('🔵 CATGeolocationManager: Salvando CAT:', {
      name: newCAT.name,
      address: newCAT.address,
      city: cityName,
      region: stateName,
      latitude: lat,
      longitude: lng,
    });

    setLoading(true);
    try {
      // Enviar apenas campos que existem na tabela cat_locations
      await catLocationService.createCATLocation({
        name: newCAT.name,
        address: newCAT.address,
        city: cityName || '',
        region: stateName || 'MS', // usar region ao invés de state
        latitude: lat,
        longitude: lng,
        is_active: true,
      });

      console.log('✅ CATGeolocationManager: CAT salvo com sucesso!');
      await loadCATLocations();
      setNewCAT({ name: '', address: '', latitude: '', longitude: '', radius: '200' });
      setIsAdding(false);
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    } catch (error) {
      console.error('❌ CATGeolocationManager: Erro ao criar CAT:', error);
      alert('Erro ao criar CAT. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCAT = (id: string) => {
    setEditingId(id);
  };

  const handleDeleteCAT = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este CAT?')) {
      setLoading(true);
      try {
        await catLocationService.deleteCATLocation(id);
        await loadCATLocations();
      } catch (error) {
        console.error('Erro ao excluir CAT:', error);
        alert('Erro ao excluir CAT. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleCATStatus = async (id: string) => {
    setLoading(true);
    try {
      const cat = catLocations.find(c => c.id === id);
      if (cat) {
        await catLocationService.updateCATLocation(id, {
          is_active: !cat.isActive,
        });
        await loadCATLocations();
      }
    } catch (error) {
      console.error('Erro ao alterar status do CAT:', error);
      alert('Erro ao alterar status. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distância em metros
  };

  const checkUserNearCAT = () => {
    if (!userLocation) return null;

    for (const cat of catLocations) {
      if (!cat.isActive) continue;

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        cat.latitude,
        cat.longitude
      );

      if (distance <= cat.radius) {
        return { cat, distance };
      }
    }

    return null;
  };

  const nearbyCAT = checkUserNearCAT();

  return (
    <SectionWrapper
      variant="default"
      title={`Gestão de CATs – ${cityName}/${stateName}`}
      subtitle="Cadastre e gerencie os Centros de Atendimento ao Turista com geolocalização"
    >
      <Tabs defaultValue="cats" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="cats" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Gestão de CATs
          </TabsTrigger>
          <TabsTrigger value="attendants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gestão de Atendentes
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Atendimentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cats" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Novo CAT clicado');
                setIsAdding(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo CAT
            </Button>
          </div>

        {/* Status da Localização do Usuário */}
        {userLocation && (
          <CardBox className="border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Navigation className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Sua Localização Atual</p>
                  <p className="text-sm text-slate-600">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              {nearbyCAT ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-800">
                      Próximo ao {nearbyCAT.cat.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {Math.round(nearbyCAT.distance)}m de distância
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <p className="text-sm font-medium text-orange-700">
                    Fora do raio de qualquer CAT
                  </p>
                </div>
              )}
            </div>
          </CardBox>
        )}

        {/* Formulário para Novo CAT */}
        {isAdding && (
          <CardBox className="border-l-4 border-l-blue-500 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <div className="mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Cadastrar Novo CAT</h3>
                  <p className="text-sm text-slate-600">Preencha os dados do Centro de Atendimento ao Turista</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cat-name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Nome do CAT *
                  </Label>
                  <Input
                    id="cat-name"
                    value={newCAT.name}
                    onChange={(e) => setNewCAT(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: CAT Centro"
                    className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="cat-address" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Endereço *
                  </Label>
                  <div className="relative">
                    <Input
                      id="cat-address"
                      value={newCAT.address}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewCAT(prev => ({ ...prev, address: value }));
                        searchAddress(value);
                      }}
                      onFocus={() => {
                        if (addressSuggestions.length > 0) {
                          setShowAddressSuggestions(true);
                        }
                      }}
                      placeholder="Digite o endereço completo (ex: Rua 14 de Julho, 123, Centro, Campo Grande, MS)"
                      className="pr-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {searchingAddress && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {addressSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectAddress(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-sm text-slate-900">
                                  {suggestion.display_name || suggestion.name}
                                </div>
                                {suggestion.address && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    {suggestion.address.city || suggestion.address.town || ''} - {suggestion.address.state || ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Digite o endereço e selecione uma sugestão. As coordenadas serão preenchidas automaticamente.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-radius" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    Raio de Atuação
                  </Label>
                  <Select
                    value={newCAT.radius}
                    onValueChange={(value) => setNewCAT(prev => ({ ...prev, radius: value }))}
                  >
                    <SelectTrigger className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 metros (área pequena)</SelectItem>
                      <SelectItem value="100">100 metros (área média)</SelectItem>
                      <SelectItem value="200">200 metros (área grande) - Recomendado</SelectItem>
                      <SelectItem value="500">500 metros (área muito grande)</SelectItem>
                      <SelectItem value="1000">1 km (área extensa)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Distância máxima para check-in dos atendentes
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    Localização GPS
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={useCurrentLocation}
                    disabled={!userLocation || isLoadingLocation}
                    className="w-full h-11 border-slate-300 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {isLoadingLocation ? 'Obtendo localização...' : 'Usar Minha Localização'}
                  </Button>
                  {(newCAT.latitude && newCAT.longitude) && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div className="font-medium text-sm text-green-800">Coordenadas obtidas</div>
                      </div>
                      <div className="text-xs text-green-700 font-mono">
                        Lat: {newCAT.latitude} | Lng: {newCAT.longitude}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão Salvar CAT clicado');
                    handleAddCAT();
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md px-6 h-11"
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar CAT'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão Cancelar formulário CAT clicado');
                    setIsAdding(false);
                    setNewCAT({ name: '', address: '', latitude: '', longitude: '', radius: '200' });
                    setAddressSuggestions([]);
                  }}
                  className="px-6 h-11 border-slate-300 hover:bg-slate-50"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardBox>
        )}

        {/* Lista de CATs */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardBox key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardBox>
            ))}
          </div>
        ) : catLocations.length === 0 ? (
          <CardBox>
            <div className="text-center py-12">
              <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-1">Nenhum CAT cadastrado</p>
              <p className="text-sm text-slate-500">
                Clique em "Novo CAT" para cadastrar o primeiro Centro de Atendimento ao Turista
              </p>
            </div>
          </CardBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catLocations.map((cat) => (
              <CardBox key={cat.id} className="hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate mb-1">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{cat.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cat.isActive && (
                      <Badge className="rounded-full text-xs px-2 py-0.5 bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    )}
                    {!cat.isActive && (
                      <Badge className="rounded-full text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-gray-200">
                        Inativo
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    <span>{cat.latitude.toFixed(6)}, {cat.longitude.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Raio: {cat.radius}m</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Botão Toggle status CAT clicado', cat.id);
                        toggleCATStatus(cat.id);
                      }}
                      disabled={loading}
                      className="flex-1"
                    >
                      {cat.isActive ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Botão Editar CAT clicado', cat.id);
                        handleEditCAT(cat.id);
                      }}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Botão Excluir CAT clicado', cat.id);
                        handleDeleteCAT(cat.id);
                      }}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardBox>
            ))}
          </div>
        )}

        </TabsContent>

        <TabsContent value="attendants" className="space-y-6">
          <AttendantManagement />
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <TouristServicesAnalytics />
        </TabsContent>
      </Tabs>
    </SectionWrapper>
  );
};

export default CATGeolocationManager;




