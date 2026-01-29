import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { passportAdminService } from '@/services/admin/passportAdminService';
import { Users, Route, MapPin, Gift } from 'lucide-react';

const PassportAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔵 [PassportAnalytics] Componente montado, carregando estatísticas...');
    loadStats();
  }, []);

  // Log de renderização apenas quando estados importantes mudam
  useEffect(() => {
    console.log('🔵 [PassportAnalytics] Estado atual:', {
      loading,
      stats,
    });
  }, [loading, stats]);

  const loadStats = async () => {
    console.log('🔵 [PassportAnalytics] ========== loadStats INICIADO ==========');
    try {
      console.log('🔵 [PassportAnalytics] Buscando estatísticas...');
      const data = await passportAdminService.getStatistics();
      console.log('✅ [PassportAnalytics] Estatísticas carregadas:', data);
      setStats(data);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PassportAnalytics] Erro completo ao carregar estatísticas:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack,
      });
    } finally {
      setLoading(false);
      console.log('🔵 [PassportAnalytics] loadStats finalizado');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando estatísticas...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários com Passaporte</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Check-ins Realizados</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total_checkins || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rotas Completadas</CardTitle>
          <Route className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.completed_routes || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recompensas Desbloqueadas</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.rewards_unlocked || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PassportAnalytics;

