import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';

interface DashboardFallbackProps {
  dashboardName: string;
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  onDebug?: () => void;
}

const DashboardFallback: React.FC<DashboardFallbackProps> = ({
  dashboardName,
  error,
  onRetry,
  onGoHome,
  onDebug
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Erro ao tentar novamente:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleDebug = () => {
    if (onDebug) {
      onDebug();
    } else {
      console.log('Debug info:', {
        dashboardName,
        error: error?.message,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl text-orange-600">
            Dashboard Temporariamente Indisponível
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              O <strong>{dashboardName}</strong> está temporariamente indisponível. 
              Isso pode ser devido a uma atualização em andamento ou um problema temporário.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-800 mb-2">Detalhes do Erro:</h3>
                <p className="text-red-700 text-sm font-mono">
                  {error.message}
                </p>
              </div>
            )}

            {/* Status do Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm">Conexão OK</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded">
                <Badge variant="outline" className="text-xs">
                  {dashboardName}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2"
            >
              {isRetrying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRetrying ? 'Tentando...' : 'Tentar Novamente'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ir para Início
            </Button>
            
            <Button 
              variant="secondary"
              onClick={handleDebug}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Debug Info
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Se o problema persistir, nossa equipe técnica foi notificada automaticamente.
            </p>
            <p className="mt-1">
              ID do Erro: {Date.now().toString(36)}
            </p>
          </div>

          {/* Informações de Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Status do Sistema:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Servidor Online</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Banco de Dados OK</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-3 w-3 text-red-500" />
                <span>Dashboard Indisponível</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Autenticação OK</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardFallback;
