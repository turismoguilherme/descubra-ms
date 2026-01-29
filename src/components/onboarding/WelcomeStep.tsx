/**
 * Etapa de Boas-vindas do Onboarding
 * Introduz o usuário ao ViajARTur e explica o processo
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Target, 
  BarChart3, 
  Users, 
  Brain,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface WelcomeStepProps {
  data: unknown;
  onNext: (data?: unknown) => void;
  onPrevious: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const features = [
    {
      icon: <Brain className="h-6 w-6 text-blue-500" />,
      title: 'Diagnóstico Inteligente',
      description: 'Avalie o desempenho do seu negócio com IA'
    },
    {
      icon: <Target className="h-6 w-6 text-green-500" />,
      title: 'Recomendações Personalizadas',
      description: 'Receba sugestões específicas para sua empresa'
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
      title: 'Analytics Avançados',
      description: 'Acompanhe métricas e performance em tempo real'
    },
    {
      icon: <Users className="h-6 w-6 text-orange-500" />,
      title: 'Gestão de Clientes',
      description: 'Organize e acompanhe seus clientes'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          <span>Bem-vindo ao ViajARTur</span>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800">
          Vamos personalizar sua experiência
        </h2>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          O ViajARTur é uma plataforma inteligente que ajuda empresas de turismo a 
          otimizar seu desempenho através de diagnósticos personalizados e 
          recomendações baseadas em IA.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Process Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Como funciona o processo de configuração
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto">
              <span className="font-bold">1</span>
            </div>
            <h4 className="font-medium text-sm">Perfil</h4>
            <p className="text-xs text-gray-600">Configure seu negócio</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto">
              <span className="font-bold">2</span>
            </div>
            <h4 className="font-medium text-sm">Diagnóstico</h4>
            <p className="text-xs text-gray-600">Avalie performance</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto">
              <span className="font-bold">3</span>
            </div>
            <h4 className="font-medium text-sm">Análise</h4>
            <p className="text-xs text-gray-600">IA processa dados</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto">
              <span className="font-bold">4</span>
            </div>
            <h4 className="font-medium text-sm">Resultados</h4>
            <p className="text-xs text-gray-600">Receba recomendações</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          O que você vai ganhar
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              <strong>+25%</strong> aumento médio na receita
            </span>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              <strong>+40%</strong> melhoria na satisfação
            </span>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              <strong>+60%</strong> otimização de processos
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          O processo leva apenas <strong>5-10 minutos</strong> e é totalmente gratuito
        </p>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Dados seguros e privados</span>
          <span>•</span>
          <span>Sem compromisso</span>
          <span>•</span>
          <span>Resultados imediatos</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
