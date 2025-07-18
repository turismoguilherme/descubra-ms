
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Zap, MapPin, Calendar, Gift } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DemoDataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { addPoints, addStamp, refreshUserData } = useFlowTrip();
  const { toast } = useToast();

  const seedDemoData = async () => {
    setIsSeeding(true);
    try {
      // Adicionar destinos de exemplo se não existirem
      const { data: existingDestinations } = await supabase
        .from('destinations')
        .select('id')
        .limit(1);

      if (!existingDestinations || existingDestinations.length === 0) {
        const demoDestinations = [
          {
            name: 'Pantanal',
            description: 'A maior planície alagável do mundo',
            location: 'Corumbá, MS',
            region: 'Pantanal',
            image_url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800'
          },
          {
            name: 'Bonito',
            description: 'Águas cristalinas e cavernas fascinantes',
            location: 'Bonito, MS',
            region: 'Serra da Bodoquena',
            image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'
          },
          {
            name: 'Campo Grande',
            description: 'Portal de entrada para o ecoturismo',
            location: 'Campo Grande, MS',
            region: 'Grande Campo Grande',
            image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'
          }
        ];

        await supabase.from('destinations').insert(demoDestinations);
      }

      // Adicionar eventos de exemplo
      const { data: existingEvents } = await supabase
        .from('events')
        .select('id')
        .limit(1);

      if (!existingEvents || existingEvents.length === 0) {
        const demoEvents = [
          {
            name: 'Festival de Bonito',
            description: 'Celebração da natureza e cultura local',
            location: 'Bonito, MS',
            start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
            image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
          },
          {
            name: 'Encontro Pantaneiro',
            description: 'Experiência cultural no coração do Pantanal',
            location: 'Corumbá, MS',
            start_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
            image_url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800'
          }
        ];

        await supabase.from('events').insert(demoEvents);
      }

      // Adicionar alguns pontos e carimbos de exemplo para o usuário
      await addPoints(100, 'demo_data_bonus');
      
      await addStamp({
        activity_type: 'demo_visit',
        points_earned: 15,
        stamp_type: 'demo'
      });

      await addStamp({
        activity_type: 'demo_event',
        points_earned: 20,
        stamp_type: 'event'
      });

      await refreshUserData();

      toast({
        title: '🎉 Dados de demonstração adicionados!',
        description: '+100 pontos bônus e carimbos de exemplo criados!',
      });

      // Marcar que os dados demo foram adicionados
      localStorage.setItem('flowtrip_demo_data_seeded', 'true');
    } catch (error) {
      console.error('Erro ao adicionar dados demo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar os dados de demonstração.',
        variant: 'destructive'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const addBonusPoints = async () => {
    try {
      await addPoints(50, 'manual_bonus');
      toast({
        title: '⚡ Pontos adicionados!',
        description: '+50 pontos de bônus!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar os pontos.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Database className="h-5 w-5" />
          Modo Demonstração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Adicione dados de exemplo para testar o FlowTrip com destinos, eventos e pontos.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            onClick={seedDemoData}
            disabled={isSeeding}
            variant="outline"
            className="gap-2"
          >
            {isSeeding ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Dados Demo
              </>
            )}
          </Button>

          <Button 
            onClick={addBonusPoints}
            variant="outline"
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            +50 Pontos
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <strong>💡 Dica:</strong> Use estes dados para testar as funcionalidades do FlowTrip. 
          Em produção, os dados virão de fontes oficiais.
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoDataSeeder;
