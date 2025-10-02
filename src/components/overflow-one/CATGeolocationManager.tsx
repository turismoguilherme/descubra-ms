import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit, Trash2, Navigation, CheckCircle, AlertCircle } from 'lucide-react';
import { useMultiTenantOverflowOne } from '@/hooks/useMultiTenantOverflowOne';

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
  const { currentTenant, stateName, cityName } = useMultiTenantOverflowOne();
  const [catLocations, setCatLocations] = useState<CATLocation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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

  const loadCATLocations = () => {
    // Simular carregamento de CATs do banco de dados
    const mockCATs: CATLocation[] = [
      {
        id: '1',
        name: 'CAT Centro',
        address: 'Praça da República, Centro, Campo Grande - MS',
        latitude: -20.4697,
        longitude: -54.6201,
        radius: 100,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'CAT Aeroporto',
        address: 'Aeroporto Internacional de Campo Grande, MS',
        latitude: -20.4686,
        longitude: -54.6725,
        radius: 150,
        isActive: true,
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      }
    ];
    setCatLocations(mockCATs);
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

  const handleAddCAT = () => {
    if (!newCAT.name || !newCAT.address || !newCAT.latitude || !newCAT.longitude) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const newCATLocation: CATLocation = {
      id: Date.now().toString(),
      name: newCAT.name,
      address: newCAT.address,
      latitude: parseFloat(newCAT.latitude),
      longitude: parseFloat(newCAT.longitude),
      radius: parseInt(newCAT.radius),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCatLocations([...catLocations, newCATLocation]);
    setNewCAT({ name: '', address: '', latitude: '', longitude: '', radius: '100' });
    setIsAdding(false);
  };

  const handleEditCAT = (id: string) => {
    setEditingId(id);
  };

  const handleDeleteCAT = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este CAT?')) {
      setCatLocations(catLocations.filter(cat => cat.id !== id));
    }
  };

  const toggleCATStatus = (id: string) => {
    setCatLocations(catLocations.map(cat => 
      cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
    ));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de CATs - {cityName}/{stateName}</h2>
          <p className="text-gray-600 mt-1">
            Cadastre e gerencie os Centros de Atendimento ao Turista com geolocalização
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo CAT
        </Button>
      </div>

      {/* Status da Localização do Usuário */}
      {userLocation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Navigation className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Sua Localização Atual</p>
                  <p className="text-sm text-blue-700">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              {nearbyCAT ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-900">
                      Próximo ao {nearbyCAT.cat.name}
                    </p>
                    <p className="text-xs text-green-700">
                      {Math.round(nearbyCAT.distance)}m de distância
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <p className="text-sm text-orange-700">
                    Fora do raio de qualquer CAT
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário para Novo CAT */}
      {isAdding && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Cadastrar Novo CAT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    onClick={useCurrentLocation}
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
            <div className="flex gap-2">
              <Button onClick={handleAddCAT}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Salvar CAT
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de CATs */}
      <div className="grid gap-4">
        {catLocations.map((cat) => (
          <Card key={cat.id} className={cat.isActive ? 'border-green-200' : 'border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    <p className="text-sm text-gray-600">{cat.address}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {cat.latitude.toFixed(6)}, {cat.longitude.toFixed(6)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Raio: {cat.radius}m
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cat.isActive ? 'default' : 'secondary'}>
                    {cat.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCATStatus(cat.id)}
                    >
                      {cat.isActive ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCAT(cat.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCAT(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total de CATs</span>
            </div>
            <div className="text-2xl font-bold mt-2">{catLocations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">CATs Ativos</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {catLocations.filter(cat => cat.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Cobertura</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {catLocations.length > 0 ? Math.round((catLocations.filter(cat => cat.isActive).length / catLocations.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CATGeolocationManager;




