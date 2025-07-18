import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Users, 
  MessageCircle, 
  Clock, 
  CheckCircle,
  HelpCircle,
  QrCode,
  Star,
  Activity,
  Phone
} from 'lucide-react';
import { useFlowTripAuth } from '@/hooks/useFlowTripAuth';
import { supabase } from '@/integrations/supabase/client';

export const CATAttendantPanel: React.FC = () => {
  const { currentState } = useFlowTripAuth();
  const [checkinCode, setCheckinCode] = useState('');
  const [todayStats, setTodayStats] = useState({
    visitors: 42,
    checkins: 38,
    chats: 15,
    satisfaction: 4.8
  });

  useEffect(() => {
    loadTodayStats();
  }, []);

  const loadTodayStats = async () => {
    try {
      // Carregar estatísticas reais do dia
      console.log('Carregando stats do dia...');
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  const handleQuickCheckin = async () => {
    if (checkinCode.trim()) {
      try {
        // Implementar check-in rápido
        console.log('Check-in para código:', checkinCode);
        setCheckinCode('');
      } catch (error) {
        console.error('Erro no check-in:', error);
      }
    }
  };

  if (!currentState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Carregando dados do CAT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Atendente CAT */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentState.logo_url && (
            <img 
              src={currentState.logo_url} 
              alt={`${currentState.name} Logo`}
              className="w-16 h-16 rounded-lg border-2"
              style={{ borderColor: currentState.primary_color }}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: currentState.primary_color }}>
              Atendente CAT - {currentState.name}
            </h1>
            <p className="text-muted-foreground">
              Centro de Atendimento ao Turista • Campo Grande
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <Clock className="w-4 h-4 mr-2" />
          Plantão Ativo
        </Badge>
      </div>

      {/* Estatísticas do Dia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes Hoje</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.visitors}</div>
            <p className="text-xs text-muted-foreground">
              +12% vs ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.checkins}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((todayStats.checkins / todayStats.visitors) * 100)}% dos visitantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.chats}</div>
            <p className="text-xs text-muted-foreground">
              Atendimentos por chat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.satisfaction}/5</div>
            <p className="text-xs text-muted-foreground">
              Avaliação média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Check-in Rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Check-in Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 max-w-md">
            <Input
              placeholder="Código do turista ou QR Code"
              value={checkinCode}
              onChange={(e) => setCheckinCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickCheckin()}
            />
            <Button onClick={handleQuickCheckin} disabled={!checkinCode.trim()}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Check-in
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Painel de Atendimento */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Central de Atendimento</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ferramentas para atendimento presencial e suporte aos turistas
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <QrCode className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Scanner QR</div>
                <div className="text-xs text-muted-foreground">Check-in presencial</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <MessageCircle className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Chat Turistas</div>
                <div className="text-xs text-muted-foreground">Atendimento online</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <MapPin className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Mapa Interativo</div>
                <div className="text-xs text-muted-foreground">Orientação de rotas</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <HelpCircle className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">FAQ</div>
                <div className="text-xs text-muted-foreground">Perguntas frequentes</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <Phone className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Suporte</div>
                <div className="text-xs text-muted-foreground">Escalação de problemas</div>
              </div>
            </Button>

            <Button 
              className="h-20 flex-col gap-2"
              style={{ 
                backgroundColor: currentState.primary_color,
                borderColor: currentState.primary_color 
              }}
            >
              <Activity className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Relatórios</div>
                <div className="text-xs">Atividade do dia</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações Úteis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Destinos Populares Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Pantanal</h4>
                <p className="text-sm text-muted-foreground">15 visitantes hoje</p>
              </div>
              <Badge>Popular</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Aquário do Pantanal</h4>
                <p className="text-sm text-muted-foreground">12 visitantes hoje</p>
              </div>
              <Badge variant="secondary">Frequente</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Mercadão</h4>
                <p className="text-sm text-muted-foreground">8 visitantes hoje</p>
              </div>
              <Badge variant="outline">Ativo</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Últimas Conversas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Turista #1847</span>
                <span className="text-xs text-muted-foreground">há 5 min</span>
              </div>
              <p className="text-sm text-muted-foreground">
                "Como chego ao Pantanal saindo do centro?"
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Turista #1852</span>
                <span className="text-xs text-muted-foreground">há 12 min</span>
              </div>
              <p className="text-sm text-muted-foreground">
                "Quais são os horários do Aquário?"
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Turista #1839</span>
                <span className="text-xs text-muted-foreground">há 20 min</span>
              </div>
              <p className="text-sm text-muted-foreground">
                "Onde posso almoçar comida típica?"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};