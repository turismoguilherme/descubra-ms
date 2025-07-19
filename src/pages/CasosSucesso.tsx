import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Quote, MapPin, Users, TrendingUp, Award, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import RestoredNavbar from '@/components/layout/RestoredNavbar';

const CasosSucesso = () => {
  const mainCase = {
    state: "Mato Grosso do Sul",
    title: "Descubra MS: Pioneiro em Turismo Digital",
    description: "O primeiro estado a implementar nossa solução completa, revolucionando a experiência turística com tecnologia de ponta.",
    image: "/placeholder.svg",
    results: [
      { metric: "15.000+", label: "Usuários Ativos" },
      { metric: "80+", label: "Destinos Cadastrados" },
      { metric: "200+", label: "Eventos Promovidos" },
      { metric: "95%", label: "Satisfação dos Usuários" }
    ],
    challenges: [
      "Necessidade de digitalizar o turismo estadual",
      "Engajar turistas com experiências interativas",
      "Centralizar informações turísticas dispersas",
      "Criar sistema de gamificação atrativo"
    ],
    solutions: [
      "Implementação do Passaporte Digital com sistema de pontos",
      "Plataforma centralizada para todos os destinos",
      "IA integrada para recomendações personalizadas",
      "Sistema de gestão completo para municípios"
    ],
    testimonial: {
      text: "A FlowTrip transformou completamente nossa estratégia de turismo digital. O engajamento dos visitantes aumentou significativamente com o sistema de gamificação.",
      author: "Secretaria de Turismo - MS",
      role: "Gestão Estadual de Turismo"
    }
  };

  const otherCases = [
    {
      state: "Projeto Piloto - Goiás",
      title: "Expansão para o Centro-Oeste",
      description: "Implementação em fase de planejamento para digitalizar o turismo goiano.",
      status: "Em Desenvolvimento",
      expectedResults: ["50+ destinos", "Integração com agências locais", "Foco em ecoturismo"],
      timeline: "Q2 2024"
    },
    {
      state: "Projeto Piloto - Mato Grosso",
      title: "Turismo Sustentável Digital",
      description: "Foco em turismo ecológico e sustentável com tecnologia avançada.",
      status: "Planejamento",
      expectedResults: ["Pantanal digital", "Trilhas gamificadas", "Educação ambiental"],
      timeline: "Q3 2024"
    }
  ];

  const metrics = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      value: "25.000+",
      label: "Usuários Impactados",
      description: "Turistas que já utilizaram nossa plataforma"
    },
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      value: "100+",
      label: "Destinos Digitalizados",
      description: "Locais turísticos cadastrados e ativos"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      value: "300%",
      label: "Aumento no Engajamento",
      description: "Comparado aos métodos tradicionais"
    },
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      value: "98%",
      label: "Uptime da Plataforma",
      description: "Disponibilidade e confiabilidade"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <RestoredNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Casos de
            <span className="block text-yellow-400">Sucesso</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Veja como estados e regiões já estão transformando o turismo com a FlowTrip
          </p>
          <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300">
            <Link to="/contato">Seja o Próximo Caso de Sucesso</Link>
          </Button>
        </div>
      </section>

      {/* Main Case Study - MS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <Badge className="mb-4 bg-blue-600 text-white">Caso Principal</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {mainCase.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {mainCase.description}
              </p>
              <div className="space-y-4 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Principais Desafios:</h4>
                  <ul className="space-y-1">
                    {mainCase.challenges.map((challenge, idx) => (
                      <li key={idx} className="text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Soluções Implementadas:</h4>
                  <ul className="space-y-1">
                    {mainCase.solutions.map((solution, idx) => (
                      <li key={idx} className="text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Link to="/ms" className="flex items-center text-white">
                  Visitar Descubra MS
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-lg">
              <img 
                src={mainCase.image} 
                alt={mainCase.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <div className="grid grid-cols-2 gap-4">
                {mainCase.results.map((result, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.metric}</div>
                    <div className="text-sm text-gray-600">{result.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <Quote className="h-8 w-8 text-blue-600 mb-4" />
              <blockquote className="text-lg text-gray-900 mb-4 italic">
                "{mainCase.testimonial.text}"
              </blockquote>
              <div className="flex items-center">
                <div>
                  <div className="font-semibold text-gray-900">{mainCase.testimonial.author}</div>
                  <div className="text-sm text-gray-600">{mainCase.testimonial.role}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Resultados Comprovados
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Números que demonstram o impacto real da nossa solução
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <Card key={index} className="text-center border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">{metric.icon}</div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{metric.value}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{metric.label}</h3>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Cases */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Próximos Casos de Sucesso
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Estados que estão em processo de implementação da FlowTrip
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherCases.map((caseStudy, index) => (
              <Card key={index} className="border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{caseStudy.title}</h3>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      {caseStudy.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{caseStudy.description}</p>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Resultados Esperados:</h4>
                    <ul className="space-y-1">
                      {caseStudy.expectedResults.map((result, idx) => (
                        <li key={idx} className="text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-sm text-gray-500">
                    Timeline: {caseStudy.timeline}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Quer ser o Próximo Caso de Sucesso?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Transforme o turismo do seu estado com a tecnologia mais avançada do mercado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300">
              <Link to="/contato">Agendar Demonstração</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
              <Link to="/precos">Ver Planos e Preços</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 FlowTrip. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default CasosSucesso;