import React, { useEffect, useState } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  componentStack?: string;
}

class ErrorMonitor {
  private errors: ErrorInfo[] = [];
  private listeners: ((errors: ErrorInfo[]) => void)[] = [];

  addError(error: Error, errorInfo?: any) {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      componentStack: errorInfo?.componentStack
    };

    this.errors.push(errorData);
    this.notifyListeners();

    // Manter apenas os últimos 50 erros
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }

    // Log para console
    console.error('🚨 ErrorMonitor: Erro capturado:', errorData);

    // Enviar para serviço de monitoramento (se disponível)
    this.sendToMonitoringService(errorData);
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
    this.notifyListeners();
  }

  subscribe(listener: (errors: ErrorInfo[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.errors));
  }

  private sendToMonitoringService(errorData: ErrorInfo) {
    // Enviar para Google Analytics (se disponível)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: errorData.message,
        fatal: false
      });
    }

    // Enviar para Sentry (se disponível)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(errorData.message));
    }

    // Enviar para serviço customizado (se disponível)
    if (typeof window !== 'undefined' && (window as any).errorReportingService) {
      (window as any).errorReportingService.report(errorData);
    }
  }
}

// Instância global do monitor
export const errorMonitor = new ErrorMonitor();

// Hook para usar o monitor
export const useErrorMonitor = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  useEffect(() => {
    const unsubscribe = errorMonitor.subscribe(setErrors);
    return unsubscribe;
  }, []);

  return {
    errors,
    clearErrors: () => errorMonitor.clearErrors(),
    addError: (error: Error, errorInfo?: any) => errorMonitor.addError(error, errorInfo)
  };
};

// Componente para exibir erros em tempo real (apenas em desenvolvimento)
export const ErrorMonitorPanel: React.FC = () => {
  const { errors, clearErrors } = useErrorMonitor();

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-100 border border-red-300 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-red-800">Erros Capturados</h3>
          <button
            onClick={clearErrors}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Limpar
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {errors.slice(-5).map((error, index) => (
            <div key={index} className="bg-red-50 p-2 rounded text-xs">
              <div className="font-medium text-red-700">{error.message}</div>
              <div className="text-red-600 text-xs mt-1">
                {new Date(error.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default errorMonitor;
