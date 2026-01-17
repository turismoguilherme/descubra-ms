// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RouteHeroSection from './RouteHeroSection';
import AnimalStampGrid from './AnimalStampGrid';
import RewardsOverview from './RewardsOverview';
import PassportMap from './PassportMap';
import CheckpointList from './CheckpointList';
import { MapPin, TrendingUp, WifiOff, KeyRound, Puzzle, Target, Gift, CheckCircle2 } from 'lucide-react';
import type { RouteExtended, StampProgress } from '@/types/passportDigital';

interface PassportRouteViewProps {
  route: RouteExtended;
  progress?: StampProgress;
  onProgressUpdate?: () => void;
}

const PassportRouteView: React.FC<PassportRouteViewProps> = ({ route, progress, onProgressUpdate }) => {
  // Determine animal theme from configuration or default
  const theme = (route.configuration?.stamp_theme || 'onca') as 'onca' | 'tuiuiu' | 'jacare' | 'arara' | 'capivara';
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Section with Video */}
      <RouteHeroSection
        routeName={route.name}
        description={route.description || undefined}
        videoUrl={route.video_url || route.configuration?.video_url || undefined}
        imageUrl={route.image_url || undefined}
        mapImageUrl={route.map_image_url || undefined}
        difficulty={route.difficulty || undefined}
        duration={route.estimated_duration || undefined}
        distance={route.distance_km || undefined}
        theme={theme}
      />

      {/* Como usar este roteiro - Redesign Descubra MS */}
      <Card className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-r from-ms-primary-blue/5 to-ms-discovery-teal/5 p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold flex items-center gap-3 text-ms-primary-blue">
            <div className="bg-ms-primary-blue/10 p-2 rounded-lg">
              <WifiOff className="h-5 w-5 text-ms-primary-blue" />
            </div>
            Como usar este roteiro com e sem internet
          </h3>
        </div>
        <CardContent className="p-5 space-y-3">
          <ul className="text-sm text-gray-600 space-y-3">
            <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-ms-primary-blue/5 to-transparent rounded-xl">
              <div className="bg-ms-primary-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <span><strong className="text-gray-800">Abra a rota antes de sair para o passeio.</strong> O sistema salva as informações principais no seu aparelho.</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-ms-discovery-teal/5 to-transparent rounded-xl">
              <div className="bg-ms-discovery-teal text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <span><strong className="text-gray-800">Nos pontos ao ar livre</strong> (mirantes, trilhas, praças), o check-in usa sua posição aproximada (GPS) para validar se você está no local.</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-ms-pantanal-green/5 to-transparent rounded-xl">
              <div className="bg-ms-pantanal-green text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <div className="flex items-start gap-2">
                <KeyRound className="h-4 w-4 mt-0.5 text-ms-pantanal-green shrink-0" />
                <span><strong className="text-gray-800">Nos parceiros participantes</strong> (hotéis, atrativos, restaurantes), algumas paradas pedem um <strong>código do parceiro</strong>. Mostre seu passaporte digital no balcão e peça o código para concluir o carimbo.</span>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-ms-secondary-yellow/10 to-transparent rounded-xl">
              <div className="bg-ms-secondary-yellow text-ms-primary-blue w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
              <span><strong className="text-gray-800">Sem sinal de internet?</strong> Se estiver sem conexão, seus check-ins são salvos no celular e sincronizados automaticamente quando você voltar a ter internet.</span>
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

          {/* Route Statistics - Redesign */}
          <Card className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gradient-to-r from-ms-primary-blue/5 to-ms-discovery-teal/5 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-ms-primary-blue">
                <TrendingUp className="h-5 w-5" />
                Estatísticas do Roteiro
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 text-center border border-gray-100">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-ms-primary-blue/10 to-ms-discovery-teal/10 flex items-center justify-center">
                    <Puzzle className="w-6 h-6 text-ms-primary-blue" />
                  </div>
                  <div className="text-3xl font-bold text-ms-primary-blue">
                    {progress?.collected_fragments || 0}
                  </div>
                  <div className="text-sm text-gray-600">Fragmentos</div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 text-center border border-gray-100">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-ms-pantanal-green" />
                  </div>
                  <div className="text-3xl font-bold text-ms-pantanal-green">
                    {progress?.completion_percentage || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Progresso</div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 text-center border border-gray-100">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {route.checkpoints?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Checkpoints</div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 text-center border border-gray-100">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600">
                    {route.rewards?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Recompensas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Panel */}
          <RewardsOverview 
            routeId={route.id} 
            completionPercentage={progress?.completion_percentage || 0}
          />

          {/* Checkpoints List */}
          {route.checkpoints && route.checkpoints.length > 0 && (
            <CheckpointList
              checkpoints={route.checkpoints}
              routeId={route.id}
              progress={progress}
              requireSequential={route.configuration?.require_sequential || false}
              onCheckinSuccess={onProgressUpdate}
            />
          )}
        </div>

        {/* Right Column - Map & Info (1/3) */}
        <div className="space-y-6">
          {/* Interactive Map */}
          {route.checkpoints && route.checkpoints.length > 0 && (
            <Card className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-ms-primary-blue">
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

          {/* Quick Info Card - Redesign */}
          <Card className="bg-gradient-to-br from-ms-primary-blue/5 via-ms-discovery-teal/5 to-ms-pantanal-green/5 rounded-2xl shadow-lg border-0">
            <CardContent className="p-5 space-y-4">
              <h4 className="font-semibold text-ms-primary-blue text-lg">Informações Rápidas</h4>
              
              {route.region && (
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                  <span className="text-sm text-gray-600 font-medium">Região:</span>
                  <Badge className="bg-ms-primary-blue/10 text-ms-primary-blue border border-ms-primary-blue/20 rounded-full">
                    {route.region}
                  </Badge>
                </div>
              )}

              {route.difficulty && (
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                  <span className="text-sm text-gray-600 font-medium">Dificuldade:</span>
                  <Badge className="bg-ms-discovery-teal/10 text-ms-discovery-teal border border-ms-discovery-teal/20 rounded-full">
                    {route.difficulty === 'easy' ? 'Fácil' : 
                     route.difficulty === 'medium' ? 'Média' : 'Difícil'}
                  </Badge>
                </div>
              )}

              {route.distance_km && (
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                  <span className="text-sm text-gray-600 font-medium">Distância:</span>
                  <Badge className="bg-ms-pantanal-green/10 text-ms-pantanal-green border border-ms-pantanal-green/20 rounded-full">
                    {route.distance_km} km
                  </Badge>
                </div>
              )}

              {route.estimated_duration && (
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                  <span className="text-sm text-gray-600 font-medium">Duração:</span>
                  <Badge className="bg-ms-secondary-yellow/20 text-ms-primary-blue border border-ms-secondary-yellow/30 rounded-full">
                    {route.estimated_duration}
                  </Badge>
                </div>
              )}

              {route.configuration && (
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                  <span className="text-sm text-gray-600 font-medium">Fragmentos:</span>
                  <Badge className="bg-purple-100 text-purple-700 border border-purple-200 rounded-full">
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
