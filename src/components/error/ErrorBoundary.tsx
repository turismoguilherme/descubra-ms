import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { errorMonitor } from '@/services/ErrorMonitor';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de erro
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para debugging
    console.error('🚨 ErrorBoundary: Erro capturado:', error);
    console.error('🚨 ErrorBoundary: Error Info:', errorInfo);
    
    // Adicionar ao monitor de erros
    errorMonitor.addError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Callback personalizado para tratamento de erro
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleDebug = () => {
    // Abrir console do navegador
    console.log('🐛 Debug Info:', {
      error: this.state.error,
      errorInfo: this.state.errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Copiar informações para clipboard
    const debugInfo = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
      .then(() => alert('Informações de debug copiadas para a área de transferência!'))
      .catch(() => console.log('Debug info:', debugInfo));
  };

  render() {
    if (this.state.hasError) {
      // Se há um fallback personalizado, use-o
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI padrão de erro
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Oops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
                </p>
                
                {this.state.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-red-800 mb-2">Detalhes do Erro:</h3>
                    <p className="text-red-700 text-sm font-mono">
                      {this.state.error.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Ir para Início
                </Button>
                
                <Button 
                  variant="secondary"
                  onClick={this.handleDebug}
                  className="flex items-center gap-2"
                >
                  <Bug className="h-4 w-4" />
                  Debug Info
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>
                  Se o problema persistir, entre em contato com o suporte técnico.
                </p>
                <p className="mt-1">
                  Erro ID: {Date.now().toString(36)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
