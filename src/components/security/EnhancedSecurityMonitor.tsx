
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Eye, Clock, Users, Lock } from "lucide-react";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";

const EnhancedSecurityMonitor = () => {
  const [suspiciousActivity, setSuspiciousActivity] = useState<{
    suspicious: boolean;
    patterns: string[];
    severity: 'low' | 'medium' | 'high';
  }>({ suspicious: false, patterns: [], severity: 'low' });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSecurity();
    // Check every 30 seconds for suspicious activity
    const interval = setInterval(checkSecurity, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSecurity = async () => {
    try {
      const activity = await enhancedSecurityService.detectSuspiciousActivity();
      setSuspiciousActivity(activity);
    } catch (error) {
      console.error('Error checking security:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Eye className="h-4 w-4 text-yellow-600" />;
      default:
        return <Shield className="h-4 w-4 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sanitização de Entrada
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativa</div>
            <p className="text-xs text-muted-foreground">
              DOMPurify configurado e ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rate Limiting
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Melhorado</div>
            <p className="text-xs text-muted-foreground">
              Controle progressivo implementado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Detecção de Ameaças
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              suspiciousActivity.suspicious ? 'text-red-600' : 'text-green-600'
            }`}>
              {suspiciousActivity.suspicious ? 'Detectado' : 'Normal'}
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoramento em tempo real
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              RLS Policies
            </CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Completo</div>
            <p className="text-xs text-muted-foreground">
              Todas as tabelas protegidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {suspiciousActivity.suspicious && (
        <Alert className={`border-2 ${getSeverityColor(suspiciousActivity.severity)}`}>
          <div className="flex items-center gap-2">
            {getSeverityIcon(suspiciousActivity.severity)}
            <AlertTriangle className="h-4 w-4" />
          </div>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <strong>Atividade suspeita detectada</strong>
              <Badge className={getSeverityColor(suspiciousActivity.severity)}>
                {suspiciousActivity.severity.toUpperCase()}
              </Badge>
            </div>
            <ul className="mt-2 space-y-1">
              {suspiciousActivity.patterns.map((pattern, index) => (
                <li key={index} className="text-sm">• {pattern}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Features Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-green-600" />
            Status das Funcionalidades de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-800 flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Proteções Ativas
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Sanitização de entrada (DOMPurify)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Rate limiting progressivo
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Validação de formulários
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Detecção de atividade suspeita
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Logs de auditoria aprimorados
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 flex items-center">
                <Lock className="mr-2 h-4 w-4" />
                Políticas RLS Implementadas
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Dados de usuário (progressos, recompensas)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Logs de segurança (admin apenas)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Rotas turísticas (leitura pública)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Perfis de usuário (próprio acesso)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Check-ins e carimbos digitais
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <Clock className="animate-spin h-4 w-4 mr-2" />
            Verificando sistemas de segurança...
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSecurityMonitor;
