
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Eye, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SecurityEvent {
  id: string;
  user_id: string;
  action: string;
  success: boolean;
  error_message?: string;
  metadata?: unknown;
  created_at: string;
}

const SecurityMonitor = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspiciousActivity, setSuspiciousActivity] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityData();
    
    // Set up real-time monitoring
    const interval = setInterval(fetchSecurityData, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Fetch recent security events
      const { data: events, error: eventsError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;

      setSecurityEvents(events || []);
      
      // Analyze for suspicious activity
      analyzeSuspiciousActivity(events || []);
      
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de segurança",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeSuspiciousActivity = (events: SecurityEvent[]) => {
    const suspicious = [];

    // Check for multiple failed login attempts
    const failedLogins = events.filter(event => 
      event.action.includes('login') && !event.success
    );

    if (failedLogins.length >= 5) {
      suspicious.push({
        type: 'multiple_failed_logins',
        severity: 'high',
        description: `${failedLogins.length} tentativas de login falharam recentemente`,
        timestamp: new Date().toISOString()
      });
    }

    // Check for admin operation failures
    const failedAdminOps = events.filter(event => 
      event.action.includes('admin') && !event.success
    );

    if (failedAdminOps.length > 3) {
      suspicious.push({
        type: 'admin_operation_failures',
        severity: 'medium',
        description: `${failedAdminOps.length} operações administrativas falharam`,
        timestamp: new Date().toISOString()
      });
    }

    setSuspiciousActivity(suspicious);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Alto</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Médio</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Baixo</Badge>;
    }
  };

  const getActionBadge = (action: string, success: boolean) => {
    if (!success) {
      return <Badge className="bg-red-100 text-red-800">Falhou</Badge>;
    }
    
    if (action.includes('admin')) {
      return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
    }
    
    if (action.includes('login')) {
      return <Badge className="bg-green-100 text-green-800">Login</Badge>;
    }
    
    return <Badge className="bg-blue-100 text-blue-800">Sistema</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Security Alerts */}
      {suspiciousActivity.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atividade suspeita detectada:</strong>
            <ul className="mt-2 space-y-1">
              {suspiciousActivity.map((activity, index) => (
                <li key={index} className="flex items-center gap-2">
                  {getSeverityBadge(activity.severity)}
                  {activity.description}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-600" />
            Eventos de Segurança Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Carregando eventos...
                    </TableCell>
                  </TableRow>
                ) : securityEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      Nenhum evento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  securityEvents.slice(0, 20).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.action}</TableCell>
                      <TableCell>{getActionBadge(event.action, event.success)}</TableCell>
                      <TableCell className="text-sm">
                        {event.user_id ? event.user_id.substring(0, 8) + '...' : 'Sistema'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(event.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-xs">
                        {event.error_message && (
                          <span className="text-red-600">{event.error_message}</span>
                        )}
                        {event.metadata && (
                          <details className="text-gray-600">
                            <summary className="cursor-pointer">Ver metadados</summary>
                            <pre className="text-xs mt-1 p-2 bg-gray-50 rounded">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Login Activity Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="mr-2 h-5 w-5 text-green-600" />
            Análise de Atividade de Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800">Logins Bem-sucedidos</h4>
              <p className="text-2xl font-bold text-green-600">
                {securityEvents.filter(e => e.action.includes('login') && e.success).length}
              </p>
              <p className="text-sm text-green-600">Últimas 24h</p>
            </div>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800">Tentativas Falharam</h4>
              <p className="text-2xl font-bold text-red-600">
                {securityEvents.filter(e => e.action.includes('login') && !e.success).length}
              </p>
              <p className="text-sm text-red-600">Últimas 24h</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800">Operações Admin</h4>
              <p className="text-2xl font-bold text-blue-600">
                {securityEvents.filter(e => e.action.includes('admin')).length}
              </p>
              <p className="text-sm text-blue-600">Últimas 24h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;
