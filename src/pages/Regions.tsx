import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Star, Users, ArrowLeft, ExternalLink } from 'lucide-react';
import { RegionsOverview } from '@/components/regions/RegionsOverview';
import { MSRegion } from '@/types/regions';
import { useMultiTenant } from '@/config/multiTenant';
import { geminiClient } from '@/config/gemini';

const Regions: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, getPathWithTenant } = useMultiTenant();
  const [selectedRegion, setSelectedRegion] = useState<MSRegion | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  const handleRegionSelect = async (region: MSRegion) => {
    setSelectedRegion(region);
    setLoadingInsights(true);
    
    try {
      // Gerar insights com IA
      const prompt = `
        Analise a região turística "${region.name}" do ${currentTenant.fullName} e forneça insights estratégicos para turistas.
        
        Informações da região:
        - Descrição: ${region.description}
        - Cidades: ${region.cities.join(', ')}
        - Tipo de turismo: ${region.tourism_type}
        - Destaques: ${region.highlights.join(', ')}
        - Melhor época: ${region.best_season.join(', ')}
        
        Forneça:
        1. Por que visitar esta região
        2. Melhores épocas para visita
        3. Dicas de viagem
        4. Atrações imperdíveis
        5. Recomendações de roteiro
        
        Responda em português brasileiro de forma clara e objetiva.
      `;

      const model = geminiClient.getGenerativeModel({ model: "gemini-pro" });
      const response = await model.generateContent(prompt);
      const insights = response.response.text();
      setAiInsights(insights);
    } catch (error) {
      console.error('❌ Erro ao gerar insights:', error);
      setAiInsights('Insights temporariamente indisponíveis. Tente novamente mais tarde.');
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedRegion(null);
    setAiInsights('');
  };

  const tourismTypeLabels = {
    ecoturismo: 'Ecoturismo',
    turismo_rural: 'Turismo Rural',
    turismo_urbano: 'Turismo Urbano',
    turismo_aventura: 'Turismo de Aventura',
    turismo_cultural: 'Turismo Cultural',
    turismo_fronteira: 'Turismo de Fronteira'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(getPathWithTenant('/'))}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Regiões Turísticas
                </h1>
                <p className="text-gray-600">
                  Descubra as 10 regiões turísticas de {currentTenant.fullName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {currentTenant.name}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <RegionsOverview 
          onRegionSelect={handleRegionSelect}
          showStats={true}
        />
      </div>

      {/* Modal de Detalhes da Região */}
      <Dialog open={!!selectedRegion} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRegion && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  {selectedRegion.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedRegion.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Cidades da Região</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRegion.cities.map((city, index) => (
                          <Badge key={index} variant="outline">
                            {city}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Tipo de Turismo</h3>
                      <Badge variant="secondary" className="text-sm">
                        {tourismTypeLabels[selectedRegion.tourism_type]}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Melhor Época</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRegion.best_season.map((season, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {season}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Destaques</h3>
                      <div className="space-y-2">
                        {selectedRegion.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Coordenadas</h3>
                      <p className="text-sm text-gray-600">
                        Lat: {selectedRegion.coordinates.lat.toFixed(4)}, 
                        Lng: {selectedRegion.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Insights da IA */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-blue-600" />
                    Insights Inteligentes
                  </h3>
                  
                  {loadingInsights ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                      Gerando insights...
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="prose prose-sm max-w-none">
                        {aiInsights.split('\n').map((paragraph, index) => (
                          <p key={index} className="text-gray-700 mb-2">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Ações */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      navigate(getPathWithTenant('/destinos'));
                      handleCloseDialog();
                    }}
                  >
                    Ver Destinos
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigate(getPathWithTenant('/mapa'));
                      handleCloseDialog();
                    }}
                  >
                    Ver no Mapa
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      navigate(getPathWithTenant('/guata'));
                      handleCloseDialog();
                    }}
                  >
                    Perguntar ao Guatá
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Regions; 