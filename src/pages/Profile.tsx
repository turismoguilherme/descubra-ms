import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, BookOpen, Heart, Clock, Target, Share2, Settings, Camera, Sparkles, MapPin, Calendar as CalendarIcon, HandCoins, Building2, Backpack, Star } from "lucide-react";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { platformContentService } from "@/services/admin/platformContentService";

const Profile = () => {
  // Estado do novo fluxo de Roteiros IA
  const [iaPrice, setIaPrice] = useState<number>(49);
  const [iaPaymentLink, setIaPaymentLink] = useState<string>("#");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [showSaveNote, setShowSaveNote] = useState(false);

  const [formData, setFormData] = useState({
    cidade: "Campo Grande",
    datas: "",
    duracao: "3 dias",
    interesses: ["natureza", "gastronomia"],
    orcamento: "médio",
    hospedagem: "hotel 3-4 estrelas",
    perfil: "família",
    ocasiao: "férias",
  });

  // Carregar configurações (preço/link) do admin
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await platformContentService.getContent([
          "ia_route_price_ms",
          "ia_route_payment_link_ms",
        ]);
        const price = parseFloat(
          data.find((d: any) => d.content_key === "ia_route_price_ms")?.content_value || "49"
        );
        const link =
          data.find((d: any) => d.content_key === "ia_route_payment_link_ms")?.content_value || "#";
        if (!Number.isNaN(price)) setIaPrice(price);
        setIaPaymentLink(link || "#");
      } catch (error) {
        console.warn("⚠️ Não foi possível carregar configs IA; usando defaults.", error);
      }
    };
    loadSettings();
  }, []);

  const interessesDisponiveis = useMemo(
    () => [
      { id: "natureza", label: "Natureza" },
      { id: "gastronomia", label: "Gastronomia" },
      { id: "cultura", label: "Cultura" },
      { id: "aventura", label: "Aventura" },
      { id: "familia", label: "Família" },
    ],
    []
  );

  const handleInterestToggle = (id: string) => {
    setFormData((prev) => {
      const exists = prev.interesses.includes(id);
      return {
        ...prev,
        interesses: exists ? prev.interesses.filter((i) => i !== id) : [...prev.interesses, id],
      };
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowSaveNote(false);
    // Mock de geração para evitar chamadas externas
    setTimeout(() => {
      const dias = [
        {
          titulo: "Dia 1 — Chegada e Centro",
          atividades: [
            "Check-in em hotel parceiro no centro",
            "Almoço com gastronomia sul-mato-grossense",
            "Passeio a pé pela praça principal e museu local",
          ],
        },
        {
          titulo: "Dia 2 — Natureza e cultura",
          atividades: [
            "Trilha leve guiada em parque urbano",
            "Visita a feira de artesanato e café regional",
            "Evento local no período (se disponível)",
          ],
        },
        {
          titulo: "Dia 3 — Experiência com parceiros",
          atividades: [
            "Passeio opcional com agência credenciada",
            "Sugestão de restaurante parceiro",
            "Encerramento e feedback",
          ],
        },
      ];

      const eventos = [
        { nome: "Festival Gastronômico", cidade: formData.cidade, data: "Próximo fim de semana" },
        { nome: "Feira de Artes e Cultura", cidade: formData.cidade, data: "Sábado" },
      ];

      const parceiros = [
        { tipo: "Hotel", nome: "Hotel Pantanal Center" },
        { tipo: "Agência", nome: "Agência MS Tours" },
        { tipo: "Transfer", nome: "Translado Conforto MS" },
      ];

      const passaporte = {
        match: true,
        rota: "Roteiro do Pantanal",
      };

      setGeneratedPlan({
        resumo: {
          cidade: formData.cidade,
          duracao: formData.duracao,
          interesses: formData.interesses,
          orcamento: formData.orcamento,
          hospedagem: formData.hospedagem,
          perfil: formData.perfil,
          ocasiao: formData.ocasiao,
        },
        dias,
        eventos,
        parceiros,
        passaporte,
      });
      setIsGenerating(false);
      setShowSaveNote(true);
    }, 800);
  };

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
              <TabsList className="grid w-full grid-cols-7 bg-transparent h-auto p-0">
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
                <TabsTrigger value="roteiros-ia" className="flex items-center space-x-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                  <Sparkles className="w-4 h-4" />
                  <span>Roteiros IA</span>
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

            {/* Aba Roteiros IA */}
            <TabsContent value="roteiros-ia" className="p-6">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Roteiros personalizados por IA (MS)</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Use suas preferências já coletadas no perfil. Ajuste qualquer campo, gere um roteiro rápido e ative pelo link do Stripe (valor editável no admin). Parceiros e Passaporte aparecem só se fizerem sentido para a região/tema.
                </p>

                {showSaveNote && (
                  <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg p-3">
                    Para salvar/ativar, use o botão de pagamento. O admin pode editar preço e link. PDF e edição completa serão habilitados após ativação.
                  </div>
                )}

                {/* Formulário compacto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preferências de viagem</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cidade">Cidade/Região (MS)</Label>
                        <Input
                          id="cidade"
                          value={formData.cidade}
                          onChange={(e) => setFormData((p) => ({ ...p, cidade: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duracao">Duração</Label>
                        <Input
                          id="duracao"
                          value={formData.duracao}
                          onChange={(e) => setFormData((p) => ({ ...p, duracao: e.target.value }))}
                          placeholder="Ex.: 3 dias"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Interesses</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {interessesDisponiveis.map((item) => {
                            const active = formData.interesses.includes(item.id);
                            return (
                              <Button
                                key={item.id}
                                type="button"
                                variant={active ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleInterestToggle(item.id)}
                                className={active ? "bg-blue-600 text-white" : ""}
                              >
                                {item.label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Orçamento</Label>
                          <Input
                            value={formData.orcamento}
                            onChange={(e) => setFormData((p) => ({ ...p, orcamento: e.target.value }))}
                            placeholder="Ex.: baixo / médio / alto"
                          />
                        </div>
                        <div>
                          <Label>Hospedagem</Label>
                          <Input
                            value={formData.hospedagem}
                            onChange={(e) => setFormData((p) => ({ ...p, hospedagem: e.target.value }))}
                            placeholder="Ex.: hotel 3-4 estrelas"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Perfil</Label>
                        <Input
                          value={formData.perfil}
                          onChange={(e) => setFormData((p) => ({ ...p, perfil: e.target.value }))}
                          placeholder="família / casal / solo"
                        />
                      </div>
                      <div>
                        <Label>Ocasião</Label>
                        <Input
                          value={formData.ocasiao}
                          onChange={(e) => setFormData((p) => ({ ...p, ocasiao: e.target.value }))}
                          placeholder="férias, negócios..."
                        />
                      </div>
                      <div>
                        <Label>Datas (opcional)</Label>
                        <Input
                          value={formData.datas}
                          onChange={(e) => setFormData((p) => ({ ...p, datas: e.target.value }))}
                          placeholder="Ex.: 10-12/03"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <HandCoins className="w-4 h-4 text-blue-600" />
                        <span>Ativação: R$ {iaPrice.toFixed(2)} (editável no admin)</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setGeneratedPlan(null)}>
                          Limpar
                        </Button>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                          {isGenerating ? "Gerando..." : "Gerar Roteiro IA"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resultado */}
                {generatedPlan && (
                  <div className="space-y-4">
                    <Card className="border-blue-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          Roteiro gerado (MS)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span>{generatedPlan.resumo.cidade}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                            <span>{generatedPlan.resumo.duracao}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Backpack className="w-4 h-4 text-blue-600" />
                            <span>Interesses: {generatedPlan.resumo.interesses.join(", ")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span>Hospedagem: {generatedPlan.resumo.hospedagem}</span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          {generatedPlan.dias.map((dia: any, idx: number) => (
                            <Card key={idx} className="border-gray-100">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-blue-700">
                                  {dia.titulo}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                  {dia.atividades.map((a: string, i: number) => (
                                    <li key={i}>{a}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <Card className="border-gray-100">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                Eventos sugeridos
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-700">
                              {generatedPlan.eventos.map((ev: any, i: number) => (
                                <div key={i} className="flex justify-between">
                                  <span>{ev.nome}</span>
                                  <span className="text-gray-500">{ev.data}</span>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          <Card className="border-gray-100">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                Parceiros sugeridos
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-700">
                              {generatedPlan.parceiros.map((p: any, i: number) => (
                                <div key={i} className="flex justify-between">
                                  <span>{p.tipo}</span>
                                  <span className="text-gray-600">{p.nome}</span>
                                </div>
                              ))}
                              <p className="text-xs text-gray-500">
                                Usando apenas parceiros cadastrados.
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {generatedPlan.passaporte?.match && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                            <span className="font-semibold">Passaporte sugerido: </span>
                            {generatedPlan.passaporte.rota}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <a href={iaPaymentLink} target="_blank" rel="noopener noreferrer">
                              Ativar e salvar — R$ {iaPrice.toFixed(2)}
                            </a>
                          </Button>
                          <Button variant="outline">Exportar PDF</Button>
                          <Button variant="outline">Editar respostas</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
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