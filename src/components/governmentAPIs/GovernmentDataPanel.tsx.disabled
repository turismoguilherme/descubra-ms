import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Cloud, 
  Bus, 
  TrendingUp, 
  RefreshCw, 
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Building2
} from 'lucide-react';
import { useGovernmentAPIs, useTourismData, useWeatherData, useRealTimeData } from '@/hooks/useGovernmentAPIs';

const GovernmentDataPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Hooks para diferentes APIs
  const { loading: generalLoading, error: generalError, data: generalData, refetch: refetchGeneral } = useGovernmentAPIs();
  const { loading: tourismLoading, error: tourismError, data: tourismData, refetch: refetchTourism } = useTourismData('MS');
  const { loading: weatherLoading, error: weatherError, data: weatherData, refetch: refetchWeather } = useWeatherData('5002704'); // Campo Grande
  const { loading: realTimeLoading, error: realTimeError, data: realTimeData, refetch: refetchRealTime } = useRealTimeData();

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchGeneral(),
      refetchTourism(),
      refetchWeather(),
      refetchRealTime()
    ]);
  };

  const getStatusIcon = (loading: boolean, error: string | null) => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    if (error) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (loading: boolean, error: string | null) => {
    if (loading) return 'Carregando...';
    if (error) return 'Erro';
    return 'Conectado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">APIs Governamentais</h2>
          <p className="text-gray-600">Dados oficiais em tempo real do governo</p>
        </div>
        <Button onClick={handleRefreshAll} disabled={generalLoading || tourismLoading || weatherLoading || realTimeLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar Todos
        </Button>
      </div>

      {/* Status das APIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status das Conexões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(generalLoading, generalError)}
              <div>
                <div className="font-medium">APIs Gerais</div>
                <div className="text-sm text-gray-600">{getStatusText(generalLoading, generalError)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(tourismLoading, tourismError)}
              <div>
                <div className="font-medium">Ministério do Turismo</div>
                <div className="text-sm text-gray-600">{getStatusText(tourismLoading, tourismError)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(weatherLoading, weatherError)}
              <div>
                <div className="font-medium">INMET (Clima)</div>
                <div className="text-sm text-gray-600">{getStatusText(weatherLoading, weatherError)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(realTimeLoading, realTimeError)}
              <div>
                <div className="font-medium">Fundtur-MS</div>
                <div className="text-sm text-gray-600">{getStatusText(realTimeLoading, realTimeError)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Dados */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tourism">Turismo</TabsTrigger>
          <TabsTrigger value="weather">Clima</TabsTrigger>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Dados Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Dados Gerais
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generalData ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Última Atualização:</span>
                      <span className="text-sm font-medium">
                        {new Date(generalData.lastUpdate).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fonte:</span>
                      <Badge variant="outline">{generalData.source}</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    {generalLoading ? 'Carregando...' : 'Nenhum dado disponível'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo Turístico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resumo Turístico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tourismData && tourismData.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Destinos:</span>
                      <span className="text-sm font-medium">{tourismData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Visitantes:</span>
                      <span className="text-sm font-medium">
                        {tourismData.reduce((sum, item) => sum + (item.visitors || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avaliação Média:</span>
                      <span className="text-sm font-medium">
                        {(tourismData.reduce((sum, item) => sum + (item.rating || 0), 0) / tourismData.length).toFixed(1)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    {tourismLoading ? 'Carregando...' : 'Nenhum dado disponível'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clima Atual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Clima Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weatherData ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Temperatura:</span>
                      <span className="text-sm font-medium">{weatherData.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Condição:</span>
                      <span className="text-sm font-medium">{weatherData.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Umidade:</span>
                      <span className="text-sm font-medium">{weatherData.humidity}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    {weatherLoading ? 'Carregando...' : 'Nenhum dado disponível'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tourism" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Dados do Ministério do Turismo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tourismData && tourismData.length > 0 ? (
                <div className="space-y-4">
                  {tourismData.map((destination) => (
                    <div key={destination.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{destination.name}</div>
                        <div className="text-sm text-gray-600">{destination.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{destination.rating} ⭐</Badge>
                          <Badge variant="secondary">{destination.visitors?.toLocaleString()} visitantes</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {tourismLoading ? 'Carregando dados turísticos...' : 'Nenhum destino encontrado'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Dados Meteorológicos - INMET
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weatherData ? (
                <div className="space-y-6">
                  {/* Clima Atual */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{weatherData.temperature}°C</div>
                      <div className="text-sm text-blue-700">Temperatura</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{weatherData.humidity}%</div>
                      <div className="text-sm text-green-700">Umidade</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{weatherData.condition}</div>
                      <div className="text-sm text-purple-700">Condição</div>
                    </div>
                  </div>

                  {/* Previsão */}
                  {weatherData.forecast && weatherData.forecast.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Previsão do Tempo</h4>
                      <div className="space-y-2">
                        {weatherData.forecast.map((forecast, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium">{forecast.day}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm">{forecast.min}°C - {forecast.max}°C</span>
                              <Badge variant="outline">{forecast.condition}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {weatherLoading ? 'Carregando dados meteorológicos...' : 'Nenhum dado disponível'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Dados em Tempo Real - Fundtur-MS
              </CardTitle>
            </CardHeader>
            <CardContent>
              {realTimeData ? (
                <div className="space-y-6">
                  {/* Estatísticas Gerais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{realTimeData.activeTourists}</div>
                      <div className="text-sm text-blue-700">Turistas Ativos</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{realTimeData.availableAccommodations}</div>
                      <div className="text-sm text-green-700">Acomodações Disponíveis</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{realTimeData.weatherCondition}</div>
                      <div className="text-sm text-purple-700">Clima</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600 capitalize">{realTimeData.trafficStatus}</div>
                      <div className="text-sm text-orange-700">Tráfego</div>
                    </div>
                  </div>

                  {/* Status dos Eventos */}
                  {realTimeData.eventStatus && (
                    <div>
                      <h4 className="font-semibold mb-3">Status dos Eventos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-lg font-bold text-green-600">{realTimeData.eventStatus.ongoing}</div>
                          <div className="text-sm text-green-700">Em Andamento</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-lg font-bold text-blue-600">{realTimeData.eventStatus.upcoming}</div>
                          <div className="text-sm text-blue-700">Próximos</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-600">{realTimeData.eventStatus.completed}</div>
                          <div className="text-sm text-gray-700">Concluídos</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Destinos Populares */}
                  {realTimeData.popularDestinations && realTimeData.popularDestinations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Destinos Populares</h4>
                      <div className="space-y-2">
                        {realTimeData.popularDestinations.map((destination, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{destination.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <span className="font-medium">{destination.currentVisitors}</span>
                                <span className="text-gray-500"> / {destination.capacity}</span>
                              </div>
                              <Badge variant="outline">
                                {Math.round((destination.currentVisitors / destination.capacity) * 100)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {realTimeLoading ? 'Carregando dados em tempo real...' : 'Nenhum dado disponível'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernmentDataPanel; 