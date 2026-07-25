import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePassport } from '@/hooks/usePassport';
import { TrendingUp, ArrowRight, Puzzle, MapPin, Award, Gift } from 'lucide-react';
import PassportRouteView from './PassportRouteView';

interface PassportDocumentProps {
  routeId?: string;
}

const PassportDocument: React.FC<PassportDocumentProps> = ({ routeId: routeIdProp }) => {
  const location = useLocation();
  const routeIdFromState = (location.state as any)?.routeId;
  const routeId = routeIdProp || routeIdFromState;
  const { passport, activeRoute, progress, loading, error, loadRoute } = usePassport();

  React.useEffect(() => {
    if (routeId) {
      loadRoute(routeId);
    }
  }, [routeId, loadRoute]);

  // Loading state - padrão Descubra MS.
  // Também é exibido enquanto uma rota específica está sendo carregada,
  // para evitar o "flash" da tela de conquistas antes do PassportRouteView.
  if (loading || (routeId && !activeRoute && !error)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-ms-primary-blue/20"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-ms-primary-blue absolute top-0 left-0"></div>
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
            {/* Indicador de status removido - offline sync deprecated */}
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

                {/* Seções "Suas Conquistas" e "Estatísticas do Passaporte"
                    removidas do estado vazio a pedido do produto — o foco
                    aqui é levar o usuário à lista de rotas. */}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PassportDocument;
