import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { fallbackService } from '@/services/admin/fallbackService';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  platform: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
}

export default function SystemMonitoring() {
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatus();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const [viajarConfig, descubraConfig] = await Promise.all([
        fallbackService.getFallbackConfig('viajar').catch(() => null),
        fallbackService.getFallbackConfig('descubra_ms').catch(() => null),
      ]);

      const systemsData: SystemStatus[] = [];
      
      if (viajarConfig) {
        systemsData.push({
          platform: 'ViaJAR',
          status: viajarConfig.status,
          lastCheck: viajarConfig.last_check || new Date().toISOString(),
        });
      }

      if (descubraConfig) {
        systemsData.push({
          platform: 'Descubra MS',
          status: descubraConfig.status,
          lastCheck: descubraConfig.last_check || new Date().toISOString(),
        });
      }

      setSystems(systemsData);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao verificar status',
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoramento do Sistema</h2>
          <p className="text-gray-600 mt-1">Status e saúde dos sistemas</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-8">Carregando...</div>
        ) : (
          systems.map((system) => (
            <Card key={system.platform}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{system.platform}</CardTitle>
                  {getStatusIcon(system.status)}
                </div>
                <CardDescription>Status do sistema {system.platform}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(system.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Última Verificação</span>
                  <span className="text-sm text-gray-600">
                    {new Date(system.lastCheck).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Verificação automática a cada 30 segundos
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
