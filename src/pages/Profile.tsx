import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, BookOpen, Heart, Clock, Target, Share2, Settings, Camera } from "lucide-react";
import UniversalLayout from "@/components/layout/UniversalLayout";

const Profile = () => {
  return (
    <UniversalLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                    G
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Guilherme Arevalo
                  </h1>
                  <p className="text-white/80">Explorador de Mato Grosso do Sul</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm">📍</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Visitas</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm">🏆</span>
                </div>
                <div className="text-2xl font-bold text-green-500">3</div>
                <div className="text-sm text-gray-600">Rotas</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm">🎖️</span>
                </div>
                <div className="text-2xl font-bold text-yellow-500">8</div>
                <div className="text-sm text-gray-600">Selos</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm">⭐</span>
                </div>
                <div className="text-2xl font-bold text-purple-500">5</div>
                <div className="text-sm text-gray-600">Conquistas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegação */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="perfil" className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-transparent h-auto p-0">
                <TabsTrigger value="perfil" className="flex items-center space-x-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                  <User className="w-4 h-4" />
                  <span>Perfil</span>
                </TabsTrigger>
                <TabsTrigger value="conquistas" className="flex items-center space-x-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                  <Trophy className="w-4 h-4" />
                  <span>Conquistas</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center space-x-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                  <BookOpen className="w-4 h-4" />
                  <span>Quiz</span>
                </TabsTrigger>
                <TabsTrigger value="animais" className="flex items-center space-x-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                  <Heart className="w-4 h-4" />
                  <span>Animais</span>
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex items-center space-x-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                  <Clock className="w-4 h-4" />
                  <span>Histórico</span>
                </TabsTrigger>
                <TabsTrigger value="educacao" className="flex items-center space-x-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                  <Target className="w-4 h-4" />
                  <span>Educação</span>
                </TabsTrigger>
              </TabsList>

              {/* Conteúdo da aba Perfil */}
              <TabsContent value="perfil" className="p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center space-x-2 mb-6">
                    <User className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Informações Pessoais</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        defaultValue="Guilherme Arevalo"
                        placeholder="Guilherme Arevalo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        defaultValue="guilherme@email.com"
                        disabled
                        placeholder="guilherme@email.com"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Salvar Perfil
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Conteúdo das outras abas */}
              <TabsContent value="conquistas" className="p-6">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-semibold mb-6">Conquistas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🏆</div>
                          <div className="flex-1">
                            <div className="font-medium">Primeiro Passo</div>
                            <div className="text-sm text-gray-600">Complete sua primeira rota</div>
                            <div className="text-xs text-green-600 mt-1">Desbloqueado em 15/01/2024</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🗺️</div>
                          <div className="flex-1">
                            <div className="font-medium">Explorador</div>
                            <div className="text-sm text-gray-600">Visite 5 destinos diferentes</div>
                            <div className="text-xs text-green-600 mt-1">Desbloqueado em 10/02/2024</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">⛰️</div>
                          <div className="flex-1">
                            <div className="font-medium">Aventureiro</div>
                            <div className="text-sm text-gray-600">Complete 3 rotas difíceis</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quiz" className="p-6">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-semibold mb-6">Quiz do Descubra MS</h2>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4">🧠</div>
                      <h3 className="text-xl font-semibold mb-2">Teste seus conhecimentos!</h3>
                      <p className="text-gray-600 mb-6">
                        Responda perguntas sobre Mato Grosso do Sul e ganhe badges especiais
                      </p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Fazer Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="animais" className="p-6">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-semibold mb-6">Animais do Pantanal</h2>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4">🦦</div>
                      <h3 className="text-xl font-semibold mb-2">Escolha seu Avatar</h3>
                      <p className="text-gray-600 mb-6">
                        Selecione um animal do Pantanal como seu avatar
                      </p>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Heart className="w-4 h-4 mr-2" />
                        Escolher Animal
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="historico" className="p-6">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-semibold mb-6">Histórico de Atividades</h2>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-4 h-4 text-green-500">📍</div>
                          <div className="flex-1">
                            <div className="font-medium">Rota de Bonito Concluída</div>
                            <div className="text-sm text-gray-600">Você completou a Rota de Bonito e ganhou 150 pontos!</div>
                            <div className="text-xs text-gray-500">15/03/2024</div>
                          </div>
                          <div className="text-orange-500 text-sm font-medium">+150 pts</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-4 h-4 text-yellow-500">🎖️</div>
                          <div className="flex-1">
                            <div className="font-medium">Selo do Pantanal</div>
                            <div className="text-sm text-gray-600">Novo selo coletado na Estação Natureza</div>
                            <div className="text-xs text-gray-500">14/03/2024</div>
                          </div>
                          <div className="text-orange-500 text-sm font-medium">+50 pts</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="educacao" className="p-6">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-semibold mb-6">Educação e Aprendizado</h2>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Progresso do Nível</h3>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Nível 3</span>
                            <span className="text-sm text-gray-600">750/1000 XP</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                          </div>
                        </div>
                        <p className="text-gray-600">
                          Continue explorando para ganhar mais experiência!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </UniversalLayout>
  );
};

export default Profile;