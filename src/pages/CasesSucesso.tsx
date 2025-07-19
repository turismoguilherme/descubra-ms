import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Users, TrendingUp, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMultiTenant } from '@/config/multiTenant';

const CasesSucesso: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, getPathWithTenant } = useMultiTenant();

  const successCases = [
    {
      id: 1,
      title: 'Mato Grosso do Sul - Transformação Digital',
      description: 'Implementação completa da plataforma FlowTrip resultou em aumento de 60% no turismo regional',
      metrics: {
        turismo: '+60%',
        satisfacao: '4.9/5',
        receita: '+45%',
        tempo: '6 meses'
      },
      region: 'Estado Completo',
      status: 'Concluído',
      highlights: ['10 regiões implementadas', 'IA integrada', 'Acessibilidade completa', 'Multi-tenant']
    },
    {
      id: 2,
      title: 'Bonito - Ecoturismo Inteligente',
      description: 'Sistema de gestão turística com IA para destinos de ecoturismo',
      metrics: {
        turismo: '+80%',
        satisfacao: '4.8/5',
        receita: '+65%',
        tempo: '4 meses'
      },
      region: 'Bonito / Serra da Bodoquena',
      status: 'Ativo',
      highlights: ['Mapa interativo', 'Recomendações IA', 'Gestão de reservas', 'Analytics avançado']
    },
    {
      id: 3,
      title: 'Pantanal - Turismo Sustentável',
      description: 'Plataforma focada em turismo rural e sustentável',
      metrics: {
        turismo: '+40%',
        satisfacao: '4.7/5',
        receita: '+35%',
        tempo: '8 meses'
      },
      region: 'Pantanal',
      status: 'Em expansão',
      highlights: ['Turismo rural', 'Sustentabilidade', 'Comunidade local', 'Preservação']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(getPathWithTenant('/'))}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Casos de Sucesso
              </h1>
              <p className="text-gray-600">
                Histórico de implementações bem-sucedidas da FlowTrip
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {successCases.map((case_) => (
            <Card key={case_.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{case_.title}</CardTitle>
                    <CardDescription className="mt-2">{case_.description}</CardDescription>
                  </div>
                  <Badge 
                    variant={case_.status === 'Concluído' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {case_.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{case_.metrics.turismo}</div>
                    <div className="text-sm text-gray-600">Turismo</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{case_.metrics.satisfacao}</div>
                    <div className="text-sm text-gray-600">Satisfação</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{case_.metrics.receita}</div>
                    <div className="text-sm text-gray-600">Receita</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{case_.metrics.tempo}</div>
                    <div className="text-sm text-gray-600">Tempo</div>
                  </div>
                </div>

                {/* Região */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {case_.region}
                </div>

                {/* Destaques */}
                <div>
                  <h4 className="font-semibold mb-2">Destaques da Implementação:</h4>
                  <div className="flex flex-wrap gap-2">
                    {case_.highlights.map((highlight, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/master-dashboard')}
                  >
                    Ver Detalhes
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/contato')}
                  >
                    Solicitar Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Quer ser o próximo caso de sucesso?
              </h2>
              <p className="mb-6 opacity-90">
                Transforme sua região turística com a tecnologia da FlowTrip
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/contato')}
                >
                  Falar com Especialista
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => navigate('/precos')}
                >
                  Ver Planos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CasesSucesso; 