import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Globe, 
  Users,
  Lock,
  Eye,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SecurityMetric {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface SecurityEvent {
  id: string;
  action: string;
  created_at: string;
  success: boolean;
  user_id?: string;
  ip_address?: unknown;
  user_agent?: string;
  error_message?: string;
}

export const EnhancedSecurityMetrics = () => {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityMetrics();
    const interval = setInterval(loadSecurityMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      // Get recent security events
      const { data: events, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setRecentEvents(events || []);

      // Calculate metrics
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const events24h = events?.filter(e => new Date(e.created_at) > last24h) || [];
      const eventsWeek = events?.filter(e => new Date(e.created_at) > lastWeek) || [];
      
      const failedLogins24h = events24h.filter(e => 
        e.action.includes('login') && !e.success
      ).length;

      const uniqueIPs24h = new Set(
        events24h.filter(e => e.ip_address).map(e => e.ip_address)
      ).size;

      const suspiciousActivities = events24h.filter(e => 
        e.action.includes('suspicious') || 
        e.action.includes('unauthorized') || 
        e.action.includes('blocked')
      ).length;

      const adminOperations24h = events24h.filter(e => 
        e.action.includes('admin') || 
        e.action.includes('role_change') ||
        e.action.includes('user_created')
      ).length;

      const calculatedMetrics: SecurityMetric[] = [
        {
          title: "Tentativas de Login Falhadas",
          value: failedLogins24h,
          trend: failedLogins24h > 10 ? 'up' : 'stable',
          icon: <Lock className="h-4 w-4" />,
          severity: failedLogins24h > 20 ? 'error' : failedLogins24h > 10 ? 'warning' : 'success'
        },
        {
          title: "IPs Únicos (24h)",
          value: uniqueIPs24h,
          trend: 'stable',
          icon: <Globe className="h-4 w-4" />,
          severity: 'info'
        },
        {
          title: "Atividades Suspeitas",
          value: suspiciousActivities,
          trend: suspiciousActivities > 0 ? 'up' : 'stable',
          icon: <AlertTriangle className="h-4 w-4" />,
          severity: suspiciousActivities > 5 ? 'error' : suspiciousActivities > 0 ? 'warning' : 'success'
        },
        {
          title: "Operações Admin (24h)",
          value: adminOperations24h,
          trend: 'stable',
          icon: <Users className="h-4 w-4" />,
          severity: 'info'
        },
        {
          title: "Total de Eventos (7d)",
          value: eventsWeek.length,
          trend: 'stable',
          icon: <Activity className="h-4 w-4" />,
          severity: 'info'
        },
        {
          title: "Taxa de Sucesso",
          value: `${Math.round((events24h.filter(e => e.success).length / Math.max(events24h.length, 1)) * 100)}%`,
          trend: 'stable',
          icon: <TrendingUp className="h-4 w-4" />,
          severity: 'success'
        }
      ];

      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error loading security metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string, success: boolean) => {
    if (!success) {
      return <Badge variant="destructive">Falha</Badge>;
    }

    if (action.includes('login')) {
      return <Badge variant="outline" className="border-green-500 text-green-600">Login</Badge>;
    }
    if (action.includes('admin')) {
      return <Badge variant="outline" className="border-blue-500 text-blue-600">Admin</Badge>;
    }
    if (action.includes('suspicious')) {
      return <Badge variant="destructive">Suspeito</Badge>;
    }
    return <Badge variant="secondary">Sistema</Badge>;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 border-red-200 bg-red-50';
      case 'warning': return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'success': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-blue-600 border-blue-200 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card key={index} className={`${getSeverityColor(metric.severity)} border`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center mt-2">
                <TrendingUp 
                  className={`h-3 w-3 mr-1 ${
                    metric.trend === 'up' ? 'text-red-500' : 
                    metric.trend === 'down' ? 'text-green-500' : 
                    'text-gray-500'
                  }`} 
                />
                <span className="text-xs text-muted-foreground">
                  {metric.trend === 'up' ? 'Aumentando' : 
                   metric.trend === 'down' ? 'Diminuindo' : 'Estável'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Eventos de Segurança Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getActionBadge(event.action, event.success)}
                  <div>
                    <p className="text-sm font-medium">{event.action}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleString('pt-BR')}
                      {event.ip_address && ` • ${event.ip_address}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Shield className={`h-4 w-4 ${event.success ? 'text-green-500' : 'text-red-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Sistema de monitoramento ativo. Todas as atividades são registradas e analisadas em tempo real 
          para detectar comportamentos suspeitos e garantir a segurança da plataforma.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EnhancedSecurityMetrics;