import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnimalStampCardProps {
  animal: 'onca' | 'tuiuiu' | 'jacare' | 'arara' | 'capivara';
  fragmentNumber: number;
  checkpointName: string;
  collected: boolean;
  collectedAt?: string;
  culturalPhrase?: string;
}

const animalConfig = {
  onca: {
    icon: '🐆',
    name: 'Onça-Pintada',
    color: 'from-amber-400 to-orange-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-900',
  },
  tuiuiu: {
    icon: '🦩',
    name: 'Tuiuiú',
    color: 'from-red-400 to-pink-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-900',
  },
  jacare: {
    icon: '🐊',
    name: 'Jacaré',
    color: 'from-emerald-400 to-green-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-900',
  },
  arara: {
    icon: '🦜',
    name: 'Arara-Azul',
    color: 'from-blue-400 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-900',
  },
  capivara: {
    icon: '🦫',
    name: 'Capivara',
    color: 'from-violet-400 to-purple-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
    textColor: 'text-violet-900',
  },
};

const AnimalStampCard: React.FC<AnimalStampCardProps> = ({
  animal,
  fragmentNumber,
  checkpointName,
  collected,
  collectedAt,
  culturalPhrase,
}) => {
  const config = animalConfig[animal];

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: collected ? 1.05 : 1.02 }}
    >
      <Card 
        className={`relative overflow-hidden transition-all ${
          collected 
            ? `${config.bgColor} ${config.borderColor} border-2 shadow-md` 
            : 'bg-gray-50 border-gray-200 border-2 opacity-60'
        }`}
      >
        {/* Stamp Effect Overlay for Collected */}
        {collected && (
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-2 right-2 w-16 h-16 bg-gradient-to-br ${config.color} opacity-10 rounded-full blur-xl`} />
          </div>
        )}

        <CardContent className="p-4 relative">
          {/* Top Section - Icon and Status */}
          <div className="flex items-start justify-between mb-3">
            <div className={`text-4xl transition-all ${collected ? 'scale-100' : 'scale-90 grayscale'}`}>
              {config.icon}
            </div>
            
            {collected ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Fragment Number */}
          <div className="mb-2">
            <Badge 
              variant={collected ? "default" : "secondary"}
              className={collected ? `bg-gradient-to-r ${config.color} text-white border-0` : ''}
            >
              Fragmento #{fragmentNumber}
            </Badge>
          </div>

          {/* Checkpoint Name */}
          <h4 className={`font-semibold text-sm mb-1 ${collected ? config.textColor : 'text-gray-500'}`}>
            {checkpointName}
          </h4>

          {/* Cultural Phrase */}
          {collected && culturalPhrase && (
            <p className="text-xs text-gray-600 italic mt-2 border-t pt-2">
              "{culturalPhrase}"
            </p>
          )}

          {/* Collection Date */}
          {collected && collectedAt && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-gray-500">
                Coletado em: {new Date(collectedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Locked State */}
          {!collected && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Visite o checkpoint para coletar
              </p>
            </div>
          )}
        </CardContent>

        {/* Stamp Pattern Background */}
        {collected && (
          <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5">
            <svg viewBox="0 0 100 100" className={`w-full h-full ${config.textColor}`}>
              <circle cx="50" cy="50" r="45" fill="currentColor" />
            </svg>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default AnimalStampCard;
