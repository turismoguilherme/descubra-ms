import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Lock, Check, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AvatarPersonalityModal from './AvatarPersonalityModal';

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

interface PantanalAvatarSelectorProps {
  animals: PantanalAnimal[];
  selectedAvatar: string;
  onSelect: (animalId: string) => void;
  onClose: () => void;
}

const PantanalAvatarSelector: React.FC<PantanalAvatarSelectorProps> = ({
  animals,
  selectedAvatar,
  onSelect,
  onClose
}) => {
  const [showPersonalityModal, setShowPersonalityModal] = React.useState(false);
  const [selectedAnimal, setSelectedAnimal] = React.useState<PantanalAnimal | null>(null);
  const handleSelect = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    if (animal && animal.is_unlocked) {
      onSelect(animalId);
    }
  };

  const handleInfoClick = (animal: PantanalAnimal) => {
    setSelectedAnimal(animal);
    setShowPersonalityModal(true);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-ms-primary-blue">
            🐾 Escolha seu Avatar do Pantanal
          </DialogTitle>
          <p className="text-center text-gray-600">
            Cada animal representa a rica biodiversidade do Pantanal Sul-Mato-Grossense
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {animals.map((animal) => (
            <Card 
              key={animal.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedAvatar === animal.id 
                  ? 'ring-2 ring-ms-primary-blue bg-blue-50' 
                  : animal.is_unlocked 
                    ? 'hover:shadow-md' 
                    : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => handleSelect(animal.id)}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="relative mb-3">
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarImage 
                        src={animal.image} 
                        alt={animal.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-green-100 text-green-800 text-lg">
                        {animal.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {selectedAvatar === animal.id && (
                      <div className="absolute -top-1 -right-1 bg-ms-primary-blue text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    
                    {!animal.is_unlocked && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm mb-1">{animal.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{animal.scientific_name}</p>
                  
                  <Badge 
                    variant={animal.conservation_status === 'Pouco Preocupante' ? 'default' : 'destructive'}
                    className="text-xs mb-2"
                  >
                    {animal.conservation_status}
                  </Badge>

                  {!animal.is_unlocked && animal.unlock_requirement && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                      <Lock className="h-3 w-3 inline mr-1" />
                      {animal.unlock_requirement}
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInfoClick(animal);
                      }}
                    >
                      <Info className="h-3 w-3 mr-1" />
                      Info
                    </Button>
                    {animal.is_unlocked && (
                      <Button
                        size="sm"
                        variant={selectedAvatar === animal.id ? "default" : "outline"}
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(animal.id);
                        }}
                      >
                        {selectedAvatar === animal.id ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Sobre os Avatares do Pantanal
          </h4>
          <p className="text-sm text-green-700">
            Cada animal representa a incrível biodiversidade do Pantanal. 
            Desbloqueie novos avatares completando roteiros do Passaporte e 
            aprenda sobre a conservação da fauna sul-mato-grossense!
          </p>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={onClose}
            disabled={!selectedAvatar}
          >
            Confirmar Avatar
          </Button>
        </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Personalidade */}
      {showPersonalityModal && selectedAnimal && (
        <AvatarPersonalityModal
          animal={selectedAnimal}
          onClose={() => setShowPersonalityModal(false)}
          onSelect={handleSelect}
          isSelecting={true}
        />
      )}
    </>
  );
};

export default PantanalAvatarSelector;
