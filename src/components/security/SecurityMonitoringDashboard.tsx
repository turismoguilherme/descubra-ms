import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Activity, Lock, Eye, RefreshCw } from "lucide-react";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SecurityAlert {
  id: string;
  type: 'rate_limit' | 'suspicious_activity' | 'failed_auth' | 'privilege_escalation';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface SecurityMetrics {
  totalEvents: number;
  failedLogins: number;
  blockedAttempts: number;
  suspiciousActivities: number;
  lastUpdate: Date;
}

export const SecurityMonitoringDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSecurityData = async () => {
    try {
      setIsRefreshing(true);
      
      // Fetch security audit logs
      const { data: auditLogs, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching security data:', error);
        return;
      }

      // Calculate metrics
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentLogs = auditLogs?.filter(log => 
        new Date(log.created_at!) > last24h
      ) || [];

      const newMetrics: SecurityMetrics = {
        totalEvents: recentLogs.length,
        failedLogins: recentLogs.filter(log => 
          log.action.includes('login') && !log.success
        ).length,
        blockedAttempts: recentLogs.filter(log => 
          log.action.includes('rate_limit_blocked')
        ).length,
        suspiciousActivities: recentLogs.filter(log => 
          log.action.includes('suspicious_activity')
        ).length,
        lastUpdate: now
      };

      setMetrics(newMetrics);

      // Generate alerts based on patterns
      const newAlerts: SecurityAlert[] = [];
      
      if (newMetrics.failedLogins > 10) {
        newAlerts.push({
          id: `failed_logins_${Date.now()}`,
          type: 'failed_auth',
          severity: 'high',
          message: `${newMetrics.failedLogins} tentativas de login falharam nas últimas 24h`,
          timestamp: now,
          resolved: false
        });
      }

      if (newMetrics.blockedAttempts > 5) {
        newAlerts.push({
          id: `blocked_attempts_${Date.now()}`,
          type: 'rate_limit',
          severity: 'medium',
          message: `${newMetrics.blockedAttempts} tentativas foram bloqueadas por rate limiting`,
          timestamp: now,
          resolved: false
        });
      }

      // Check for suspicious activity patterns
      const suspiciousActivityCheck = await enhancedSecurityService.detectSuspiciousActivity();
      if (suspiciousActivityCheck.suspicious) {
        newAlerts.push({
          id: `suspicious_${Date.now()}`,
          type: 'suspicious_activity',
          severity: suspiciousActivityCheck.severity,
          message: `Atividade suspeita detectada: ${suspiciousActivityCheck.patterns.join(', ')}`,
          timestamp: now,
          resolved: false
        });
      }

      setAlerts(prevAlerts => [...newAlerts, ...prevAlerts.slice(0, 10)]);
      
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Erro no monitoramento",
        description: "Falha ao carregar dados de segurança",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rate_limit': return <Shield className="w-4 h-4" />;
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4" />;
      case 'failed_auth': return <Lock className="w-4 h-4" />;
      case 'privilege_escalation': return <Eye className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    fetchSecurityData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchSecurityData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monitoramento de Segurança</h2>
        <Button 
          onClick={fetchSecurityData} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eventos Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Logins Falhados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.failedLogins || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tentativas Bloqueadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics?.blockedAttempts || 0}</div>
            <p className="text-xs text-muted-foreground">Rate limiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atividades Suspeitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics?.suspiciousActivities || 0}</div>
            <p className="text-xs text-muted-foreground">Detectadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas de Segurança
          </CardTitle>
          <CardDescription>
            Eventos de segurança que requerem atenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum alerta de segurança no momento
              </p>
            ) : (
              alerts.slice(0, 10).map((alert) => (
                <Alert 
                  key={alert.id} 
                  className={`${alert.resolved ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <AlertDescription>{alert.message}</AlertDescription>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolver
                      </Button>
                    )}
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Última atualização: {metrics?.lastUpdate.toLocaleString()}</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Sistema operacional</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoringDashboard;