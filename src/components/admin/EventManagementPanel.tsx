/**
 * Painel de Administração para Gerenciamento de Eventos
 * 
 * FUNCIONALIDADE: Interface para controlar os serviços de eventos
 * SEGURANÇA: Não interfere com funcionalidades existentes
 */

import React, { useState, useEffect } from 'react';
import { useEventManagement } from '@/hooks/useEventManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw, 
  Brain, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bug
} from 'lucide-react';
import EventSystemDebugger from '@/components/events/EventSystemDebugger';
import EventSystemStatus from '@/components/events/EventSystemStatus';

interface ServicesStatus {
  cleanup?: { isRunning: boolean; config?: { cleanupInterval?: number } };
  googleCalendar?: { isRunning: boolean; config?: { syncInterval?: number } };
  geminiAI?: { isRunning: boolean };
}

const EventManagementPanel: React.FC = () => {
  const {
    isInitialized,
    servicesStatus,
    initializeServices,
    stopAllServices,
    performManualCleanup,
    performManualSync,
    processEventsWithAI,
    updateServiceConfig,
    toggleService,
    runDiagnostics,
    isInitializing,
    isCleaning,
    isSyncing,
    isProcessing,
    errors,
    clearErrors
  } = useEventManagement();

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-inicializar em produção
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initializeServices();
    }
  }, [isInitialized, isInitializing, initializeServices]);

  const getStatusIcon = (isRunning: boolean, hasError: boolean = false) => {
    if (hasError) return <XCircle className="h-4 w-4 text-red-500" />;
    if (isRunning) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (isRunning: boolean, hasError: boolean = false) => {
    if (hasError) return <Badge variant="destructive">Erro</Badge>;
    if (isRunning) return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
    return <Badge variant="secondary">Inativo</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ms-primary-blue">Gerenciamento de Eventos</h2>
          <p className="text-gray-600">Controle os serviços automáticos de eventos</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Ocultar' : 'Avançado'}
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(isInitialized)}
            Status Geral dos Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-ms-primary-blue">
                {servicesStatus?.cleanup?.isRunning ? '✅' : '⏸️'}
              </div>
              <p className="text-sm text-gray-600">Limpeza Automática</p>
              {getStatusBadge(servicesStatus?.cleanup?.isRunning)}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ms-primary-blue">
                {servicesStatus?.googleCalendar?.isRunning ? '✅' : '⏸️'}
              </div>
              <p className="text-sm text-gray-600">Google Calendar</p>
              {getStatusBadge(servicesStatus?.googleCalendar?.isRunning)}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ms-primary-blue">
                {servicesStatus?.geminiAI?.isRunning ? '✅' : '⏸️'}
              </div>
              <p className="text-sm text-gray-600">Gemini AI</p>
              {getStatusBadge(servicesStatus?.geminiAI?.isRunning)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Limpeza Automática */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Limpeza Automática
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Serviço Ativo</span>
              <Switch
                checked={servicesStatus?.cleanup?.isRunning || false}
                onCheckedChange={(checked) => toggleService('cleanup', checked)}
              />
            </div>
            
            <Button
              onClick={performManualCleanup}
              disabled={isCleaning}
              className="w-full"
              variant="outline"
            >
              {isCleaning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpeza Manual
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500">
              Remove eventos finalizados automaticamente
            </p>
          </CardContent>
        </Card>

        {/* Google Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Serviço Ativo</span>
              <Switch
                checked={servicesStatus?.googleCalendar?.isRunning || false}
                onCheckedChange={(checked) => toggleService('googleCalendar', checked)}
              />
            </div>
            
            <Button
              onClick={performManualSync}
              disabled={isSyncing}
              className="w-full"
              variant="outline"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Sincronização Manual
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500">
              Sincroniza eventos do Google Calendar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gemini AI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Gemini AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Serviço Ativo</span>
            <Switch
              checked={servicesStatus?.geminiAI?.isRunning || false}
              onCheckedChange={(checked) => toggleService('geminiAI', checked)}
            />
          </div>
          
          <Button
            onClick={processEventsWithAI}
            disabled={isProcessing}
            className="w-full"
            variant="outline"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Processar com IA
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500">
            Categoriza e melhora eventos com IA
          </p>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações Avançadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Intervalo de Limpeza (horas)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  defaultValue={servicesStatus?.cleanup?.config?.cleanupInterval || 24}
                  onChange={(e) => updateServiceConfig('cleanup', { 
                    cleanupInterval: parseInt(e.target.value) 
                  })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Intervalo de Sincronização (horas)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  defaultValue={servicesStatus?.googleCalendar?.config?.syncInterval || 6}
                  onChange={(e) => updateServiceConfig('googleCalendar', { 
                    syncInterval: parseInt(e.target.value) 
                  })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            
            <Button
              onClick={runDiagnostics}
              variant="outline"
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Executar Diagnósticos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Erros */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Erros encontrados:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
              <Button
                onClick={clearErrors}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Limpar Erros
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Status do Sistema */}
      <EventSystemStatus />

      {/* Debugger do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debugger do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EventSystemDebugger />
        </CardContent>
      </Card>

      {/* Status Detalhado */}
      {servicesStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Status Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
              {JSON.stringify(servicesStatus, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventManagementPanel;
