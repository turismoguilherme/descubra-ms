
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, ChartBar, MessageCircle } from "lucide-react";
import CATSupportAI from "@/components/ai/CATSupportAI";
import AnalyticsAI from "@/components/ai/AnalyticsAI";

// Data sources for AI systems
const dataSources = [
  { id: 1, name: "Fundtur-MS", url: "https://www.turismo.ms.gov.br" },
  { id: 2, name: "MTur", url: "https://www.gov.br/turismo" },
  { id: 3, name: "EMBRATUR", url: "https://www.embratur.com.br" },
  { id: 4, name: "SETESC", url: "https://www.setesc.ms.gov.br" },
  { id: 5, name: "Prefeitura de Campo Grande", url: "https://www.campogrande.ms.gov.br" },
  { id: 6, name: "Observatório do Turismo", url: "https://observatorio.turismo.ms.gov.br" },
  { id: 7, name: "IBGE - Turismo", url: "https://www.ibge.gov.br/estatisticas/turismo" },
  { id: 8, name: "SEBRAE", url: "https://www.sebrae.com.br/turismo" }
];

const ManagementAI = () => {
  const [activeTab, setActiveTab] = useState("systems");
  
  // Track pending questions for CAT Support AI
  const [pendingQuestions, setPendingQuestions] = useState<{question: string, answer: string}[]>([]);
  
  // Handler for recording questions from CAT Support AI
  const handleRecordQuestion = (question: string, answer: string) => {
    setPendingQuestions(prev => [...prev, { question, answer }]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="ms-container">
          <div className="flex items-center mb-6">
            <Bot className="text-ms-primary-blue mr-3 h-6 w-6" />
            <h1 className="text-2xl font-bold text-ms-primary-blue">Gerenciamento de Inteligência Artificial</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            Gerencie os três sistemas de IA integrados ao aplicativo "Descubra Mato Grosso do Sul". 
            Cada sistema atende a um público específico com funcionalidades personalizadas.
          </p>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="systems">Sistemas de IA</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas de Uso</TabsTrigger>
              <TabsTrigger value="content">Gestão de Conteúdo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="systems">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center text-lg">
                          <MessageCircle className="h-5 w-5 mr-2 text-purple-500" />
                          IA para o Turista - Delinha
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Interface pública para todos os usuários</p>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Ativo
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700">
                        A Delinha é a assistente virtual para todos os usuários, inspirada na cantora regional. 
                        Ela fornece informações turísticas e sugestões personalizadas com carisma e identidade local.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Total de usuários</p>
                          <p className="font-medium">2.843</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Interações hoje</p>
                          <p className="font-medium">387</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avaliação média</p>
                          <p className="font-medium">4.8/5.0</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Fonte de dados</p>
                          <p className="font-medium">13 sites oficiais</p>
                        </div>
                      </div>
                      
                      <a 
                        href="/delinha" 
                        className="block mt-4 bg-purple-100 hover:bg-purple-200 text-center py-2 rounded text-purple-800 font-medium text-sm transition-colors"
                      >
                        Acessar Delinha
                      </a>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center text-lg">
                          <Bot className="h-5 w-5 mr-2 text-blue-500" />
                          IA para CATs - Apoio ao Atendimento
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Exclusivo para atendentes de CATs</p>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Ativo
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700">
                        Auxilia atendentes a responder perguntas difíceis ou específicas 
                        durante o atendimento presencial ou remoto, com acesso a fontes oficiais do turismo.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Atendentes cadastrados</p>
                          <p className="font-medium">42</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Consultas hoje</p>
                          <p className="font-medium">56</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tempo médio de resposta</p>
                          <p className="font-medium">1.2 segundos</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Perguntas registradas</p>
                          <p className="font-medium">1.249</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-blue-50 rounded">
                        <h4 className="font-medium text-sm text-blue-800 mb-2">Testar IA de Apoio ao Atendimento</h4>
                        <CATSupportAI onRecordQuestion={handleRecordQuestion} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center text-lg">
                          <ChartBar className="h-5 w-5 mr-2 text-green-600" />
                          IA para Gestores - Analista Inteligente de Planejamento
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Exclusivo para gestores de turismo</p>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Ativo
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700">
                        Apoia gestores no planejamento estratégico e análise de dados turísticos, cruzando 
                        informações do app, portais oficiais e realizando benchmarking com outros destinos.
                      </p>
                      
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Gestores com acesso</p>
                          <p className="font-medium">18</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Análises realizadas</p>
                          <p className="font-medium">243</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Fontes de dados</p>
                          <p className="font-medium">27 oficiais + app</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Última atualização</p>
                          <p className="font-medium">Hoje às 08:45</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-green-50 rounded">
                        <h4 className="font-medium text-sm text-green-800 mb-2">Testar IA Analítica para Gestores</h4>
                        <AnalyticsAI />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Uso dos Sistemas de IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Visão Geral - Últimos 30 dias</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500">Total de interações</p>
                          <p className="text-2xl font-bold">12,487</p>
                          <p className="text-xs text-green-600">+18% vs mês anterior</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500">Usuários únicos</p>
                          <p className="text-2xl font-bold">3,254</p>
                          <p className="text-xs text-green-600">+24% vs mês anterior</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500">Taxa de satisfação</p>
                          <p className="text-2xl font-bold">94.2%</p>
                          <p className="text-xs text-green-600">+3.5% vs mês anterior</p>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-2">Distribuição por sistema</h4>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="mb-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Delinha (IA para Turistas)</span>
                            <span className="text-sm font-medium">68%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">IA para CATs</span>
                            <span className="text-sm font-medium">22%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">IA para Gestores</span>
                            <span className="text-sm font-medium">10%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Principais consultas - Delinha</h3>
                        <ul className="space-y-2">
                          <li className="bg-white p-3 rounded shadow-sm">
                            <div className="flex justify-between">
                              <span>"Como chegar em Bonito?"</span>
                              <span className="text-gray-500 text-sm">243x</span>
                            </div>
                          </li>
                          <li className="bg-white p-3 rounded shadow-sm">
                            <div className="flex justify-between">
                              <span>"O que fazer no Pantanal?"</span>
                              <span className="text-gray-500 text-sm">187x</span>
                            </div>
                          </li>
                          <li className="bg-white p-3 rounded shadow-sm">
                            <div className="flex justify-between">
                              <span>"Eventos em Campo Grande"</span>
                              <span className="text-gray-500 text-sm">142x</span>
                            </div>
                          </li>
                          <li className="bg-white p-3 rounded shadow-sm">
                            <div className="flex justify-between">
                              <span>"Onde comer em Bonito"</span>
                              <span className="text-gray-500 text-sm">121x</span>
                            </div>
                          </li>
                          <li className="bg-white p-3 rounded shadow-sm">
                            <div className="flex justify-between">
                              <span>"Melhor época para visitar MS"</span>
                              <span className="text-gray-500 text-sm">98x</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Horários de Pico</h3>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Manhã (6h - 12h)</span>
                                <span>24%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '24%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Tarde (12h - 18h)</span>
                                <span>38%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-orange-400 h-2 rounded-full" style={{ width: '38%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Noite (18h - 00h)</span>
                                <span>32%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '32%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Madrugada (00h - 6h)</span>
                                <span>6%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-indigo-400 h-2 rounded-full" style={{ width: '6%' }}></div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-4">
                            Pico máximo: Terças e quintas entre 16h e 18h
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Conteúdo das IAs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-3">Fontes de Dados Ativas</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dataSources.map(source => (
                          <div key={source.id} className="bg-white p-3 rounded shadow-sm">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{source.name}</h4>
                                <p className="text-xs text-gray-500 truncate">{source.url}</p>
                              </div>
                              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-800">
                        O sistema atualiza automaticamente os dados a cada 24 horas de todas as fontes oficiais.
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-3">Perguntas registradas no CAT</h3>
                      
                      {pendingQuestions.length > 0 ? (
                        <div className="space-y-3">
                          {pendingQuestions.map((item, index) => (
                            <div key={index} className="bg-white p-3 rounded shadow-sm">
                              <p className="font-medium">{item.question}</p>
                              <p className="text-sm text-gray-600 mt-1">{item.answer}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white p-4 rounded text-center text-gray-500">
                          Nenhuma pergunta registrada nesta sessão. Use o simulador do CAT para testar.
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-3">Filtros de Conteúdo Ofensivo</h3>
                      
                      <div className="bg-white p-4 rounded shadow-sm">
                        <p className="text-sm mb-3">
                          Todas as IAs possuem filtros automáticos para bloquear conteúdo ofensivo, incluindo:
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">Racismo</span>
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">Homofobia</span>
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">Xenofobia</span>
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">Discriminação</span>
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">Discurso de ódio</span>
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">Assédio</span>
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">Conteúdo adulto</span>
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">+35 categorias</span>
                        </div>
                        
                        <div className="mt-4 flex items-center">
                          <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-green-700">Filtragem de conteúdo ativa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ManagementAI;
