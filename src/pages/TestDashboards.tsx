import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Globe, 
  Crown, 
  Play, 
  Trash2,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { simulateLogin, clearTestData, getTestData, testUrls, availableRoles } from '@/utils/testDashboards';
import { useNavigate } from 'react-router-dom';

const TestDashboards = () => {
  const navigate = useNavigate();
  const currentTestData = getTestData();

  const roleConfigs = [
    {
      role: 'atendente',
      title: 'Atendente',
      description: 'Acesso limitado a check-ins e informações básicas',
      icon: <Users className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
      features: ['Check-ins', 'Informações turísticas', 'Suporte ao turista']
    },
    {
      role: 'gestor_municipal',
      title: 'Gestor Municipal',
      description: 'Gestão de destinos e eventos da cidade',
      icon: <Building2 className="h-8 w-8 text-green-600" />,
      color: 'bg-green-50 border-green-200',
      features: ['Destinos municipais', 'Eventos locais', 'Relatórios municipais']
    },
    {
      role: 'gestor_igr',
      title: 'Gestor Regional',
      description: 'Visão das cidades da região turística',
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200',
      features: ['Cidades da região', 'Eventos regionais', 'Analytics regional']
    },
    {
      role: 'diretor_estadual',
      title: 'Diretor Estadual',
      description: 'Controle total do turismo estadual',
      icon: <Crown className="h-8 w-8 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200',
      features: ['Todas as regiões', 'Eventos estaduais', 'Relatórios completos']
    }
  ];

  const handleTestLogin = (role: string) => {
    simulateLogin(role as any);
    navigate('/ms/admin');
  };

  const handleClearTest = () => {
    clearTestData();
    window.location.reload();
  };

  const handleGoToAdmin = () => {
    navigate('/ms/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🧪 Teste da Fase 2 - Dashboards Administrativos
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Teste os diferentes níveis de acesso e dashboards personalizados
            </p>
            
            {currentTestData && (
              <div className="inline-flex items-center gap-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-6">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Modo de teste ativo: {currentTestData.userProfile.full_name}
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {currentTestData.userProfile.role}
                </Badge>
              </div>
            )}
            
            <div className="flex justify-center gap-4">
              <Button onClick={handleGoToAdmin} className="bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ir para Admin Portal
              </Button>
              {currentTestData && (
                <Button onClick={handleClearTest} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Teste
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roleConfigs.map((config) => (
              <Card key={config.role} className={`border-2 ${config.color} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      {config.icon}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {config.title}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Funcionalidades:</h4>
                      <div className="flex flex-wrap gap-2">
                        {config.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="bg-white">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleTestLogin(config.role)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Testar Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(testUrls[config.role as keyof typeof testUrls], '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                📋 Instruções de Teste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">1. Teste Rápido:</h4>
                  <p className="text-gray-600 mb-2">
                    Clique em "Testar Dashboard" em qualquer card acima para simular o login e acessar o dashboard específico.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">2. Console do Navegador:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                    <p className="text-gray-700 mb-2">// Abra F12 → Console e digite:</p>
                    <p className="text-blue-600">simulateLogin('atendente')</p>
                    <p className="text-blue-600">simulateLogin('gestor_municipal')</p>
                    <p className="text-blue-600">simulateLogin('gestor_igr')</p>
                    <p className="text-blue-600">simulateLogin('diretor_estadual')</p>
                    <p className="text-gray-500 mt-2">// Limpar dados: clearTestData()</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">3. URLs Diretas:</h4>
                  <div className="space-y-2">
                    {Object.entries(testUrls).map(([role, url]) => (
                      <div key={role} className="flex items-center gap-2">
                        <Badge variant="outline" className="w-20 justify-center">
                          {role}
                        </Badge>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {url}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Dica:</h4>
                  <p className="text-blue-800">
                    Cada dashboard tem funcionalidades específicas baseadas no nível de acesso. 
                    Teste todos para ver as diferenças na interface e permissões.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default TestDashboards; 