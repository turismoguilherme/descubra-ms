// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle, XCircle, Server, Database, Cloud, Activity, TrendingUp } from 'lucide-react';
import { fallbackService } from '@/services/admin/fallbackService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { systemHealthService } from '@/services/admin/systemHealthService';
import { checkApiAvailability } from '@/services/tourism/fetchCompatible';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';

interface SystemStatus {
  platform: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'checking';
  latency?: number;
  icon: React.ComponentType<{ className?: string }>;
}

export default function SystemMonitoring() {
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeEvents: 0,
    totalRequests: 0,
    uptime: 99.9, // Inicializar com valor padrão
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStatus();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkService = async (name: string): Promise<{ status: 'online' | 'offline'; latency?: number }> => {
    const startTime = Date.now();
    try {
      if (name === 'Supabase') {
        // Usar uma tabela que realmente existe no Supabase
        const { error } = await supabase.from('user_profiles').select('id').limit(1);
        if (error) throw error;
        return { status: 'online', latency: Date.now() - startTime };
      }
      if (name === 'API Backend') {
        // Em desenvolvimento local, não verificar API externa para evitar erros CORS no console
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isDevelopment) {
          // Em desenvolvimento, retornar como offline sem fazer requisição
          return { status: 'offline', latency: 0 };
        }
        
        // Em produção, verificar normalmente
        try {
          const isAvailable = await checkApiAvailability();
          const latency = Date.now() - startTime;
          return { status: isAvailable ? 'online' : 'offline', latency };
        } catch (error: unknown) {
          // CORS errors são esperados quando APIs externas não permitem localhost
          const err = error instanceof Error ? error : new Error(String(error));
          if (err.message?.includes('CORS') || err.message?.includes('Failed to fetch')) {
            return { status: 'offline', latency: Date.now() - startTime };
          }
          throw error;
        }
      }
      if (name === 'CDN') {
        // Verificar CDN através do Supabase Storage
        const { error } = await supabase.storage.listBuckets();
        const latency = Date.now() - startTime;
        return { status: error ? 'offline' : 'online', latency };
      }
      return { status: 'online', latency: Date.now() - startTime };
    } catch {
      return { status: 'offline' };
    }
  };

  const fetchStatus = async () => {
    try {
      // Log para verificação - mostrar que estamos buscando dados reais
      console.log('🔍 [SystemMonitoring] Buscando dados REAIS do sistema...');
      
      const [viajarConfig, descubraConfig, servicesStatus, statsData, uptimeData] = await Promise.all([
        fallbackService.getFallbackConfig('viajar').catch(() => null),
        fallbackService.getFallbackConfig('descubra_ms').catch(() => null),
        Promise.all([
          checkService('Supabase').then(result => {
            console.log('✅ [SystemMonitoring] Banco de Dados:', result);
            return { name: 'Banco de Dados', status: result.status, latency: result.latency, icon: Database };
          }),
          checkService('API Backend').then(result => {
            console.log('✅ [SystemMonitoring] API Backend:', result);
            return { name: 'API Backend', status: result.status, latency: result.latency, icon: Server };
          }),
          checkService('CDN').then(result => {
            console.log('✅ [SystemMonitoring] CDN:', result);
            return { name: 'CDN', status: result.status, latency: result.latency, icon: Cloud };
          }),
        ]),
        Promise.all([
          supabase.from('user_profiles').select('id', { count: 'exact', head: true }).then(result => {
            console.log('✅ [SystemMonitoring] Total de Usuários (REAL):', result.count);
            return result;
          }).catch(() => ({ count: 0 })),
          supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_visible', true).then(result => {
            console.log('✅ [SystemMonitoring] Eventos Ativos (REAL):', result.count);
            return result;
          }).catch(() => ({ count: 0 })),
        ]),
        systemHealthService.calculateUptime24h().then(uptime => {
          console.log('✅ [SystemMonitoring] Uptime 24h (REAL do banco):', uptime + '%');
          return uptime;
        }).catch(() => {
          console.warn('⚠️ [SystemMonitoring] Erro ao calcular uptime, usando fallback');
          return 99.9;
        }),
      ]);

      const systemsData: SystemStatus[] = [];
      
      if (viajarConfig) {
        systemsData.push({
          platform: 'ViajARTur',
          status: viajarConfig.status,
          lastCheck: viajarConfig.last_check || new Date().toISOString(),
        });
      } else {
        systemsData.push({
          platform: 'ViajARTur',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
        });
      }

      if (descubraConfig) {
        systemsData.push({
          platform: 'Descubra MS',
          status: descubraConfig.status,
          lastCheck: descubraConfig.last_check || new Date().toISOString(),
        });
      } else {
        systemsData.push({
          platform: 'Descubra MS',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
        });
      }

      setSystems(systemsData);
      setServices(servicesStatus as ServiceStatus[]);
      
      const [usersResult, eventsResult] = statsData;
      setStats({
        totalUsers: (usersResult as any)?.count || 0,
        activeEvents: (eventsResult as any)?.count || 0,
        totalRequests: 0,
        uptime: uptimeData as number,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao verificar status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-600">Online</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-600">Degradado</Badge>;
      case 'down':
        return <Badge className="bg-red-600">Offline</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="Monitoramento"
          description="Visualize métricas de performance e saúde do sistema em tempo real."
          helpText="Visualize métricas de performance e saúde do sistema em tempo real."
        />
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase">Usuários Totais</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700 uppercase">Eventos Ativos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeEvents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700 uppercase">Uptime</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.uptime.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status das plataformas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Plataformas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-8 text-gray-500">Carregando...</div>
          ) : (
            systems.map((system) => (
              <Card key={system.platform} className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{system.platform}</CardTitle>
                    {getStatusIcon(system.status)}
                  </div>
                  <CardDescription>Status do sistema {system.platform}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    {getStatusBadge(system.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Última Verificação</span>
                    <span className="text-sm text-gray-900">
                      {new Date(system.lastCheck).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Status dos serviços */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Serviços</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => {
            const ServiceIcon = service.icon;
            return (
              <Card key={service.name} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        service.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <ServiceIcon className={`w-5 h-5 ${
                          service.status === 'online' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.latency && (
                          <p className="text-xs text-gray-500">{service.latency}ms</p>
                        )}
                      </div>
                    </div>
                    {service.status === 'online' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {systems.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Nenhum sistema configurado para monitoramento
          </CardContent>
        </Card>
      )}
    </div>
  );
}
