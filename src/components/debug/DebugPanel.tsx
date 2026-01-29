import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  RefreshCw, 
  Copy, 
  Download, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface DebugInfo {
  timestamp: string;
  url: string;
  userAgent: string;
  localStorage: Record<string, any>;
  sessionStorage: Record<string, any>;
  authState: unknown;
  routeState: unknown;
  errors: Error[];
  warnings: string[];
}

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);

  const collectDebugInfo = (): DebugInfo => {
    const info: DebugInfo = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      localStorage: {},
      sessionStorage: {},
      authState: null,
      routeState: null,
      errors: [],
      warnings: []
    };

    // Coletar localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            info.localStorage[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            info.localStorage[key] = localStorage.getItem(key);
          }
        }
      }
    } catch (error) {
      info.warnings.push('Erro ao acessar localStorage');
    }

    // Coletar sessionStorage
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          try {
            info.sessionStorage[key] = JSON.parse(sessionStorage.getItem(key) || '');
          } catch {
            info.sessionStorage[key] = sessionStorage.getItem(key);
          }
        }
      }
    } catch (error) {
      info.warnings.push('Erro ao acessar sessionStorage');
    }

    // Coletar estado de autenticação (se disponível)
    try {
      const testUserId = localStorage.getItem('test_user_id');
      const testUserData = localStorage.getItem('test_user_data');
      info.authState = {
        testUserId,
        testUserData: testUserData ? JSON.parse(testUserData) : null,
        hasAuthProvider: typeof window !== 'undefined' && 'React' in window
      };
    } catch (error) {
      info.warnings.push('Erro ao coletar estado de autenticação');
    }

    // Coletar estado da rota
    try {
      info.routeState = {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        referrer: document.referrer
      };
    } catch (error) {
      info.warnings.push('Erro ao coletar estado da rota');
    }

    return info;
  };

  const refreshDebugInfo = () => {
    setDebugInfo(collectDebugInfo());
  };

  const copyToClipboard = async () => {
    if (!debugInfo) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
      alert('Informações de debug copiadas para a área de transferência!');
    } catch (error) {
      console.log('Debug info:', debugInfo);
      alert('Informações de debug exibidas no console!');
    }
  };

  const downloadDebugInfo = () => {
    if (!debugInfo) return;
    
    const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-info-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const maskSensitiveData = (data: unknown): unknown => {
    if (!showSensitive) {
      if (typeof data === 'string' && data.length > 10) {
        return data.substring(0, 10) + '***';
      }
      if (typeof data === 'object' && data !== null) {
        const masked: unknown = {};
        for (const [key, value] of Object.entries(data)) {
          if (key.toLowerCase().includes('password') || 
              key.toLowerCase().includes('token') || 
              key.toLowerCase().includes('secret')) {
            masked[key] = '***MASKED***';
          } else {
            masked[key] = maskSensitiveData(value);
          }
        }
        return masked;
      }
    }
    return data;
  };

  useEffect(() => {
    if (isOpen) {
      refreshDebugInfo();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white shadow-lg"
        >
          <Bug className="h-4 w-4" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Painel de Debug
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
            >
              {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSensitive ? 'Ocultar' : 'Mostrar'} Sensível
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshDebugInfo}
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadDebugInfo}
            >
              <Download className="h-4 w-4" />
              Baixar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[60vh]">
          {debugInfo ? (
            <div className="space-y-4">
              {/* Status Geral */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Timestamp</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{debugInfo.timestamp}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">URL</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 break-all">{debugInfo.url}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {debugInfo.warnings.length > 0 ? (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {debugInfo.warnings.length > 0 ? `${debugInfo.warnings.length} avisos` : 'OK'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Estado de Autenticação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado de Autenticação</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(maskSensitiveData(debugInfo.authState), null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Estado da Rota */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado da Rota</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugInfo.routeState, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* LocalStorage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">LocalStorage</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(maskSensitiveData(debugInfo.localStorage), null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* SessionStorage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SessionStorage</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(maskSensitiveData(debugInfo.sessionStorage), null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Avisos */}
              {debugInfo.warnings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Avisos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {debugInfo.warnings.map((warning, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Coletando informações de debug...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPanel;
