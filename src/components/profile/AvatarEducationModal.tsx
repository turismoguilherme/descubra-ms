import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, MapPin, Heart, Star, Shield, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface AvatarEducationModalProps {
  animal: PantanalAnimal;
  onClose: () => void;
}

const AvatarEducationModal: React.FC<AvatarEducationModalProps> = ({
  animal,
  onClose
}) => {
  const getConservationColor = (status: string) => {
    switch (status) {
      case 'Pouco Preocupante':
        return 'bg-green-100 text-green-800';
      case 'Quase Ameaçada':
        return 'bg-yellow-100 text-yellow-800';
      case 'Vulnerável':
        return 'bg-orange-100 text-orange-800';
      case 'Em Perigo':
        return 'bg-red-100 text-red-800';
      case 'Criticamente em Perigo':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConservationIcon = (status: string) => {
    switch (status) {
      case 'Pouco Preocupante':
        return <Shield className="h-4 w-4" />;
      case 'Quase Ameaçada':
        return <Star className="h-4 w-4" />;
      case 'Vulnerável':
      case 'Em Perigo':
      case 'Criticamente em Perigo':
        return <Heart className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={animal.image} alt={animal.name} />
              <AvatarFallback className="bg-green-100 text-green-800 text-2xl">
                {animal.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold text-ms-primary-blue">
                {animal.name}
              </DialogTitle>
              <p className="text-gray-600 italic">{animal.scientific_name}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status de Conservação */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                {getConservationIcon(animal.conservation_status)}
                <span className="ml-2">Status de Conservação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                className={`${getConservationColor(animal.conservation_status)} text-sm px-3 py-1`}
              >
                {animal.conservation_status}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                {animal.conservation_status === 'Pouco Preocupante' 
                  ? 'Esta espécie não está em risco de extinção no momento.'
                  : animal.conservation_status === 'Quase Ameaçada'
                  ? 'Esta espécie pode estar em risco no futuro se não protegida.'
                  : 'Esta espécie está em risco de extinção e precisa de proteção urgente.'
                }
              </p>
            </CardContent>
          </Card>

          {/* Habitat */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Habitat Natural
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{animal.habitat}</p>
            </CardContent>
          </Card>

          {/* Alimentação */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Alimentação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{animal.diet}</p>
            </CardContent>
          </Card>

          {/* Curiosidades */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Curiosidades Incríveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {animal.curiosities.map((curiosity, index) => (
                  <li key={index} className="flex items-start">
                    <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{curiosity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Importância para o Pantanal */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800">
                🌿 Importância para o Pantanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 text-sm">
                O {animal.name} é uma peça fundamental no ecossistema do Pantanal. 
                Cada espécie tem um papel único na manutenção do equilíbrio natural, 
                desde a dispersão de sementes até o controle de populações de outras espécies. 
                Proteger estes animais é proteger todo o bioma pantaneiro!
              </p>
            </CardContent>
          </Card>

          {/* Como Ajudar */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-800">
                🤝 Como Você Pode Ajudar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li>• Visite o Pantanal de forma responsável e sustentável</li>
                <li>• Respeite a fauna e flora local</li>
                <li>• Apoie projetos de conservação</li>
                <li>• Compartilhe conhecimento sobre preservação</li>
                <li>• Escolha operadores de turismo responsáveis</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button 
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700"
          >
            Aprender Mais
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarEducationModal;
