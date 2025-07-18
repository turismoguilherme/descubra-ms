import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Trophy, Star, Share2, Download, CheckCircle } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DigitalPassport = () => {
  const { passportStamps, userLevel, currentState, addStamp, isLoading } = useFlowTrip();
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);

  const currentPoints = userLevel?.total_points || 0;
  const currentLevelName = userLevel?.current_level || 'Iniciante';

  // Agrupar selos por tipo
  const stampsByType = passportStamps.reduce((acc, stamp) => {
    const type = stamp.activity_type || 'outros';
    if (!acc[type]) acc[type] = [];
    acc[type].push(stamp);
    return acc;
  }, {} as Record<string, typeof passportStamps>);

  // Estatísticas do passaporte
  const stats = {
    totalStamps: passportStamps.length,
    checkIns: stampsByType['check_in']?.length || 0,
    events: stampsByType['event']?.length || 0,
    achievements: stampsByType['achievement']?.length || 0
  };

  const handleTestStamp = async () => {
    if (isLoading) return;
    
    await addStamp({
      activity_type: 'check_in',
      points_earned: 10,
      latitude: -20.4435,
      longitude: -54.6478
    });
  };

  const handleSharePassport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Passaporte FlowTrip',
        text: `Já conquistei ${stats.totalStamps} selos no FlowTrip! Nível: ${currentLevelName} com ${currentPoints} pontos.`,
        url: window.location.href
      });
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do passaporte */}
      <Card className="bg-gradient-to-r from-primary to-secondary text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Passaporte Digital</CardTitle>
              <p className="text-white/80">
                Explorando {currentState?.name || 'destinos incríveis'}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {stats.totalStamps} selos
              </Badge>
              <p className="text-white/80 mt-1">{currentLevelName}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.checkIns}</p>
                <p className="text-xs text-white/70">Check-ins</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.events}</p>
                <p className="text-xs text-white/70">Eventos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.achievements}</p>
                <p className="text-xs text-white/70">Conquistas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleSharePassport}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 text-white border-white/20 hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                Baixar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selos do passaporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Meus Selos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">Todos ({stats.totalStamps})</TabsTrigger>
              <TabsTrigger value="check_in">Check-ins ({stats.checkIns})</TabsTrigger>
              <TabsTrigger value="event">Eventos ({stats.events})</TabsTrigger>
              <TabsTrigger value="achievement">Conquistas ({stats.achievements})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="todos" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {passportStamps.map((stamp) => (
                  <Card 
                    key={stamp.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedStamp === stamp.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedStamp(selectedStamp === stamp.id ? null : stamp.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          +{stamp.points_earned} pts
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">
                          {stamp.activity_type === 'check_in' ? 'Check-in' : 'Atividade'}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(stamp.stamped_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        {stamp.latitude && stamp.longitude && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {stamp.latitude.toFixed(4)}, {stamp.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="check_in" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stampsByType['check_in']?.map((stamp) => (
                  <Card key={stamp.id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-ms-discovery-teal/10 rounded-full">
                          <MapPin className="h-5 w-5 text-ms-discovery-teal" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          +{stamp.points_earned} pts
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Check-in realizado</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(stamp.stamped_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="event" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento ainda</p>
                <p className="text-sm">Participe de eventos para ganhar selos especiais!</p>
              </div>
            </TabsContent>
            
            <TabsContent value="achievement" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma conquista ainda</p>
                <p className="text-sm">Continue explorando para desbloquear conquistas!</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Botão de teste (remover em produção) */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Teste o sistema de selos (apenas para desenvolvimento)
          </p>
          <Button 
            onClick={handleTestStamp} 
            disabled={isLoading}
            variant="outline"
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Adicionar selo de teste
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalPassport;