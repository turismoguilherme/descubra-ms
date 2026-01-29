import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Clock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SecurityAlert {
  id: string;
  type: 'rate_limit_exceeded' | 'suspicious_pattern' | 'privilege_escalation' | 'brute_force';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export const SecurityAlertMonitor: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
    
    if (isMonitoring) {
      const interval = setInterval(fetchAlerts, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const fetchAlerts = async () => {
    try {
      // Get security events from the last 24 hours
      const { data: securityEvents, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .or('action.ilike.%suspicious%,action.ilike.%rate_limit%,action.ilike.%privilege%,action.ilike.%unauthorized%')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform security events into alerts
      const transformedAlerts: SecurityAlert[] = (securityEvents || []).map(event => ({
        id: event.id,
        type: getAlertType(event.action),
        severity: getSeverityFromAction(event.action),
        message: generateAlertMessage(event),
        timestamp: new Date(event.created_at),
        resolved: event.success,
        metadata: event.error_message ? { error: event.error_message } : undefined
      }));

      setAlerts(transformedAlerts);
      setLastUpdate(new Date());

      // Check for critical alerts and show notifications
      const criticalAlerts = transformedAlerts.filter(
        alert => alert.severity === 'critical' && !alert.resolved
      );

      if (criticalAlerts.length > 0) {
        toast({
          title: "🚨 Alerta Crítico de Segurança",
          description: `${criticalAlerts.length} alertas críticos detectados!`,
          variant: "destructive",
          duration: 10000,
        });
      }

    } catch (error: unknown) {
      console.error('Failed to fetch security alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertType = (action: string): SecurityAlert['type'] => {
    if (action.includes('rate_limit')) return 'rate_limit_exceeded';
    if (action.includes('privilege')) return 'privilege_escalation';
    if (action.includes('brute') || action.includes('login')) return 'brute_force';
    return 'suspicious_pattern';
  };

  const getSeverityFromAction = (action: string): SecurityAlert['severity'] => {
    if (action.includes('critical') || action.includes('privilege_escalation')) return 'critical';
    if (action.includes('unauthorized') || action.includes('rate_limit_exceeded')) return 'high';
    if (action.includes('suspicious')) return 'medium';
    return 'low';
  };

  const generateAlertMessage = (event: unknown): string => {
    const action = event.action;
    if (action.includes('rate_limit_exceeded')) {
      return 'Limite de tentativas excedido - acesso temporariamente bloqueado';
    }
    if (action.includes('privilege_escalation')) {
      return 'Tentativa de escalação de privilégios detectada';
    }
    if (action.includes('unauthorized')) {
      return 'Tentativa de acesso não autorizado';
    }
    if (action.includes('suspicious')) {
      return 'Atividade suspeita detectada';
    }
    return `Evento de segurança: ${action}`;
  };

  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <Shield className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast({
      title: isMonitoring ? "Monitoramento Pausado" : "Monitoramento Ativado",
      description: isMonitoring 
        ? "Alertas não serão atualizados automaticamente" 
        : "Monitoramento em tempo real ativado",
      variant: isMonitoring ? "destructive" : "default",
    });
  };

  const refreshAlerts = () => {
    setLoading(true);
    fetchAlerts();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monitor de Alertas de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando alertas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Monitor de Alertas de Segurança
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real de eventos de segurança críticos
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMonitoring}
              className="flex items-center gap-2"
            >
              {isMonitoring ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isMonitoring ? 'Pausar' : 'Ativar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAlerts}
              disabled={loading}
            >
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isMonitoring ? 'Monitoramento Ativo' : 'Monitoramento Pausado'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            <Clock className="w-3 h-3 inline mr-1" />
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {alerts.length > 0 ? (
            alerts.map(alert => (
              <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-500 bg-red-50' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Badge className={`${getSeverityColor(alert.severity)} text-white`}>
                      {getSeverityIcon(alert.severity)}
                      <span className="ml-1">{alert.severity.toUpperCase()}</span>
                    </Badge>
                    <div className="flex-1">
                      <AlertDescription className="font-medium">
                        {alert.message}
                      </AlertDescription>
                      <div className="text-xs text-muted-foreground mt-1">
                        {alert.timestamp.toLocaleString('pt-BR')}
                        {alert.metadata?.error && (
                          <span className="ml-2 text-red-600">• {alert.metadata.error}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={alert.resolved ? 'default' : 'destructive'}>
                    {alert.resolved ? 'Resolvido' : 'Ativo'}
                  </Badge>
                </div>
              </Alert>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum alerta de segurança nas últimas 24 horas</p>
              <p className="text-xs">Sistema operando normalmente</p>
            </div>
          )}
        </div>

        {/* Summary */}
        {alerts.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-4 gap-4 text-center">
              {['low', 'medium', 'high', 'critical'].map(severity => {
                const count = alerts.filter(a => a.severity === severity).length;
                return (
                  <div key={severity} className="text-sm">
                    <div className={`w-4 h-4 rounded mx-auto mb-1 ${getSeverityColor(severity as any)}`} />
                    <div className="font-medium">{count}</div>
                    <div className="text-xs text-muted-foreground capitalize">{severity}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};