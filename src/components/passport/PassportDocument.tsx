import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePassport } from '@/hooks/usePassport';
import { TrendingUp } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando passaporte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="p-6 text-center">
          <div className="text-yellow-600 mb-2">⚠️</div>
          <h3 className="font-semibold mb-2">Sistema de Passaporte não Configurado</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <p className="text-xs text-muted-foreground">
            O administrador precisa executar a migration do banco de dados primeiro.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Se não tem passaporte NEM rota ativa após carregar, mostra erro
  if (!passport && !activeRoute && !loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Não foi possível carregar o passaporte.</p>
        <p className="text-sm mt-2">Verifique se o sistema está configurado corretamente.</p>
      </div>
    );
  }

  // Se tem rota ativa, mostrar o passaporte mesmo se passport for null (usar valores padrão)
  const displayPassportNumber = passport?.passport_number || 'MS-TEMP-' + Date.now().toString(36).toUpperCase();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Cabeçalho do Passaporte */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">🛂 Passaporte Digital MS</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Nº: <span className="font-mono font-semibold">{displayPassportNumber}</span>
              </p>
            </div>
            <OfflineIndicator />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {activeRoute ? (
            <PassportRouteView route={activeRoute} progress={progress || undefined} />
          ) : routeId ? (
            <div className="text-center py-8">
              <div className="text-yellow-600 mb-2 text-4xl">⚠️</div>
              <h3 className="font-semibold mb-2">Rota não encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A rota selecionada não foi encontrada ou não está ativa no sistema.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                ID da rota: <code className="bg-gray-100 px-2 py-1 rounded">{routeId}</code>
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => window.location.href = '/descubramatogrossodosul/passaporte'}>
                  Ver Todas as Rotas
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/viajar/admin/descubra-ms/passport'}
                >
                  Configurar Rotas (Admin)
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Estado vazio criativo - Mostrar passaporte mesmo sem rotas */}
              <div className="space-y-6">
                {/* Mensagem inspiradora */}
                <div className="text-center py-6 bg-gradient-to-r from-blue-50 via-green-50 to-yellow-50 rounded-lg border-2 border-dashed border-primary/30">
                  <div className="text-5xl mb-3">🗺️</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Sua Jornada Está Prestes a Começar!
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                    Em breve, você poderá explorar os destinos incríveis de Mato Grosso do Sul e 
                    colecionar selos temáticos da nossa fauna pantaneira. Fique atento às novidades!
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/descubramatogrossodosul/passaporte'}
                    className="mt-2"
                  >
                    Ver Rotas Disponíveis
                  </Button>
                </div>

                {/* Seção: Suas Conquistas - Preview dos Selos */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Suas Conquistas
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Selo Onça-Pintada */}
                    <Card className="relative overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-500 bg-white/80 px-2 py-1 rounded">
                          Em Breve
                        </span>
                      </div>
                      <CardContent className="p-4 text-center">
                        <div className="text-5xl mb-2 opacity-50">🐆</div>
                        <h5 className="font-semibold text-sm text-gray-600">Onça-Pintada</h5>
                        <p className="text-xs text-gray-500 mt-1">0/5 fragmentos</p>
                      </CardContent>
                    </Card>

                    {/* Selo Tuiuiú */}
                    <Card className="relative overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-500 bg-white/80 px-2 py-1 rounded">
                          Em Breve
                        </span>
                      </div>
                      <CardContent className="p-4 text-center">
                        <div className="text-5xl mb-2 opacity-50">🦩</div>
                        <h5 className="font-semibold text-sm text-gray-600">Tuiuiú</h5>
                        <p className="text-xs text-gray-500 mt-1">0/5 fragmentos</p>
                      </CardContent>
                    </Card>

                    {/* Selo Jacaré */}
                    <Card className="relative overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-500 bg-white/80 px-2 py-1 rounded">
                          Em Breve
                        </span>
                      </div>
                      <CardContent className="p-4 text-center">
                        <div className="text-5xl mb-2 opacity-50">🐊</div>
                        <h5 className="font-semibold text-sm text-gray-600">Jacaré</h5>
                        <p className="text-xs text-gray-500 mt-1">0/5 fragmentos</p>
                      </CardContent>
                    </Card>

                    {/* Selo Arara-Azul */}
                    <Card className="relative overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-500 bg-white/80 px-2 py-1 rounded">
                          Em Breve
                        </span>
                      </div>
                      <CardContent className="p-4 text-center">
                        <div className="text-5xl mb-2 opacity-50">🦜</div>
                        <h5 className="font-semibold text-sm text-gray-600">Arara-Azul</h5>
                        <p className="text-xs text-gray-500 mt-1">0/5 fragmentos</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Estatísticas */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Estatísticas do Passaporte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-gray-600">Rotas Completas</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-gray-600">Selos Coletados</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-600">0</div>
                        <div className="text-sm text-gray-600">Checkpoints Visitados</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-orange-600">0</div>
                        <div className="text-sm text-gray-600">Recompensas Desbloqueadas</div>
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

