import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Globe, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  HeadphonesIcon,
  FileText,
  Activity
} from 'lucide-react';
import { AIMasterPanel } from './AIMasterPanel';

export const MasterDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Master */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">FlowTrip Master Admin</h1>
            <p className="text-muted-foreground">
              Painel de controle SaaS - Gestão completa de múltiplos estados
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <Globe className="w-4 h-4 mr-2" />
          Acesso Global
        </Badge>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados Ativos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              +0% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 15.750</div>
            <p className="text-xs text-muted-foreground">
              +8% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24%</div>
            <p className="text-xs text-muted-foreground">
              Crescimento mensal médio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navegação Rápida */}
      <Card>
        <CardHeader>
          <CardTitle>🎛️ Controle Master FlowTrip</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Globe className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Estados</div>
                <div className="text-xs text-muted-foreground">Gerenciar clientes</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Usuários</div>
                <div className="text-xs text-muted-foreground">Gestão global</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Faturamento</div>
                <div className="text-xs text-muted-foreground">Contratos & billing</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <HeadphonesIcon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Suporte</div>
                <div className="text-xs text-muted-foreground">Atendimento master</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <Activity className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Analytics</div>
                <div className="text-xs text-muted-foreground">Performance global</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Relatórios</div>
                <div className="text-xs text-muted-foreground">Reports automáticos</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <Settings className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Configurações</div>
                <div className="text-xs text-muted-foreground">Sistema global</div>
              </div>
            </Button>

            <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-primary to-secondary">
              <Crown className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">IA Master</div>
                <div className="text-xs">Inteligência artificial</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* IA Master Panel */}
      <AIMasterPanel />
    </div>
  );
};