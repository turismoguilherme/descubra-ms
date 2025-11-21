import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SimplifiedAdminMenu from './SimplifiedAdminMenu';
import EventManagementPanel from './EventManagementPanel';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  FileText,
  Settings,
  AlertTriangle,
  Cog
} from 'lucide-react';

const ImprovedAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% em relação ao mês passado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Eventos Ativos
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">
                  +5 novos esta semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Carimbos Coletados
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,721</div>
                <p className="text-xs text-muted-foreground">
                  +12% de engajamento
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'events':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface para gerenciar eventos do sistema.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics e Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Visualize dados de engajamento e uso do sistema.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'attendants':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Atendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gerencie atendentes e suas permissões.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'passport':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Passaporte Digital</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gerencie carimbos e conquistas do passaporte digital.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Gerenciais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gere relatórios detalhados sobre o uso do sistema.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'ai-consultant':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Guilherme</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface com a IA para insights e consultoria.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configure parâmetros gerais do sistema.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Central de Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitore alertas e notificações do sistema.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Cog className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Configurações do Sistema</h2>
            </div>
            <EventManagementPanel />
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Selecione uma opção no menu.</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie seu sistema de turismo de forma organizada e eficiente.
        </p>
      </div>

      <SimplifiedAdminMenu activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </SimplifiedAdminMenu>
    </div>
  );
};

export default ImprovedAdminDashboard;