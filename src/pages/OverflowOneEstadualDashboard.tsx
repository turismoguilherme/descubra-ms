import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Activity, Target, Users, TrendingUp, MapPin, Calendar, Settings } from 'lucide-react';
import { useOverflowOneAuth } from '@/hooks/useOverflowOneAuth';

const OverflowOneEstadualDashboard: React.FC = () => {
  const { user } = useOverflowOneAuth();
  
  // Dados simulados para o dashboard
  const estadualData = {
    totalVisitors: 125000,
    municipalities: 45,
    activeRoutes: 8,
    revenue: 18500000,
    satisfaction: 4.8,
    coverage: 78
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold">Dashboard Estadual</h1>
                <p className="text-muted-foreground">
                  Coordenação Estadual de Turismo - {user?.company_name || 'Mato Grosso do Sul'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-purple-600">
                Gestor Estadual
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitantes no Estado</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadualData.totalVisitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +22% em relação ao período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Municípios Ativos</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadualData.municipalities}</div>
                <p className="text-xs text-muted-foreground">
                  Com turismo ativo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Roteiros Ativos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadualData.activeRoutes}</div>
                <p className="text-xs text-muted-foreground">
                  Interestaduais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Estadual</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {(estadualData.revenue / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground">
                  Este período
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Metas e Indicadores */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cobertura Estadual</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadualData.coverage}%</div>
                <p className="text-xs text-muted-foreground">
                  Dos municípios ativos
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">
                  Índice de satisfação
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Metas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  Atingidas este trimestre
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center gap-2">
                  <Globe className="h-6 w-6" />
                  <span>Novo Roteiro</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <MapPin className="h-6 w-6" />
                  <span>Coordenar Região</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <Activity className="h-6 w-6" />
                  <span>Relatórios Estaduais</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <Settings className="h-6 w-6" />
                  <span>Configurações</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OverflowOneEstadualDashboard;
