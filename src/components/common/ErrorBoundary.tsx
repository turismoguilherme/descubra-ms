import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log do erro para monitoramento
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Log estruturado para facilitar debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Enviar erro para o console local
    console.group('🚨 Erro Capturado pelo ErrorBoundary');
    console.error('Erro ID:', this.state.errorId);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Callback personalizado para tratamento de erro
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Tentar enviar erro para serviço de monitoramento (se configurado)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const errorHistory = JSON.parse(localStorage.getItem('app_errors') || '[]');
        errorHistory.push(errorLog);
        
        // Manter apenas os últimos 10 erros
        if (errorHistory.length > 10) {
          errorHistory.splice(0, errorHistory.length - 10);
        }
        
        localStorage.setItem('app_errors', JSON.stringify(errorHistory));
      }
    } catch (storageError) {
      console.warn('Não foi possível salvar o erro no localStorage:', storageError);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: ''
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReloadPage = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Se um fallback personalizado foi fornecido, use-o
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Oops! Algo deu errado</CardTitle>
              <CardDescription>
                Encontramos um erro inesperado. Não se preocupe, estamos trabalhando para resolver isso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>ID do Erro:</strong> {this.state.errorId}
                  <br />
                  <strong>Mensagem:</strong> {this.state.error?.message || 'Erro desconhecido'}
                </AlertDescription>
              </Alert>

              <div className="grid gap-3 sm:grid-cols-3">
                <Button onClick={this.handleRetry} variant="default" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button onClick={this.handleReloadPage} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar Página
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Home
                </Button>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Detalhes técnicos (desenvolvimento)
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Stack Trace:</h4>
                      <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <h4 className="font-medium text-sm">Component Stack:</h4>
                        <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Se o problema persistir, entre em contato com o suporte técnico 
                  informando o ID do erro: <code className="bg-muted px-1 rounded">{this.state.errorId}</code>
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

// Hook para usar o ErrorBoundary de forma mais simples
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) => {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;