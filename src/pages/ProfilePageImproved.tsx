import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Camera, 
  Award, 
  Share2, 
  History, 
  Info,
  MapPin,
  Heart,
  Star,
  Shield,
  Settings,
  Lock,
  Mail,
  Phone,
  Calendar,
  Trophy,
  BookOpen,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PantanalAvatarSelector from '@/components/profile/PantanalAvatarSelector';
import AvatarEducationModal from '@/components/profile/AvatarEducationModal';
import AchievementSystemImproved from '@/components/profile/AchievementSystemImproved';
import ProfileShareModal from '@/components/profile/ProfileShareModal';
import EnvironmentalQuiz from '@/components/profile/EnvironmentalQuiz';
import ProfileSettings from '@/components/profile/ProfileSettings';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_animal: string;
  avatar_history: string[];
  achievements: string[];
  created_at: string;
  updated_at: string;
}

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

const ProfilePageImproved = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<PantanalAnimal | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Dados dos animais do Pantanal (no estilo Guatá)
  const pantanalAnimals: PantanalAnimal[] = [
    {
      id: 'arara-azul',
      name: 'Arara-azul',
      scientific_name: 'Anodorhynchus hyacinthinus',
      image: '/images/avatars/arara-azul.png',
      habitat: 'Cerrado e Pantanal',
      diet: 'Frutas, sementes e nozes',
      curiosities: [
        'Maior papagaio do mundo',
        'Pode viver até 50 anos',
        'Forma casais para toda a vida',
        'Ameaçada de extinção'
      ],
      conservation_status: 'Vulnerável',
      is_unlocked: true
    },
    {
      id: 'tuiuiu',
      name: 'Tuiuiú',
      scientific_name: 'Jabiru mycteria',
      image: '/images/avatars/tuiuiu.png',
      habitat: 'Pantanal e áreas alagadas',
      diet: 'Peixes, anfíbios e insetos',
      curiosities: [
        'Maior ave voadora do Brasil',
        'Símbolo do Pantanal',
        'Pode atingir 1,5m de altura',
        'Constrói ninhos gigantes'
      ],
      conservation_status: 'Pouco Preocupante',
      is_unlocked: true
    },
    {
      id: 'onca-pintada',
      name: 'Onça-pintada',
      scientific_name: 'Panthera onca',
      image: '/images/avatars/onca-pintada.png',
      habitat: 'Pantanal e Mata Atlântica',
      diet: 'Carnívora - capivaras, jacarés',
      curiosities: [
        'Maior felino das Américas',
        'Excelente nadadora',
        'Caça principalmente à noite',
        'Ameaçada de extinção'
      ],
      conservation_status: 'Quase Ameaçada',
      unlock_requirement: 'Completar 3 roteiros do Passaporte',
      is_unlocked: false
    },
    {
      id: 'capivara',
      name: 'Capivara',
      scientific_name: 'Hydrochoerus hydrochaeris',
      image: '/images/avatars/capivara.png',
      habitat: 'Pantanal e áreas alagadas',
      diet: 'Herbívora - gramíneas e plantas aquáticas',
      curiosities: [
        'Maior roedor do mundo',
        'Excelente nadadora',
        'Vive em grupos familiares',
        'Pode ficar submersa por 5 minutos'
      ],
      conservation_status: 'Pouco Preocupante',
      is_unlocked: true
    },
    {
      id: 'jacare-do-pantanal',
      name: 'Jacaré-do-pantanal',
      scientific_name: 'Caiman yacare',
      image: '/images/avatars/jacare-pantanal.png',
      habitat: 'Pantanal e rios',
      diet: 'Peixes, aves e pequenos mamíferos',
      curiosities: [
        'Endêmico do Pantanal',
        'Pode viver até 50 anos',
        'Regula a temperatura corporal',
        'Importante para o ecossistema'
      ],
      conservation_status: 'Pouco Preocupante',
      is_unlocked: true
    }
  ];

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar perfil do usuário
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (profileData) {
        setProfile(profileData);
        setSelectedAvatar(profileData.avatar_animal || '');
      } else {
        // Criar perfil inicial
        const newProfile = {
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          avatar_animal: 'arara-azul',
          avatar_history: ['arara-azul'],
          achievements: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error: insertError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (insertError) throw insertError;
        
        setProfile(data);
        setSelectedAvatar('arara-azul');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil do usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !user) return;

    try {
      const updatedProfile = {
        ...profile,
        full_name: profile.full_name,
        avatar_animal: selectedAvatar,
        updated_at: new Date().toISOString()
      };

      // Adicionar ao histórico se mudou o avatar
      if (selectedAvatar !== profile.avatar_animal) {
        updatedProfile.avatar_history = [
          ...(profile.avatar_history || []),
          selectedAvatar
        ].slice(-10); // Manter apenas os últimos 10
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updatedProfile)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(updatedProfile);
      setEditing(false);
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarSelect = (animalId: string) => {
    setSelectedAvatar(animalId);
    setShowAvatarSelector(false);
  };

  const handleAnimalInfo = (animal: PantanalAnimal) => {
    setSelectedAnimal(animal);
    setShowEducationModal(true);
  };

  const getCurrentAnimal = () => {
    return pantanalAnimals.find(animal => animal.id === selectedAvatar);
  };

  if (loading) {
    return (
      <UniversalLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ms-primary-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  if (!profile) {
    return (
      <UniversalLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
          <div className="text-center">
            <p className="text-gray-600">Erro ao carregar perfil do usuário.</p>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  const currentAnimal = getCurrentAnimal();

  return (
    <UniversalLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-ms-primary-blue to-green-600 text-white py-12">
          <div className="ms-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-white/20">
                    <AvatarImage 
                      src={currentAnimal?.image} 
                      alt={currentAnimal?.name}
                    />
                    <AvatarFallback className="bg-white text-ms-primary-blue text-3xl font-bold">
                      {currentAnimal?.name.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white text-ms-primary-blue hover:bg-gray-100"
                    onClick={() => setShowAvatarSelector(true)}
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {profile.full_name || 'Usuário'}
                  </h1>
                  <p className="text-blue-100 text-lg">{profile.email}</p>
                  {currentAnimal && (
                    <div className="flex items-center space-x-3 mt-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {currentAnimal.name}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                        onClick={() => handleAnimalInfo(currentAnimal)}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Sobre o animal
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ms-container py-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Conquistas
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="animals" className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Animais
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Educação
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <User className="h-5 w-5 mr-2 text-ms-primary-blue" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile({
                          ...profile,
                          full_name: e.target.value
                        })}
                        disabled={!editing}
                        className="border-gray-200 focus:border-ms-primary-blue"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>
                  
                  {editing && (
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setEditing(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        className="bg-ms-primary-blue hover:bg-blue-700"
                      >
                        Salvar Alterações
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <AchievementSystemImproved 
                achievements={profile.achievements}
                pantanalAnimals={pantanalAnimals}
              />
            </TabsContent>

            <TabsContent value="quiz">
              <EnvironmentalQuiz 
                animals={pantanalAnimals}
                onQuizComplete={(score) => {
                  toast({
                    title: "Quiz Concluído!",
                    description: `Você acertou ${score}% das perguntas!`,
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="animals">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Heart className="h-5 w-5 mr-2 text-green-600" />
                    Galeria de Animais do Pantanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pantanalAnimals.map((animal) => (
                      <Card key={animal.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={animal.image} alt={animal.name} />
                              <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                                {animal.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{animal.name}</h3>
                              <p className="text-sm text-gray-600 italic">{animal.scientific_name}</p>
                              <Badge 
                                variant={animal.conservation_status === 'Pouco Preocupante' ? 'default' : 'destructive'}
                                className="text-xs mt-1"
                              >
                                {animal.conservation_status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleAnimalInfo(animal)}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            Saiba mais
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <History className="h-5 w-5 mr-2 text-purple-600" />
                    Histórico de Avatares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {profile.avatar_history?.map((animalId, index) => {
                      const animal = pantanalAnimals.find(a => a.id === animalId);
                      return animal ? (
                        <div key={index} className="text-center">
                          <Avatar className="h-16 w-16 mx-auto mb-2">
                            <AvatarImage src={animal.image} alt={animal.name} />
                            <AvatarFallback>{animal.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm text-gray-600">{animal.name}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Target className="h-5 w-5 mr-2 text-green-600" />
                    Educação Ambiental
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Aprenda sobre o Pantanal</h3>
                    <p className="text-gray-600 mb-6">
                      Descubra a incrível biodiversidade do Pantanal e como você pode ajudar na conservação.
                    </p>
                    <Button 
                      onClick={() => setShowQuiz(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Iniciar Quiz Educativo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modais */}
      {showAvatarSelector && (
        <PantanalAvatarSelector
          animals={pantanalAnimals}
          selectedAvatar={selectedAvatar}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}

      {showEducationModal && selectedAnimal && (
        <AvatarEducationModal
          animal={selectedAnimal}
          onClose={() => setShowEducationModal(false)}
        />
      )}

      {showShareModal && (
        <ProfileShareModal
          profile={profile}
          currentAnimal={currentAnimal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showQuiz && (
        <EnvironmentalQuiz
          animals={pantanalAnimals}
          onClose={() => setShowQuiz(false)}
          onQuizComplete={(score) => {
            toast({
              title: "Quiz Concluído!",
              description: `Você acertou ${score}% das perguntas!`,
            });
          }}
        />
      )}

      {showSettings && (
        <ProfileSettings
          profile={profile}
          onClose={() => setShowSettings(false)}
          onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}
    </UniversalLayout>
  );
};

export default ProfilePageImproved;

