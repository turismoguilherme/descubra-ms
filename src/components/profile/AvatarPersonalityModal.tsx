import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Heart, Target } from 'lucide-react';
import { PantanalAnimal } from './PantanalAvatarSelector';

interface AvatarPersonalityModalProps {
  animal: PantanalAnimal;
  onClose: () => void;
  onSelect?: (animalId: string) => void;
  isSelecting?: boolean;
}

const AvatarPersonalityModal: React.FC<AvatarPersonalityModalProps> = ({
  animal,
  onClose,
  onSelect,
  isSelecting = false
}) => {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(animal.id);
    }
    onClose();
  };

  // Dados de personalidade baseados no animal
  const personalityData = {
    'jaguar': {
      traits: ['Liderança', 'Coragem', 'Mistério', 'Força'],
      why: 'Representa força interior e liderança natural. Ideal para quem gosta de desafios e tem espírito aventureiro.'
    },
    'arara-azul': {
      traits: ['Comunicação', 'Sociabilidade', 'Inteligência', 'Beleza'],
      why: 'Simboliza comunicação e expressão. Perfeito para pessoas sociáveis e criativas.'
    },
    'capivara': {
      traits: ['Paciência', 'Tranquilidade', 'Sabedoria', 'Harmonia'],
      why: 'Representa calma e sabedoria. Ideal para quem valoriza a paz e a harmonia.'
    },
    'tuiuiu': {
      traits: ['Elegância', 'Graciosidade', 'Determinação', 'Altura'],
      why: 'Simboliza elegância e determinação. Perfeito para pessoas focadas e determinadas.'
    },
    'onca-pintada': {
      traits: ['Mistério', 'Intuição', 'Força', 'Independência'],
      why: 'Representa mistério e intuição. Ideal para pessoas independentes e intuitivas.'
    }
  };

  const personality = personalityData[animal.id as keyof typeof personalityData] || {
    traits: ['Único', 'Especial', 'Carismático'],
    why: 'Cada animal do Pantanal tem características únicas que podem refletir sua personalidade.'
  };

  // Funções para informações ambientais
  const getThreats = (animalId: string) => {
    const threats = {
      'jaguar': [
        'Perda de habitat devido ao desmatamento',
        'Caça ilegal e conflitos com humanos',
        'Fragmentação do habitat',
        'Redução de presas naturais'
      ],
      'arara-azul': [
        'Tráfico de animais silvestres',
        'Perda de habitat e árvores nativas',
        'Competição com espécies invasoras',
        'Mudanças climáticas'
      ],
      'capivara': [
        'Poluição de rios e córregos',
        'Perda de habitat aquático',
        'Atropelamentos em rodovias',
        'Contaminação da água'
      ],
      'tuiuiu': [
        'Poluição de corpos d\'água',
        'Perda de áreas úmidas',
        'Contaminação por agrotóxicos',
        'Alterações no regime de chuvas'
      ],
      'onca-pintada': [
        'Perda de habitat',
        'Caça ilegal',
        'Fragmentação de corredores ecológicos',
        'Conflitos com pecuária'
      ]
    };
    return threats[animalId as keyof typeof threats] || [
      'Perda de habitat',
      'Mudanças climáticas',
      'Atividades humanas'
    ];
  };

  const getConservationActions = (animalId: string) => {
    const actions = {
      'jaguar': [
        'Proteger corredores ecológicos',
        'Combater a caça ilegal',
        'Preservar áreas de mata nativa',
        'Educar sobre coexistência'
      ],
      'arara-azul': [
        'Plantar árvores nativas',
        'Combater o tráfico de animais',
        'Preservar palmeiras',
        'Apoiar projetos de reintrodução'
      ],
      'capivara': [
        'Proteger rios e córregos',
        'Reduzir poluição da água',
        'Criar passagens de fauna',
        'Preservar áreas úmidas'
      ],
      'tuiuiu': [
        'Proteger áreas úmidas',
        'Reduzir uso de agrotóxicos',
        'Preservar corpos d\'água',
        'Monitorar qualidade da água'
      ],
      'onca-pintada': [
        'Proteger grandes áreas contínuas',
        'Criar corredores ecológicos',
        'Educar sobre coexistência',
        'Apoiar reservas naturais'
      ]
    };
    return actions[animalId as keyof typeof actions] || [
      'Preservar habitat natural',
      'Reduzir impacto humano',
      'Apoiar projetos de conservação'
    ];
  };

  const getEcosystemImportance = (animalId: string) => {
    const importance = {
      'jaguar': 'Como predador de topo, a onça-pintada regula as populações de outras espécies, mantendo o equilíbrio do ecossistema. Sua presença indica um ambiente saudável e preservado.',
      'arara-azul': 'Essencial para a dispersão de sementes de palmeiras, contribuindo para a regeneração da floresta. Sua presença indica boa qualidade ambiental.',
      'capivara': 'Importante herbívoro que controla a vegetação aquática e terrestre, contribuindo para a manutenção dos corpos d\'água.',
      'tuiuiu': 'Indicador de qualidade ambiental, sua presença em áreas úmidas sinaliza ecossistemas saudáveis e bem preservados.',
      'onca-pintada': 'Predador de topo essencial para o controle de populações de herbívoros, mantendo o equilíbrio natural do Pantanal.'
    };
    return importance[animalId as keyof typeof importance] || 'Cada animal do Pantanal tem um papel importante na manutenção do equilíbrio ecológico desta região única.';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        overlayClassName="bg-transparent"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            Personalidade do {animal.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pb-4">
          {/* Personalidade */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-purple-600" />
                Personalidade
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Traços Característicos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {personality.traits.map((trait, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Por que escolher este avatar?</h4>
                  <p className="text-gray-700">{personality.why}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sobre o Animal */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Sobre o {animal.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Habitat:</h4>
                  <p className="text-blue-700 text-sm">{animal.habitat}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Alimentação:</h4>
                  <p className="text-blue-700 text-sm">{animal.diet}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-blue-800 mb-2">Curiosidades:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  {animal.curiosities.map((curiosity, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{curiosity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Consciência Ambiental */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Consciência Ambiental
              </h3>
              <div className="space-y-4">
                {/* Ameaças */}
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Principais Ameaças
                  </h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    {getThreats(animal.id).map((threat, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{threat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ações de Conservação */}
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Como Ajudar na Conservação
                  </h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    {getConservationActions(animal.id).map((action, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impacto no Ecossistema */}
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Importância no Ecossistema
                  </h4>
                  <p className="text-blue-700 text-sm">
                    {getEcosystemImportance(animal.id)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          {isSelecting && (
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={onClose} variant="outline">
                Cancelar
              </Button>
              <Button onClick={handleSelect} className="bg-green-600 hover:bg-green-700">
                Selecionar Avatar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarPersonalityModal;
