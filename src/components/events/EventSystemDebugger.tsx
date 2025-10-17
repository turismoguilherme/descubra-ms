/**
 * Debugger do Sistema de Eventos
 * 
 * FUNCIONALIDADE: Mostra informações detalhadas para debug
 * SEGURANÇA: Não interfere com funcionalidades existentes
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import { useEventManagement } from '@/hooks/useEventManagement';
import { autoEventActivator } from '@/services/events/AutoEventActivator';

const EventSystemDebugger: React.FC = () => {
  const {
    isInitialized,
    servicesStatus,
    performManualCleanup,
    isCleaning,
    errors
  } = useEventManagement();

  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 DEBUGGER: Executando diagnósticos...");
      
      const activationStatus = autoEventActivator.getActivationStatus();
      const servicesStatus = useEventManagement().servicesStatus;
      
      const debugData = {
        timestamp: new Date().toISOString(),
        activation: activationStatus,
        services: servicesStatus,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isProduction: process.env.NODE_ENV === 'production',
          hasWindow: typeof window !== 'undefined'
        },
        imports: {
          eventManagement: !!require('@/services/events/EventManagementService'),
          autoActivator: !!require('@/services/events/AutoEventActivator'),
          hook: !!require('@/hooks/useEventManagement')
        }
      };
      
      setDebugInfo(debugData);
      console.log("🔍 DEBUGGER: Diagnósticos concluídos:", debugData);
      
    } catch (error) {
      console.error("🔍 DEBUGGER: Erro durante diagnósticos:", error);
      setDebugInfo({ error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  const testManualCleanup = async () => {
    try {
      console.log("🧪 DEBUGGER: Testando limpeza manual...");
      const result = await performManualCleanup();
      console.log("🧪 DEBUGGER: Resultado da limpeza:", result);
      alert(`Limpeza manual executada! Resultado: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error("🧪 DEBUGGER: Erro na limpeza manual:", error);
      alert(`Erro na limpeza manual: ${error}`);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: boolean) => {
    if (status) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean, label: string) => {
    if (status) return <Badge variant="default" className="bg-green-500">{label}</Badge>;
    return <Badge variant="destructive">{label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debugger do Sistema de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Status do Sistema</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Sistema Inicializado:</span>
                  {getStatusIcon(isInitialized)}
                  {getStatusBadge(isInitialized, isInitialized ? 'SIM' : 'NÃO')}
                </div>
                <div className="flex items-center justify-between">
                  <span>Limpeza Ativa:</span>
                  {getStatusIcon(servicesStatus?.cleanup?.isRunning)}
                  {getStatusBadge(servicesStatus?.cleanup?.isRunning, servicesStatus?.cleanup?.isRunning ? 'ATIVA' : 'INATIVA')}
                </div>
                <div className="flex items-center justify-between">
                  <span>Google Calendar:</span>
                  {getStatusIcon(servicesStatus?.googleCalendar?.isRunning)}
                  {getStatusBadge(servicesStatus?.googleCalendar?.isRunning, servicesStatus?.googleCalendar?.isRunning ? 'ATIVO' : 'INATIVO')}
                </div>
                <div className="flex items-center justify-between">
                  <span>Gemini AI:</span>
                  {getStatusIcon(servicesStatus?.geminiAI?.isRunning)}
                  {getStatusBadge(servicesStatus?.geminiAI?.isRunning, servicesStatus?.geminiAI?.isRunning ? 'ATIVO' : 'INATIVO')}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Controles de Teste</h4>
              <div className="space-y-2">
                <Button
                  onClick={runDiagnostics}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Bug className="h-4 w-4 mr-2" />
                      Executar Diagnósticos
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={testManualCleanup}
                  disabled={isCleaning}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isCleaning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Limpando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Testar Limpeza Manual
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Informações de Debug */}
          {debugInfo && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Informações de Debug</h4>
              <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-64">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Erros */}
          {errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-red-600">Erros Encontrados</h4>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventSystemDebugger;


