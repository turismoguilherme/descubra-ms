import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Calendar, Users, Route } from 'lucide-react';
import { itineraryService } from '@/services/itineraries/itineraryService';
import { ItineraryRequest, ItineraryResponse, DynamicItinerary } from '@/services/itineraries/itineraryTypes';

const ItineraryTest = () => {
  const [request, setRequest] = useState<ItineraryRequest>({
    duration: 3,
    interests: ['ecoturismo'],
    budget: 'moderate',
    startDate: new Date().toISOString().split('T')[0],
    location: 'Bonito, MS'
  });
  const [results, setResults] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateItinerary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🗺️ Gerando roteiro para: ${request.location}`);
      
      const response = await itineraryService.generateItinerary(request);
      setResults(response);
      
      console.log('✅ Roteiro gerado:', response);
      
    } catch (error) {
      console.error('❌ Erro ao gerar roteiro:', error);
      setError('Erro ao gerar roteiro personalizado');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'must': return 'bg-red-500';
      case 'should': return 'bg-yellow-500';
      case 'optional': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getBudgetColor = (budget: string) => {
    switch (budget) {
      case 'budget': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'luxury': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const addInterest = (interest: string) => {
    if (!request.interests.includes(interest)) {
      setRequest(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setRequest(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🗺️ Teste do Sistema de Roteiros Dinâmicos
          </h1>
          <p className="text-gray-600">
            Teste a geração automática de roteiros personalizados do Guatá
          </p>
        </div>

        {/* Configuração do Roteiro */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuração do Roteiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Localização */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Localização
                </label>
                <Input
                  value={request.location}
                  onChange={(e) => setRequest(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Bonito, MS"
                />
              </div>

              {/* Duração */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Duração (dias)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="14"
                  value={request.duration}
                  onChange={(e) => setRequest(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>

              {/* Orçamento */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Orçamento
                </label>
                <Select
                  value={request.budget}
                  onValueChange={(value: 'budget' | 'moderate' | 'luxury') => 
                    setRequest(prev => ({ ...prev, budget: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Econômico</SelectItem>
                    <SelectItem value="moderate">Moderado</SelectItem>
                    <SelectItem value="luxury">Luxo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data de Início */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Data de Início
                </label>
                <Input
                  type="date"
                  value={request.startDate}
                  onChange={(e) => setRequest(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              {/* Tamanho do Grupo */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Tamanho do Grupo
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  placeholder="Ex: 4"
                />
              </div>

              {/* Requisitos Especiais */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Route className="inline w-4 h-4 mr-1" />
                  Requisitos Especiais
                </label>
                <Textarea
                  placeholder="Ex: Acessibilidade, crianças pequenas, etc."
                  rows={2}
                />
              </div>
            </div>

            {/* Interesses */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Interesses (clique para adicionar/remover)
              </label>
              <div className="flex flex-wrap gap-2">
                {['ecoturismo', 'natureza', 'trilha', 'gruta', 'pantanal', 'cultura', 'história', 'gastronomia', 'aventura', 'relaxamento', 'família', 'casal', 'fotografia'].map(interest => (
                  <Badge
                    key={interest}
                    variant={request.interests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer ${request.interests.includes(interest) ? 'bg-blue-500' : ''}`}
                    onClick={() => request.interests.includes(interest) ? removeInterest(interest) : addInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Button 
                onClick={handleGenerateItinerary}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? '🗺️ Gerando Roteiro...' : '🗺️ Gerar Roteiro Personalizado'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <span className="font-medium">Erro: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {results && results.success && results.itinerary && (
          <div className="space-y-6">
            {/* Resumo do Roteiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🗺️ Roteiro Gerado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Título</h3>
                    <p className="text-sm">{results.itinerary.title}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800">Duração</h3>
                    <p className="text-sm">{results.itinerary.duration} dias</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Orçamento</h3>
                    <Badge className={getBudgetColor(results.itinerary.budget)}>
                      {results.itinerary.budget}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Interesses</h3>
                    <div className="flex flex-wrap gap-1">
                      {results.itinerary.interests.map(interest => (
                        <Badge key={interest} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Período</h3>
                    <p className="text-sm">
                      {new Date(results.itinerary.startDate).toLocaleDateString()} - {new Date(results.itinerary.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Atrações */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Atrações Incluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.itinerary.attractions.map((attraction) => (
                    <div key={attraction.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{attraction.name}</h3>
                        <Badge className={getPriorityColor(attraction.priority)}>
                          {attraction.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{attraction.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{attraction.estimatedTime} horas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>R$ {attraction.estimatedCost}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{attraction.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rota Diária */}
            <Card>
              <CardHeader>
                <CardTitle>🛣️ Rota Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: results.itinerary.duration }, (_, dayIndex) => {
                    const day = dayIndex + 1;
                    const dayAttractions = results.itinerary.route.filter(point => 
                      point.day === day && point.type === 'attraction'
                    );
                    
                    return (
                      <div key={day} className="border rounded-lg p-4 bg-yellow-50">
                        <h3 className="font-semibold mb-3">Dia {day}</h3>
                        {dayAttractions.length > 0 ? (
                          <div className="space-y-2">
                            {dayAttractions.map((point, index) => (
                              <div key={point.id} className="flex items-center gap-3 p-2 bg-white rounded">
                                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                <div className="flex-1">
                                  <p className="font-medium">{point.name}</p>
                                  <p className="text-sm text-gray-600">{point.location.address}</p>
                                </div>
                                <div className="text-right text-sm">
                                  <p>{Math.round(point.estimatedTime / 60)}h</p>
                                  <p className="text-green-600">R$ {point.estimatedCost}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Dia livre para exploração</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Informações de Debug */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm">🔧 Informações de Debug</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div><strong>Total de atrações:</strong> {results.itinerary.attractions.length}</div>
                  <div><strong>Pontos de rota:</strong> {results.itinerary.route.length}</div>
                  <div><strong>Status:</strong> {results.itinerary.status}</div>
                  <div><strong>ID do roteiro:</strong> {results.itinerary.id}</div>
                  <div><strong>Usuário:</strong> {results.itinerary.userId}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryTest; 