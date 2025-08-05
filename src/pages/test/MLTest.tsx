import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, User, Star, TrendingUp, Target, Users } from 'lucide-react';
import { mlService } from '@/services/ml/mlService';
import { MLPrediction, MLRecommendation, UserPreference } from '@/services/ml/mlTypes';

const MLTest = () => {
  const [userId, setUserId] = useState('test-user-001');
  const [context, setContext] = useState({
    location: 'Bonito, MS',
    interests: ['ecoturismo'],
    budget: 'moderate' as 'budget' | 'moderate' | 'luxury',
    groupSize: 2
  });
  const [results, setResults] = useState<MLPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<UserPreference[]>([]);

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🤖 ML: Gerando recomendações para usuário ${userId}`);
      
      const prediction = await mlService.generateRecommendations(userId, context);
      setResults(prediction);
      
      console.log('✅ Recomendações geradas:', prediction);
      
    } catch (error) {
      console.error('❌ Erro ao gerar recomendações:', error);
      setError('Erro ao gerar recomendações personalizadas');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordInteraction = async () => {
    try {
      const interaction: UserPreference = {
        id: `interaction-${Date.now()}`,
        userId,
        category: 'attraction',
        itemId: 'test-item-001',
        itemName: 'Teste de Interação',
        rating: 4,
        interactionType: 'view',
        timestamp: new Date().toISOString(),
        context: {
          location: context.location,
          interests: context.interests,
          budget: context.budget,
          groupSize: context.groupSize
        }
      };

      await mlService.recordInteraction(interaction);
      setInteractions(prev => [...prev, interaction]);
      
      console.log('✅ Interação registrada:', interaction);
      
    } catch (error) {
      console.error('❌ Erro ao registrar interação:', error);
      setError('Erro ao registrar interação');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getModelColor = (model: string) => {
    switch (model) {
      case 'hybrid': return 'bg-purple-500';
      case 'collaborative': return 'bg-blue-500';
      case 'content-based': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const addInterest = (interest: string) => {
    if (!context.interests.includes(interest)) {
      setContext(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setContext(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🤖 Teste do Sistema de Machine Learning
          </h1>
          <p className="text-gray-600">
            Teste o sistema de recomendações personalizadas do Guatá
          </p>
        </div>

        {/* Configuração */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuração do Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* ID do Usuário */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  ID do Usuário
                </label>
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Ex: user-001"
                />
              </div>

              {/* Localização */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  📍 Localização
                </label>
                <Input
                  value={context.location}
                  onChange={(e) => setContext(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Bonito, MS"
                />
              </div>

              {/* Orçamento */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  💰 Orçamento
                </label>
                <Select
                  value={context.budget}
                  onValueChange={(value: 'budget' | 'moderate' | 'luxury') => 
                    setContext(prev => ({ ...prev, budget: value }))
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
                  value={context.groupSize}
                  onChange={(e) => setContext(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
                />
              </div>

              {/* Interesses */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  🎯 Interesses (clique para adicionar/remover)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['ecoturismo', 'natureza', 'trilha', 'gruta', 'pantanal', 'cultura', 'história', 'gastronomia', 'aventura', 'relaxamento', 'família', 'casal', 'fotografia'].map(interest => (
                    <Badge
                      key={interest}
                      variant={context.interests.includes(interest) ? "default" : "outline"}
                      className={`cursor-pointer ${context.interests.includes(interest) ? 'bg-purple-500' : ''}`}
                      onClick={() => context.interests.includes(interest) ? removeInterest(interest) : addInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Button 
                onClick={handleRecordInteraction}
                className="bg-blue-600 hover:bg-blue-700"
              >
                📝 Registrar Interação
              </Button>
              <Button 
                onClick={handleGenerateRecommendations}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? '🤖 Gerando...' : '🤖 Gerar Recomendações'}
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

        {results && (
          <div className="space-y-6">
            {/* Resumo da Predição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Resultado da Predição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Usuário</h3>
                    <p className="text-sm">{results.userId}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Confiança</h3>
                    <Badge className={getConfidenceColor(results.confidence)}>
                      {Math.round(results.confidence * 100)}%
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800">Modelo</h3>
                    <Badge className={getModelColor(results.modelUsed)}>
                      {results.modelUsed}
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">Recomendações</h3>
                    <p className="text-sm">{results.recommendations.length}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Gerado em: {new Date(results.timestamp).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Recomendações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Recomendações Personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.recommendations.map((recommendation, index) => (
                    <div key={recommendation.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-purple-600">#{index + 1}</span>
                          <h3 className="font-semibold">{recommendation.itemName}</h3>
                        </div>
                        <Badge className={getConfidenceColor(recommendation.confidence)}>
                          {Math.round(recommendation.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Categoria:</strong> {recommendation.category}
                        </div>
                        <div>
                          <strong>Score:</strong> {recommendation.score.toFixed(2)}
                        </div>
                        <div>
                          <strong>Razão:</strong> {recommendation.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interações Registradas */}
            {interactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Interações Registradas ({interactions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {interactions.slice(-5).map((interaction, index) => (
                      <div key={interaction.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div>
                          <span className="font-medium">{interaction.itemName}</span>
                          <span className="text-sm text-gray-600 ml-2">({interaction.category})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{interaction.interactionType}</Badge>
                          <Badge className="bg-yellow-500">{interaction.rating}/5</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações de Debug */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm">🔧 Informações de Debug</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div><strong>ID do usuário:</strong> {userId}</div>
                  <div><strong>Localização:</strong> {context.location}</div>
                  <div><strong>Orçamento:</strong> {context.budget}</div>
                  <div><strong>Tamanho do grupo:</strong> {context.groupSize}</div>
                  <div><strong>Interesses:</strong> {context.interests.join(', ')}</div>
                  <div><strong>Interações registradas:</strong> {interactions.length}</div>
                  <div><strong>Confiança geral:</strong> {Math.round(results.confidence * 100)}%</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLTest; 