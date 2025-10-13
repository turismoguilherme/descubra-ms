import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Star, 
  Shield, 
  Zap, 
  Users, 
  Target,
  Award,
  Share2,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface PantanalAnimal {
  id: string;
  name: string;
  scientific_name: string;
  image: string;
  habitat: string;
  diet: string;
  curiosities: string[];
  conservation_status: string;
  unlock_requirement?: string;
  is_unlocked: boolean;
}

interface PersonalityTrait {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
}

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
  // Sistema de personalidade por animal
  const getPersonalityData = (animalId: string) => {
    const personalities = {
      'arara-azul': {
        title: 'O Líder Carismático',
        description: 'Você é naturalmente carismático e gosta de liderar grupos. Sua personalidade vibrante e comunicativa inspira outros a seguirem seus passos.',
        motivation: 'Sou naturalmente carismático e gosto de liderar grupos!',
        traits: [
          { icon: <Star className="h-4 w-4" />, name: 'Liderança', description: 'Naturalmente assume posições de liderança', color: 'bg-yellow-100 text-yellow-800' },
          { icon: <Users className="h-4 w-4" />, name: 'Comunicação', description: 'Excelente comunicador e inspirador', color: 'bg-blue-100 text-blue-800' },
          { icon: <Zap className="h-4 w-4" />, name: 'Energia', description: 'Personalidade vibrante e energética', color: 'bg-orange-100 text-orange-800' }
        ],
        whyChoose: 'Escolha a Arara-azul se você é naturalmente carismático, gosta de liderar grupos e tem uma personalidade vibrante que inspira outros.',
        socialShare: 'Descobri que sou uma Arara-azul! 🦜 Líder carismático do Pantanal! #DescubraMS #PersonalidadePantanal'
      },
      'tuiuiu': {
        title: 'O Sábio Estratégico',
        description: 'Você é estratégico e gosta de observar antes de agir. Sua personalidade calma e pensativa o torna um excelente planejador e conselheiro.',
        motivation: 'Sou estratégico e gosto de observar antes de agir!',
        traits: [
          { icon: <Target className="h-4 w-4" />, name: 'Estratégia', description: 'Pensa estrategicamente antes de agir', color: 'bg-purple-100 text-purple-800' },
          { icon: <Shield className="h-4 w-4" />, name: 'Sabedoria', description: 'Conhecido por sua sabedoria e conselhos', color: 'bg-indigo-100 text-indigo-800' },
          { icon: <Heart className="h-4 w-4" />, name: 'Paciência', description: 'Calmo e paciente em todas as situações', color: 'bg-pink-100 text-pink-800' }
        ],
        whyChoose: 'Escolha o Tuiuiú se você é estratégico, gosta de planejar e tem uma personalidade calma e sábia.',
        socialShare: 'Descobri que sou um Tuiuiú! 🦅 Sábio estratégico do Pantanal! #DescubraMS #PersonalidadePantanal'
      },
      'onca-pintada': {
        title: 'O Corajoso Independente',
        description: 'Você é corajoso e independente, gosta de desafios e tem uma personalidade misteriosa e fascinante que atrai outros.',
        motivation: 'Sou corajoso e independente, gosto de desafios!',
        traits: [
          { icon: <Shield className="h-4 w-4" />, name: 'Coragem', description: 'Enfrenta desafios com bravura', color: 'bg-red-100 text-red-800' },
          { icon: <Zap className="h-4 w-4" />, name: 'Independência', description: 'Prefere trabalhar sozinho e ser autônomo', color: 'bg-orange-100 text-orange-800' },
          { icon: <Star className="h-4 w-4" />, name: 'Mistério', description: 'Personalidade misteriosa e fascinante', color: 'bg-gray-100 text-gray-800' }
        ],
        whyChoose: 'Escolha a Onça-pintada se você é corajoso, independente e gosta de desafios únicos.',
        socialShare: 'Descobri que sou uma Onça-pintada! 🐆 Corajoso independente do Pantanal! #DescubraMS #PersonalidadePantanal'
      },
      'capivara': {
        title: 'O Sociável Colaborativo',
        description: 'Você é sociável e gosta de trabalhar em equipe. Sua personalidade pacífica e colaborativa o torna um excelente membro de grupo.',
        motivation: 'Sou sociável e gosto de trabalhar em equipe!',
        traits: [
          { icon: <Users className="h-4 w-4" />, name: 'Sociabilidade', description: 'Ama estar em grupos e socializar', color: 'bg-green-100 text-green-800' },
          { icon: <Heart className="h-4 w-4" />, name: 'Paz', description: 'Personalidade pacífica e harmoniosa', color: 'bg-pink-100 text-pink-800' },
          { icon: <Award className="h-4 w-4" />, name: 'Colaboração', description: 'Excelente em trabalhar em equipe', color: 'bg-blue-100 text-blue-800' }
        ],
        whyChoose: 'Escolha a Capivara se você é sociável, gosta de trabalhar em equipe e tem uma personalidade pacífica.',
        socialShare: 'Descobri que sou uma Capivara! 🐹 Sociável colaborativa do Pantanal! #DescubraMS #PersonalidadePantanal'
      },
      'jacare-do-pantanal': {
        title: 'O Resiliente Adaptável',
        description: 'Você é resiliente e se adapta bem a qualquer situação. Sua personalidade determinada e persistente o torna um sobrevivente nato.',
        motivation: 'Sou resiliente e me adapto a qualquer situação!',
        traits: [
          { icon: <Shield className="h-4 w-4" />, name: 'Resiliência', description: 'Supera obstáculos com determinação', color: 'bg-red-100 text-red-800' },
          { icon: <Zap className="h-4 w-4" />, name: 'Adaptabilidade', description: 'Se adapta facilmente a mudanças', color: 'bg-orange-100 text-orange-800' },
          { icon: <Target className="h-4 w-4" />, name: 'Persistência', description: 'Nunca desiste dos seus objetivos', color: 'bg-purple-100 text-purple-800' }
        ],
        whyChoose: 'Escolha o Jacaré-do-pantanal se você é resiliente, adaptável e tem uma personalidade persistente.',
        socialShare: 'Descobri que sou um Jacaré-do-pantanal! 🐊 Resiliente adaptável do Pantanal! #DescubraMS #PersonalidadePantanal'
      }
    };

    return personalities[animalId as keyof typeof personalities] || personalities['arara-azul'];
  };

  const personalityData = getPersonalityData(animal.id);

  // Funções para informações ambientais
  const getThreats = (animalId: string) => {
    const threats = {
      'arara-azul': [
        'Desmatamento do Cerrado e Pantanal',
        'Tráfico de animais silvestres',
        'Perda de habitat para agricultura',
        'Falta de palmeiras para nidificação'
      ],
      'tuiuiu': [
        'Poluição de rios e áreas alagadas',
        'Destruição de ninhais',
        'Contaminação por agrotóxicos',
        'Alteração do ciclo hidrológico'
      ],
      'onca-pintada': [
        'Caça ilegal e retaliação',
        'Fragmentação de habitat',
        'Conflitos com pecuária',
        'Atropelamentos em rodovias'
      ],
      'capivara': [
        'Caça para consumo de carne',
        'Destruição de áreas alagadas',
        'Contaminação de corpos d\'água',
        'Expansão urbana'
      ],
      'jacare-do-pantanal': [
        'Caça para couro e carne',
        'Poluição de rios',
        'Destruição de áreas de reprodução',
        'Mudanças climáticas'
      ]
    };
    return threats[animalId as keyof typeof threats] || threats['arara-azul'];
  };

  const getConservationActions = (animalId: string) => {
    const actions = {
      'arara-azul': [
        'Apoiar projetos de reflorestamento',
        'Denunciar tráfico de animais',
        'Consumir produtos sustentáveis',
        'Educar outros sobre conservação'
      ],
      'tuiuiu': [
        'Proteger áreas alagadas',
        'Evitar poluição de rios',
        'Apoiar ONGs de conservação',
        'Praticar turismo sustentável'
      ],
      'onca-pintada': [
        'Apoiar corredores ecológicos',
        'Denunciar caça ilegal',
        'Praticar pecuária sustentável',
        'Apoiar pesquisas científicas'
      ],
      'capivara': [
        'Proteger áreas úmidas',
        'Evitar caça ilegal',
        'Apoiar reservas naturais',
        'Conscientizar sobre conservação'
      ],
      'jacare-do-pantanal': [
        'Proteger rios e lagoas',
        'Evitar contaminação da água',
        'Apoiar projetos de conservação',
        'Praticar pesca sustentável'
      ]
    };
    return actions[animalId as keyof typeof actions] || actions['arara-azul'];
  };

  const getEcosystemImportance = (animalId: string) => {
    const importance = {
      'arara-azul': 'A Arara-azul é fundamental para a dispersão de sementes de palmeiras, especialmente a palmeira acuri. Sua presença indica a saúde do ecossistema e sua extinção afetaria toda a cadeia alimentar do Pantanal.',
      'tuiuiú': 'O Tuiuiú é um indicador da qualidade ambiental e controla populações de peixes e anfíbios. Sua presença em ninhais indica áreas bem preservadas e sua perda afetaria o equilíbrio dos ecossistemas aquáticos.',
      'onca-pintada': 'A Onça-pintada é um predador de topo essencial para controlar populações de herbívoros. Sua presença mantém o equilíbrio do ecossistema e sua extinção causaria desequilíbrios ecológicos graves.',
      'capivara': 'A Capivara é importante para a manutenção da vegetação aquática e serve como presa para predadores. Sua presença indica áreas úmidas saudáveis e sua perda afetaria toda a cadeia alimentar.',
      'jacare-do-pantanal': 'O Jacaré-do-pantanal controla populações de peixes e anfíbios, mantendo o equilíbrio dos ecossistemas aquáticos. Sua presença é crucial para a saúde dos rios e lagoas do Pantanal.'
    };
    return importance[animalId as keyof typeof importance] || importance['arara-azul'];
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(animal.id);
    }
    onClose();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Minha Personalidade do Pantanal',
        text: personalityData.socialShare,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(personalityData.socialShare);
      // Aqui você pode adicionar um toast de sucesso
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={animal.image} alt={animal.name} />
              <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                {animal.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-3xl font-bold text-gray-900">{animal.name}</div>
              <div className="text-lg text-gray-600 italic">{animal.scientific_name}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personalidade */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">{personalityData.title}</h3>
              </div>
              <p className="text-gray-700 mb-4 text-lg">{personalityData.description}</p>
              <div className="bg-white/50 p-4 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-800 font-semibold italic">"{personalityData.motivation}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Traços de Personalidade */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Seus Traços de Personalidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {personalityData.traits.map((trait, index) => (
                  <div key={index} className="p-4 rounded-lg border-2 border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-full bg-gray-100 mr-3">
                        {trait.icon}
                      </div>
                      <Badge className={trait.color}>
                        {trait.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{trait.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Por que escolher */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Por que escolher este avatar?
              </h3>
              <p className="text-gray-700">{personalityData.whyChoose}</p>
            </CardContent>
          </Card>

          {/* Informações do Animal */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Sobre o {animal.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Habitat</h4>
                  <p className="text-gray-600 mb-4">{animal.habitat}</p>
                  
                  <h4 className="font-semibold text-gray-800 mb-2">Alimentação</h4>
                  <p className="text-gray-600 mb-4">{animal.diet}</p>
                  
                  <h4 className="font-semibold text-gray-800 mb-2">Status de Conservação</h4>
                  <Badge 
                    variant={animal.conservation_status === 'Pouco Preocupante' ? 'default' : 'destructive'}
                    className="mb-4"
                  >
                    {animal.conservation_status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Curiosidades</h4>
                  <ul className="space-y-2">
                    {animal.curiosities.map((curiosity, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{curiosity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consciência Ambiental */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Consciência Ambiental
              </h3>
              
              <div className="space-y-4">
                {/* Ameaças */}
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
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
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
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
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
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

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar Personalidade
            </Button>
            {isSelecting && (
              <Button
                onClick={handleSelect}
                className="bg-ms-primary-blue hover:bg-blue-700 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Escolher este Avatar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarPersonalityModal;
