import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const AlertsAndRecommendationsSimple = () => {
  const alerts = [
    {
      id: '1',
      type: 'high',
      title: 'Aumento de tráfego detectado',
      message: 'Rota do Pantanal teve 40% mais visitas hoje',
      timestamp: '2 min atrás'
    },
    {
      id: '2',
      type: 'medium',
      title: 'Recomendação de conteúdo',
      message: 'Adicionar mais fotos à rota de Bonito',
      timestamp: '15 min atrás'
    },
    {
      id: '3',
      type: 'low',
      title: 'Atualização do sistema',
      message: 'Nova versão dos analytics disponível',
      timestamp: '1 hora atrás'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alertas e Recomendações</h2>
          <p className="text-muted-foreground">
            Notificações e sugestões inteligentes do sistema
          </p>
        </div>
        <Button variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Marcar todos como lidos
        </Button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {alert.timestamp}
                    </p>
                  </div>
                </div>
                <Badge variant={getAlertColor(alert.type) as any}>
                  {alert.type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Alertas Inteligentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            O sistema completo de alertas e recomendações está sendo implementado.
            Inclui notificações em tempo real e sugestões baseadas em IA.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsAndRecommendationsSimple;