import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Lock, Check } from 'lucide-react';
import AvatarPersonalityModal from './AvatarPersonalityModal';

export interface PantanalAnimal {
  id: string;
  name: string;
  scientific_name: string;
  image: string;
  description: string;
  habitat: string;
  diet: string;
  curiosities: string[];
  is_unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlock_requirement?: string;
}

interface PantanalAvatarSelectorProps {
  animals: PantanalAnimal[];
  selectedAvatar: string | null;
  onSelect: (animalId: string) => void;
  onClose: () => void;
}

const PantanalAvatarSelector: React.FC<PantanalAvatarSelectorProps> = ({
  animals,
  selectedAvatar,
  onSelect,
  onClose
}) => {
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<PantanalAnimal | null>(null);

  const handleInfoClick = (animal: PantanalAnimal) => {
    setSelectedAnimal(animal);
    setShowPersonalityModal(true);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      default: return 'Comum';
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900">
              Escolha seu Avatar do Pantanal
            </DialogTitle>
            <p className="text-center text-gray-600 mt-2">
              Conecte-se com a biodiversidade do Pantanal através do seu avatar
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {animals.map((animal) => (
              <Card 
                key={animal.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  animal.is_unlocked ? 'hover:scale-105' : 'opacity-60'
                } ${
                  selectedAvatar === animal.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <CardContent className="p-4">
                  {/* Rarity Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getRarityColor(animal.rarity)} text-white text-xs`}>
                      {getRarityText(animal.rarity)}
                    </Badge>
                  </div>

                  {/* Lock Icon for locked animals */}
                  {!animal.is_unlocked && (
                    <div className="absolute top-2 left-2">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                  )}

                  {/* Selected Indicator */}
                  {selectedAvatar === animal.id && (
                    <div className="absolute top-2 left-2">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                  )}

                  {/* Animal Image */}
                  <div className="aspect-square mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <img 
                      src={animal.image} 
                      alt={animal.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Animal Info */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900">{animal.name}</h3>
                    <p className="text-sm text-gray-600 italic">{animal.scientific_name}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{animal.description}</p>
                    
                    {!animal.is_unlocked && animal.unlock_requirement && (
                      <p className="text-xs text-orange-600 font-medium">
                        🔒 {animal.unlock_requirement}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
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
                          e.preventDefault();
                          // Chamar onSelect que já fecha o modal internamente
                          if (typeof onSelect === 'function') {
                            onSelect(animal.id);
                          }
                        }}
                      >
                        {selectedAvatar === animal.id ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Close Button */}
          <div className="flex justify-center mt-6">
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Personalidade */}
      {showPersonalityModal && selectedAnimal && (
        <AvatarPersonalityModal
          animal={selectedAnimal}
          onClose={() => setShowPersonalityModal(false)}
          onSelect={onSelect}
          isSelecting={true}
        />
      )}
    </>
  );
};

export default PantanalAvatarSelector;
