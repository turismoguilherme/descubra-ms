import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePassport } from '@/hooks/usePassport';
import { TrendingUp, ArrowRight, Puzzle, MapPin, Award, Gift } from 'lucide-react';
import PassportRouteView from './PassportRouteView';
import OfflineIndicator from './OfflineIndicator';

interface PassportDocumentProps {
  routeId?: string;
}

const PassportDocument: React.FC<PassportDocumentProps> = ({ routeId: routeIdProp }) => {
  const location = useLocation();
  const routeIdFromState = (location.state as any)?.routeId;
  const routeId = routeIdProp || routeIdFromState;
  const { passport, activeRoute, progress, loading, error, loadRoute } = usePassport();

  // Debug
  React.useEffect(() => {
    console.log('🔍 [PassportDocument] ========== RENDER ==========');
    console.log('🔍 [PassportDocument] Props e State:', {
      routeIdProp,
      routeIdFromState,
      routeIdFinal: routeId,
      locationState: location.state,
      hasPassport: !!passport,
      activeRoute: activeRoute ? { id: activeRoute.id, name: activeRoute.name } : null,
      loading,
      error
    });
  }, [routeIdProp, routeIdFromState, routeId, passport, activeRoute, loading, error, location.state]);

  React.useEffect(() => {
    console.log('🔍 [PassportDocument] useEffect - routeId mudou:', {
      routeId,
      hasRouteId: !!routeId
    });
    
    if (routeId) {
      console.log('✅ [PassportDocument] RouteId fornecido, chamando loadRoute:', routeId);
      loadRoute(routeId);
    } else {
      console.warn('⚠️ [PassportDocument] Nenhum routeId fornecido');
    }
  }, [routeId, loadRoute]);

  // Loading state - padrão Descubra MS
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-ms-primary-blue/20"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-ms-primary-blue absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 font-medium">Carregando passaporte...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-2 border-ms-secondary-yellow/50 bg-gradient-to-r from-ms-secondary-yellow/10 to-orange-50 rounded-2xl shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ms-secondary-yellow/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="font-bold text-xl text-gray-800 mb-2">Sistema de Passaporte não Configurado</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <p className="text-xs text-gray-500">
            O administrador precisa executar a migration do banco de dados primeiro.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Se não tem passaporte NEM rota ativa após carregar, mostra erro
  if (!passport && !activeRoute && !loading) {
    return (
      <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-4xl">📋</span>
        </div>
        <p className="text-gray-600 font-medium">Não foi possível carregar o passaporte.</p>
        <p className="text-sm text-gray-500 mt-2">Verifique se o sistema está configurado corretamente.</p>
      </div>
    );
  }

  // Se tem rota ativa, mostrar o passaporte mesmo se passport for null (usar valores padrão)
  const displayPassportNumber = passport?.passport_number || 'MS-TEMP-' + Date.now().toString(36).toUpperCase();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Cabeçalho do Passaporte - Redesign Descubra MS */}
      <Card className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <span className="text-4xl">🛂</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                  Passaporte Digital MS
                </h1>
                <p className="text-white/90 text-sm mt-1">
                  Nº: <span className="font-mono font-semibold bg-white/10 px-3 py-1 rounded-full">{displayPassportNumber}</span>
                </p>
              </div>
            </div>
            <OfflineIndicator />
          </div>
        </div>
        <CardContent className="p-6">
          {activeRoute ? (
            <PassportRouteView 
              route={activeRoute} 
              progress={progress || undefined}
              onProgressUpdate={() => {
                
                // Recarregar rota e progresso após check-in
                if (routeId) {
                  loadRoute(routeId);
                }
              }}
            />
          ) : routeId ? (
            <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-ms-secondary-yellow/20 flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">Rota não encontrada</h3>
              <p className="text-sm text-gray-600 mb-4">
                A rota selecionada não foi encontrada ou não está ativa no sistema.
              </p>
              <p className="text-xs text-gray-500 mb-6">
                ID da rota: <code className="bg-gray-100 px-2 py-1 rounded font-mono">{routeId}</code>
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.location.href = '/descubrams/passaporte'}
                  className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white rounded-full px-6 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Ver Todas as Rotas
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/viajar/admin/descubra-ms/passport'}
                  className="border-2 border-ms-primary-blue text-ms-primary-blue rounded-full px-6 font-bold hover:bg-ms-primary-blue/5"
                >
                  Configurar Rotas (Admin)
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Estado vazio criativo - Redesign Descubra MS */}
              <div className="space-y-8">
                {/* Mensagem inspiradora */}
                <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-gradient-to-br from-ms-primary-blue/10 to-ms-discovery-teal/10 w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <span className="text-6xl">🗺️</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-ms-primary-blue mb-3">
                    Sua Jornada Está Prestes a Começar!
                  </h3>
                  <p className="text-gray-600 max-w-xl mx-auto mb-6 leading-relaxed text-lg">
                    Em breve, você poderá explorar os destinos incríveis de Mato Grosso do Sul e 
                    colecionar selos temáticos da nossa fauna pantaneira.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/descubrams/passaporte'}
                    className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Ver Rotas Disponíveis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                {/* Seção: Suas Conquistas - Preview dos Selos */}
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  <h4 className="text-lg font-semibold mb-6 flex items-center gap-2 text-ms-primary-blue">
                    <TrendingUp className="h-5 w-5" />
                    Suas Conquistas
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Selo Onça-Pintada */}
                    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-ms-primary-blue/30 group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60 group-hover:opacity-30 transition-opacity"></div>
                      <CardContent className="p-6 text-center relative">
                        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🐆</div>
                        <h5 className="font-bold text-ms-primary-blue">Onça-Pintada</h5>
                        <p className="text-sm text-gray-500 mt-1">0/5 fragmentos</p>
                        <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-medium bg-ms-secondary-yellow/20 text-ms-primary-blue border border-ms-secondary-yellow/30">
                          Em Breve
                        </span>
                      </CardContent>
                    </Card>

                    {/* Selo Tuiuiú */}
                    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-ms-primary-blue/30 group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60 group-hover:opacity-30 transition-opacity"></div>
                      <CardContent className="p-6 text-center relative">
                        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🦩</div>
                        <h5 className="font-bold text-ms-primary-blue">Tuiuiú</h5>
                        <p className="text-sm text-gray-500 mt-1">0/5 fragmentos</p>
                        <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-medium bg-ms-secondary-yellow/20 text-ms-primary-blue border border-ms-secondary-yellow/30">
                          Em Breve
                        </span>
                      </CardContent>
                    </Card>

                    {/* Selo Jacaré */}
                    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-ms-primary-blue/30 group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60 group-hover:opacity-30 transition-opacity"></div>
                      <CardContent className="p-6 text-center relative">
                        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🐊</div>
                        <h5 className="font-bold text-ms-primary-blue">Jacaré</h5>
                        <p className="text-sm text-gray-500 mt-1">0/5 fragmentos</p>
                        <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-medium bg-ms-secondary-yellow/20 text-ms-primary-blue border border-ms-secondary-yellow/30">
                          Em Breve
                        </span>
                      </CardContent>
                    </Card>

                    {/* Selo Arara-Azul */}
                    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-ms-primary-blue/30 group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60 group-hover:opacity-30 transition-opacity"></div>
                      <CardContent className="p-6 text-center relative">
                        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🦜</div>
                        <h5 className="font-bold text-ms-primary-blue">Arara-Azul</h5>
                        <p className="text-sm text-gray-500 mt-1">0/5 fragmentos</p>
                        <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-medium bg-ms-secondary-yellow/20 text-ms-primary-blue border border-ms-secondary-yellow/30">
                          Em Breve
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Estatísticas - Redesign */}
                <Card className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <CardHeader className="bg-gradient-to-r from-ms-primary-blue/5 to-ms-discovery-teal/5 rounded-t-2xl border-b border-gray-100">
                    <CardTitle className="text-lg text-ms-primary-blue flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Estatísticas do Passaporte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-purple-200/50 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-3xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-gray-600 mt-1">Rotas Completas</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-blue-200/50 flex items-center justify-center">
                          <Puzzle className="w-6 h-6 text-ms-primary-blue" />
                        </div>
                        <div className="text-3xl font-bold text-ms-primary-blue">0</div>
                        <div className="text-sm text-gray-600 mt-1">Selos Coletados</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-green-200/50 flex items-center justify-center">
                          <Award className="w-6 h-6 text-ms-pantanal-green" />
                        </div>
                        <div className="text-3xl font-bold text-ms-pantanal-green">0</div>
                        <div className="text-sm text-gray-600 mt-1">Checkpoints</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-orange-200/50 flex items-center justify-center">
                          <Gift className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="text-3xl font-bold text-orange-600">0</div>
                        <div className="text-sm text-gray-600 mt-1">Recompensas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PassportDocument;
