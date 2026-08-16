import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Check } from 'lucide-react';

interface PantanalAnimal {
  id: string;
  name: string;
  scientific_name: string;
  description: string;
  image_url: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  habitat: string;
  fun_fact: string;
}

interface AvatarSelectorProps {
  onAvatarSelect: (avatar: PantanalAnimal) => void;
  currentAvatar?: string;
}

const PANTANAL_ANIMALS: PantanalAnimal[] = [
  {
    id: 'capivara',
    name: 'Capivara',
    scientific_name: 'Hydrochoerus hydrochaeris',
    description: 'O maior roedor do mundo, símbolo do Pantanal',
    image_url: '/images/avatars/capivara.png',
    rarity: 'common',
    habitat: 'Áreas alagadas',
    fun_fact: 'Podem ficar até 5 minutos debaixo d\'água!'
  },
  {
    id: 'onca-pintada',
    name: 'Onça-pintada',
    scientific_name: 'Panthera onca',
    description: 'O maior felino das Américas, predador topo de cadeia',
    image_url: '/images/avatars/onca-pintada.png',
    rarity: 'legendary',
    habitat: 'Mata ciliar e cerrado',
    fun_fact: 'Tem a mordida mais forte entre todos os felinos!'
  },
  {
    id: 'tuiuiu',
    name: 'Tuiuiú',
    scientific_name: 'Jabiru mycteria',
    description: 'A ave símbolo do Pantanal, majestosa e imponente',
    image_url: '/images/avatars/tuiuiu.png',
    rarity: 'epic',
    habitat: 'Beira de rios e lagoas',
    fun_fact: 'Pode atingir até 1,4m de altura!'
  },
  {
    id: 'ariranha',
    name: 'Ariranha',
    scientific_name: 'Pteronura brasiliensis',
    description: 'A maior lontra do mundo, excelente nadadora',
    image_url: '/images/avatars/ariranha.png',
    rarity: 'rare',
    habitat: 'Rios e lagoas',
    fun_fact: 'Vive em grupos familiares de até 8 indivíduos!'
  },
  {
    id: 'tamandua-bandeira',
    name: 'Tamanduá-bandeira',
    scientific_name: 'Myrmecophaga tridactyla',
    description: 'Especialista em formigas e cupins',
    image_url: '/images/avatars/tamandua-bandeira.png',
    rarity: 'rare',
    habitat: 'Cerrado e campos',
    fun_fact: 'Pode comer até 30.000 formigas por dia!'
  },
  {
    id: 'cervo-do-pantanal',
    name: 'Cervo-do-pantanal',
    scientific_name: 'Blastocerus dichotomus',
    description: 'O maior cervídeo da América do Sul',
    image_url: '/images/avatars/cervo-do-pantanal.png',
    rarity: 'epic',
    habitat: 'Áreas alagadas',
    fun_fact: 'Excelente nadador, pode atravessar rios largos!'
  },
  {
    id: 'arara-azul',
    name: 'Arara-azul',
    scientific_name: 'Anodorhynchus hyacinthinus',
    description: 'A maior arara do mundo, ameaçada de extinção',
    image_url: '/images/avatars/arara-azul.png',
    rarity: 'legendary',
    habitat: 'Palmeiras e mata ciliar',
    fun_fact: 'Pode viver até 50 anos em cativeiro!'
  },
  {
    id: 'jacare-do-pantanal',
    name: 'Jacaré-do-pantanal',
    scientific_name: 'Caiman yacare',
    description: 'Réptil abundante no Pantanal, importante predador',
    image_url: '/images/avatars/jacare-do-pantanal.png',
    rarity: 'common',
    habitat: 'Rios, lagoas e corixos',
    fun_fact: 'Pode ter até 3.000 dentes ao longo da vida!'
  }
];

const AvatarSelector = ({ onAvatarSelect, currentAvatar }: AvatarSelectorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar || null);
  const [saving, setSaving] = useState(false);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      default: return 'Comum';
    }
  };

  const handleAvatarSelect = async (avatar: PantanalAnimal) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para selecionar um avatar",
        variant: "destructive",
      });
      return;
    }

    setSelectedAvatar(avatar.id);
    setSaving(true);

    try {
      // Salvar no localStorage (temporário)
      localStorage.setItem('selected_avatar', JSON.stringify(avatar));
      
      onAvatarSelect(avatar);
      
      toast({
        title: "Avatar selecionado!",
        description: `Você escolheu o ${avatar.name} como seu avatar`,
      });
    } catch (error) {
      console.error('Erro ao salvar avatar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu avatar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-ms-primary-blue mb-2">
          Escolha seu Avatar do Pantanal
        </h2>
        <p className="text-gray-600">
          Selecione um animal do Pantanal para representar você na plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PANTANAL_ANIMALS.map((animal) => (
          <Card 
            key={animal.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedAvatar === animal.id 
                ? 'ring-2 ring-ms-primary-blue bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleAvatarSelect(animal)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{animal.name}</CardTitle>
                <Badge className={getRarityColor(animal.rarity)}>
                  {getRarityLabel(animal.rarity)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 italic">
                {animal.scientific_name}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={animal.image_url} alt={animal.name} />
                  <AvatarFallback className="text-2xl">
                    {animal.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  {animal.description}
                </p>
                
                <div className="text-xs text-gray-500">
                  <strong>Habitat:</strong> {animal.habitat}
                </div>
                
                <div className="text-xs text-ms-primary-blue">
                  <strong>💡 Curiosidade:</strong> {animal.fun_fact}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button 
                  size="sm" 
                  className="w-full"
                  disabled={saving}
                >
                  {saving && selectedAvatar === animal.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : selectedAvatar === animal.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Selecionado
                    </>
                  ) : (
                    'Selecionar'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
