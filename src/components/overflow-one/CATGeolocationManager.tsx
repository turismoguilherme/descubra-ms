import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { MapPin, Plus, Edit, Trash2, Navigation, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { useMultiTenantOverflowOne } from '@/hooks/useMultiTenantOverflowOne';
import { catLocationService, CATLocation as ServiceCATLocation } from '@/services/public/catLocationService';
import { useAuth } from '@/hooks/useAuth';

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
    radius: '100'
  });

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

  const handleAddCAT = async () => {
    if (!newCAT.name || !newCAT.address || !newCAT.latitude || !newCAT.longitude) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await catLocationService.createCATLocation({
        name: newCAT.name,
        address: newCAT.address,
        city: cityName || '',
        state: stateName || 'MS',
        latitude: parseFloat(newCAT.latitude),
        longitude: parseFloat(newCAT.longitude),
        radius: parseInt(newCAT.radius),
        is_active: true,
      });

      await loadCATLocations();
      setNewCAT({ name: '', address: '', latitude: '', longitude: '', radius: '100' });
      setIsAdding(false);
    } catch (error) {
      console.error('Erro ao criar CAT:', error);
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

  const useCurrentLocation = () => {
    if (userLocation) {
      setNewCAT(prev => ({
        ...prev,
        latitude: userLocation.lat.toString(),
        longitude: userLocation.lng.toString()
      }));
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
      actions={
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
      }
    >
      <div className="space-y-6">

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
          <CardBox className="border-l-4 border-l-green-500">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Cadastrar Novo CAT</h3>
              <p className="text-sm text-slate-600">Preencha os dados do Centro de Atendimento ao Turista</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cat-name">Nome do CAT</Label>
                  <Input
                    id="cat-name"
                    value={newCAT.name}
                    onChange={(e) => setNewCAT(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: CAT Centro"
                  />
                </div>
                <div>
                  <Label htmlFor="cat-address">Endereço</Label>
                  <Input
                    id="cat-address"
                    value={newCAT.address}
                    onChange={(e) => setNewCAT(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Endereço completo"
                  />
                </div>
                <div>
                  <Label htmlFor="cat-latitude">Latitude</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cat-latitude"
                      type="number"
                      step="0.000001"
                      value={newCAT.latitude}
                      onChange={(e) => setNewCAT(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="-20.4697"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Botão Usar localização atual clicado');
                        useCurrentLocation();
                      }}
                      disabled={!userLocation || isLoadingLocation}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cat-longitude">Longitude</Label>
                  <Input
                    id="cat-longitude"
                    type="number"
                    step="0.000001"
                    value={newCAT.longitude}
                    onChange={(e) => setNewCAT(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="-54.6201"
                  />
                </div>
                <div>
                  <Label htmlFor="cat-radius">Raio de Atuação (metros)</Label>
                  <Input
                    id="cat-radius"
                    type="number"
                    value={newCAT.radius}
                    onChange={(e) => setNewCAT(prev => ({ ...prev, radius: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão Salvar CAT clicado');
                    handleAddCAT();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Salvar CAT
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão Cancelar formulário CAT clicado');
                    setIsAdding(false);
                  }}
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

      </div>
    </SectionWrapper>
  );
};

export default CATGeolocationManager;




