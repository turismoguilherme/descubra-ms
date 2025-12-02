import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RouteHeroSection from './RouteHeroSection';
import AnimalStampGrid from './AnimalStampGrid';
import RewardsOverview from './RewardsOverview';
import PassportMap from './PassportMap';
import { MapPin, TrendingUp, WifiOff, KeyRound } from 'lucide-react';
import type { RouteExtended, StampProgress } from '@/types/passportDigital';

interface PassportRouteViewProps {
  route: RouteExtended;
  progress?: StampProgress;
}

const PassportRouteView: React.FC<PassportRouteViewProps> = ({ route, progress }) => {
  // Determine animal theme from configuration or default
  const theme = route.configuration?.stamp_theme || 'onca';
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Hero Section with Video */}
      <RouteHeroSection
        routeName={route.name}
        description={route.description || undefined}
        videoUrl={route.video_url || route.configuration?.video_url || undefined}
        imageUrl={route.image_url || undefined}
        difficulty={route.difficulty || undefined}
        duration={route.estimated_duration || undefined}
        distance={route.distance_km || undefined}
        theme={theme}
      />

      {/* Como usar este roteiro (online e offline) */}
      <Card>
        <CardContent className="p-4 md:p-5 space-y-3">
          <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-ms-primary-blue" />
            Como usar este roteiro com e sem internet
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>
              <span className="font-semibold text-gray-800">1. Abra a rota antes de sair para o passeio.</span>
              {' '}O sistema salva as informações principais no seu aparelho.
            </li>
            <li>
              <span className="font-semibold text-gray-800">2. Nos pontos ao ar livre</span> (mirantes, trilhas, praças),
              o check-in usa sua posição aproximada (GPS) para validar se você está no local.
            </li>
            <li className="flex items-start gap-2">
              <KeyRound className="h-4 w-4 mt-0.5 text-ms-primary-blue" />
              <span>
                <span className="font-semibold text-gray-800">3. Nos parceiros participantes</span> (hotéis, atrativos, restaurantes),
                algumas paradas pedem um <span className="font-semibold">código do parceiro</span>.
                Mostre seu passaporte digital no balcão e peça o código para concluir o carimbo.
              </span>
            </li>
            <li>
              <span className="font-semibold text-gray-800">4. Sem sinal de internet?</span>
              {' '}Se estiver sem conexão, seus check-ins são salvos no celular e sincronizados
              automaticamente quando você voltar a ter internet.
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stamp Progress */}
          {progress && (
            <AnimalStampGrid progress={progress} />
          )}

          {/* Route Statistics */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estatísticas do Roteiro
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {progress?.collected_fragments || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Fragmentos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {progress?.completion_percentage || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Progresso</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {route.checkpoints?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Checkpoints</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {route.rewards?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Recompensas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Panel */}
          <RewardsOverview 
            routeId={route.id} 
            completionPercentage={progress?.completion_percentage || 0}
          />
        </div>

        {/* Right Column - Map & Info (1/3) */}
        <div className="space-y-6">
          {/* Interactive Map */}
          {route.checkpoints && route.checkpoints.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mapa do Roteiro
                </h3>
                <PassportMap
                  route={route}
                  checkpoints={route.checkpoints}
                  progress={progress}
                />
              </CardContent>
            </Card>
          )}

          {/* Quick Info Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold text-gray-900">Informações Rápidas</h4>
              
              {route.region && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Região:</span>
                  <Badge variant="secondary">{route.region}</Badge>
                </div>
              )}

              {route.difficulty && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dificuldade:</span>
                  <Badge variant="secondary">
                    {route.difficulty === 'easy' ? 'Fácil' : 
                     route.difficulty === 'medium' ? 'Média' : 'Difícil'}
                  </Badge>
                </div>
              )}

              {route.distance_km && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Distância:</span>
                  <Badge variant="secondary">{route.distance_km} km</Badge>
                </div>
              )}

              {route.estimated_duration && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duração:</span>
                  <Badge variant="secondary">{route.estimated_duration}</Badge>
                </div>
              )}

              {route.configuration && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fragmentos:</span>
                  <Badge variant="secondary">
                    {route.configuration.stamp_fragments} carimbos
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PassportRouteView;
