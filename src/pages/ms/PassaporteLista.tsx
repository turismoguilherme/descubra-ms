import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  Users,
  Star,
  ArrowRight,
  Compass
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PassaporteRoute {
  id: string;
  name: string;
  description: string;
  image: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  duration: string;
  checkpoints: number;
  completed: boolean;
  progress: number;
}

const mockRoutes: PassaporteRoute[] = [
  {
    id: 'rota-pantanal',
    name: 'Rota do Pantanal',
    description: 'Explore a rica biodiversidade do Pantanal Sul.',
    image: '/images/pantanal-route.jpg',
    difficulty: 'Médio',
    duration: '3 dias',
    checkpoints: 8,
    completed: false,
    progress: 25
  },
  {
    id: 'rota-bonito',
    name: 'Rota de Bonito',
    description: 'Descubra as águas cristalinas e cachoeiras de Bonito.',
    image: '/images/bonito-route.jpg',
    difficulty: 'Fácil',
    duration: '2 dias',
    checkpoints: 6,
    completed: true,
    progress: 100
  },
  {
    id: 'rota-dourados',
    name: 'Rota de Dourados',
    description: 'Conheça a cultura e história de Dourados.',
    image: '/images/dourados-route.jpg',
    difficulty: 'Fácil',
    duration: '1 dia',
    checkpoints: 4,
    completed: false,
    progress: 50
  },
  {
    id: 'rota-corumba',
    name: 'Rota de Corumbá',
    description: 'Aventure-se na fronteira com a Bolívia.',
    image: '/images/corumba-route.jpg',
    difficulty: 'Difícil',
    duration: '4 dias',
    checkpoints: 10,
    completed: false,
    progress: 0
  },
  {
    id: 'rota-tres-lagoas',
    name: 'Rota de Três Lagoas',
    description: 'Explore as lagoas e belezas naturais.',
    image: '/images/tres-lagoas-route.jpg',
    difficulty: 'Médio',
    duration: '2 dias',
    checkpoints: 5,
    completed: false,
    progress: 20
  },
  {
    id: 'rota-campo-grande',
    name: 'Rota de Campo Grande',
    description: 'Descubra a capital do estado.',
    image: '/images/campo-grande-route.jpg',
    difficulty: 'Fácil',
    duration: '1 dia',
    checkpoints: 3,
    completed: true,
    progress: 100
  }
];

const PassaporteLista = () => {
  console.log("📱 PASSAPORTE LISTA: Componente PassaporteLista sendo renderizado");
  
  const [routes, setRoutes] = useState<PassaporteRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("📱 PASSAPORTE LISTA: Carregando rotas...");
    
    // Simular carregamento
    const timer = setTimeout(() => {
      setRoutes(mockRoutes);
      setLoading(false);
      console.log("📱 PASSAPORTE LISTA: Rotas carregadas:", mockRoutes.length);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    console.log("📱 PASSAPORTE LISTA: Renderizando loading");
    return (
      <UniversalLayout>
        <div className="bg-gray-50 flex items-center justify-center py-16">
          <div className="text-center">
            <Compass className="w-16 h-16 mx-auto mb-4 animate-spin text-ms-primary-blue" />
            <p className="text-lg text-gray-600">Carregando rotas...</p>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  console.log("📱 PASSAPORTE LISTA: Renderizando lista de rotas");

  return (
    <UniversalLayout>
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-ms-primary-blue mb-4">
              Passaporte Digital
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Colecione selos virtuais explorando os destinos únicos de Mato Grosso do Sul
            </p>
          </div>

          {/* Routes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <Card key={route.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-ms-primary-blue to-ms-secondary-green relative">
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-white" />
                  </div>
                  <Badge 
                    className={`absolute top-4 right-4 ${getDifficultyColor(route.difficulty)}`}
                  >
                    {route.difficulty}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">{route.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{route.description}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {route.duration}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {route.checkpoints} pontos
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{route.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-ms-accent-orange h-2 rounded-full transition-all duration-300"
                          style={{ width: `${route.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      asChild 
                      className="w-full mt-4"
                      variant={route.completed ? "outline" : "default"}
                    >
                      <Link to={`/descubramatogrossodosul/passaporte/${route.id}`}>
                        {route.completed ? 'Ver Detalhes' : 'Iniciar Rota'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Suas Conquistas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-ms-primary-blue">
                  {routes.filter(r => r.completed).length}
                </div>
                <div className="text-gray-600">Rotas Concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ms-accent-orange">
                  {routes.reduce((sum, r) => sum + r.checkpoints, 0)}
                </div>
                <div className="text-gray-600">Pontos Totais</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ms-accent-orange">
                  {routes.reduce((sum, r) => sum + (r.completed ? r.checkpoints : 0), 0)}
                </div>
                <div className="text-gray-600">Selos Coletados</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default PassaporteLista;