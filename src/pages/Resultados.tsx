import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMultiTenant } from '@/config/multiTenant';

const Resultados: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, getPathWithTenant } = useMultiTenant();

  const mockResults = [
    {
      id: 1,
      title: 'Aumento de 45% no Turismo Regional',
      description: 'Análise dos últimos 6 meses mostra crescimento significativo',
      metric: '+45%',
      period: 'Últimos 6 meses',
      region: 'Bonito / Serra da Bodoquena'
    },
    {
      id: 2,
      title: 'Satisfação do Turista em 4.8/5',
      description: 'Avaliações positivas superam expectativas',
      metric: '4.8/5',
      period: 'Último trimestre',
      region: 'Pantanal'
    },
    {
      id: 3,
      title: 'Receita Turística +30%',
      description: 'Impacto econômico positivo na região',
      metric: '+30%',
      period: 'Último ano',
      region: 'Caminho dos Ipês'
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
                Resultados e Métricas
              </h1>
              <p className="text-gray-600">
                Análise dos resultados turísticos de {currentTenant.fullName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockResults.map((result) => (
            <Card key={result.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {result.metric}
                  </span>
                </div>
                <CardTitle className="text-lg">{result.title}</CardTitle>
                <CardDescription>{result.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {result.region}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {result.period}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
              <CardDescription>
                Como podemos ajudar a melhorar ainda mais esses resultados?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/master-dashboard')}
                  className="flex-1"
                >
                  Acessar Master Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/contato')}
                  className="flex-1"
                >
                  Falar com Especialista
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Resultados; 