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
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PantanalAvatarSelector from '@/components/profile/PantanalAvatarSelector';
import AvatarEducationModal from '@/components/profile/AvatarEducationModal';
import AchievementSystem from '@/components/profile/AchievementSystem';
import ProfileShareModal from '@/components/profile/ProfileShareModal';

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

const ProfilePage = () => {
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
    },
    {
      id: 'tamandua-bandeira',
      name: 'Tamanduá-bandeira',
      scientific_name: 'Myrmecophaga tridactyla',
      image: '/images/avatars/tamandua-bandeira.png',
      habitat: 'Cerrado e Pantanal',
      diet: 'Formigas e cupins',
      curiosities: [
        'Maior tamanduá do mundo',
        'Língua de até 60cm',
        'Pode comer 30.000 formigas por dia',
        'Ameaçada de extinção'
      ],
      conservation_status: 'Vulnerável',
      unlock_requirement: 'Completar 5 roteiros do Passaporte',
      is_unlocked: false
    },
    {
      id: 'lobo-guara',
      name: 'Lobo-guará',
      scientific_name: 'Chrysocyon brachyurus',
      image: '/images/avatars/lobo-guara.png',
      habitat: 'Cerrado e Pantanal',
      diet: 'Onívora - frutas, pequenos animais',
      curiosities: [
        'Maior canídeo da América do Sul',
        'Patas longas para andar na vegetação',
        'Solitário e territorial',
        'Ameaçado de extinção'
      ],
      conservation_status: 'Quase Ameaçada',
      unlock_requirement: 'Completar 7 roteiros do Passaporte',
      is_unlocked: false
    },
    {
      id: 'ariranha',
      name: 'Ariranha',
      scientific_name: 'Pteronura brasiliensis',
      image: '/images/avatars/ariranha.png',
      habitat: 'Rios e lagos do Pantanal',
      diet: 'Peixes e crustáceos',
      curiosities: [
        'Maior lontra do mundo',
        'Excelente nadadora',
        'Vive em grupos familiares',
        'Ameaçada de extinção'
      ],
      conservation_status: 'Em Perigo',
      unlock_requirement: 'Completar 10 roteiros do Passaporte',
      is_unlocked: false
    },
    {
      id: 'anta',
      name: 'Anta',
      scientific_name: 'Tapirus terrestris',
      image: '/images/avatars/anta.png',
      habitat: 'Pantanal e Mata Atlântica',
      diet: 'Herbívora - frutas e folhas',
      curiosities: [
        'Maior mamífero terrestre do Brasil',
        'Excelente nadadora',
        'Importante dispersora de sementes',
        'Ameaçada de extinção'
      ],
      conservation_status: 'Vulnerável',
      unlock_requirement: 'Completar 4 roteiros do Passaporte',
      is_unlocked: false
    },
    {
      id: 'cervo-do-pantanal',
      name: 'Cervo-do-pantanal',
      scientific_name: 'Blastocerus dichotomus',
      image: '/images/avatars/cervo-pantanal.png',
      habitat: 'Pantanal e áreas alagadas',
      diet: 'Herbívora - plantas aquáticas',
      curiosities: [
        'Maior cervídeo da América do Sul',
        'Excelente nadadora',
        'Patas adaptadas para lama',
        'Ameaçada de extinção'
      ],
      conservation_status: 'Vulnerável',
      unlock_requirement: 'Completar 6 roteiros do Passaporte',
      is_unlocked: false
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
        <div className="min-h-screen flex items-center justify-center">
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
        <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="ms-container">
          <div className="max-w-4xl mx-auto">
            {/* Header do Perfil */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage 
                          src={currentAnimal?.image} 
                          alt={currentAnimal?.name}
                        />
                        <AvatarFallback className="bg-ms-primary-blue text-white text-2xl">
                          {currentAnimal?.name.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        onClick={() => setShowAvatarSelector(true)}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {profile.full_name || 'Usuário'}
                      </h1>
                      <p className="text-gray-600">{profile.email}</p>
                      {currentAnimal && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {currentAnimal.name}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnimalInfo(currentAnimal)}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            Sobre o animal
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button
                      onClick={() => setEditing(!editing)}
                      variant={editing ? "destructive" : "default"}
                    >
                      {editing ? 'Cancelar' : 'Editar Perfil'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Conteúdo Principal */}
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="achievements">Conquistas</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="education">Educação</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={profile.email}
                          disabled
                          className="bg-gray-100"
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
                        <Button onClick={handleSaveProfile}>
                          Salvar Alterações
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements">
                <AchievementSystem 
                  achievements={profile.achievements}
                  pantanalAnimals={pantanalAnimals}
                />
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="h-5 w-5 mr-2" />
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      Educação Ambiental
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pantanalAnimals.map((animal) => (
                        <Card key={animal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={animal.image} alt={animal.name} />
                                <AvatarFallback>{animal.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-semibold">{animal.name}</h3>
                                <p className="text-sm text-gray-600">{animal.scientific_name}</p>
                                <Badge 
                                  variant={animal.conservation_status === 'Pouco Preocupante' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {animal.conservation_status}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-3"
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
            </Tabs>
          </div>
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
    </UniversalLayout>
  );
};

export default ProfilePage;
