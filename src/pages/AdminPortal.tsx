import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Users, MapPin, Calendar, TrendingUp, Settings, Bell, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPortal = () => {
  const stats = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Usuários Ativos",
      value: "15.234",
      change: "+12%",
      trend: "up"
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Destinos Cadastrados",
      value: "89",
      change: "+3",
      trend: "up"
    },
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: "Eventos Ativos",
      value: "24",
      change: "+8",
      trend: "up"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Check-ins Hoje",
      value: "456",
      change: "+28%",
      trend: "up"
    }
  ];

  const quickActions = [
    {
      title: "Adicionar Destino",
      description: "Cadastre um novo destino turístico",
      link: "/ms/destination-editor"
    },
    {
      title: "Criar Evento",
      description: "Promova um novo evento",
      link: "/ms/event-editor"
    },
    {
      title: "Gerenciar Usuários",
      description: "Administre usuários e permissões",
      link: "/ms/management"
    },
    {
      title: "Relatórios",
      description: "Visualize analytics detalhados",
      link: "/ms/tourism-data"
    }
  ];

  const recentActivity = [
    {
      user: "Maria Silva",
      action: "cadastrou novo destino",
      target: "Pantanal Sul",
      time: "há 2 horas"
    },
    {
      user: "João Santos",
      action: "criou evento",
      target: "Festival de Inverno 2024",
      time: "há 4 horas"
    },
    {
      user: "Ana Costa",
      action: "atualizou informações",
      target: "Bonito - MS",
      time: "há 6 horas"
    },
    {
      user: "Carlos Lima",
      action: "aprovou parceiro",
      target: "Eco Turismo MS",
      time: "há 1 dia"
    }
  ];

  return (
    <UniversalLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary to-primary-foreground text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Painel Administrativo
                </h1>
                <p className="text-white/90">
                  Bem-vindo ao centro de controle do Descubra MS
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="py-8 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                          <Badge variant="secondary" className="text-xs">
                            {stat.change}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quickActions.map((action, index) => (
                        <Card key={index} className="border-border hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                            <Button size="sm" variant="outline" asChild>
                              <Link to={action.link}>Acessar</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Charts Section */}
                <Card className="border-border mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Analytics de Visitação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Gráfico de visitação será exibido aqui</p>
                        <Button variant="outline" size="sm" className="mt-4" asChild>
                          <Link to="/ms/tourism-data">Ver Relatório Completo</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent Activity */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5" />
                      Atividade Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="border-b border-border pb-3 last:border-b-0">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{activity.user}</span>{' '}
                            {activity.action}{' '}
                            <span className="font-medium">{activity.target}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Search */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Busca Rápida</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input placeholder="Buscar destinos, eventos, usuários..." className="mb-4" />
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link to="/ms/destinos">Ver Destinos</Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link to="/ms/eventos">Ver Eventos</Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link to="/ms/management">Ver Usuários</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Status do Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">API Status</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Database</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">CDN</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Backup</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">Running</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </UniversalLayout>
  );
};

export default AdminPortal;