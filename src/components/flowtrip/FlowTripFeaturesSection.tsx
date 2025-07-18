
import React from 'react';
import { Database, Users, BarChart3, Shield } from 'lucide-react';

const FlowTripFeaturesSection = () => {
  const features = [
    {
      icon: Database,
      title: 'Gestão de Dados',
      description: 'Centralização e organização de todas as informações turísticas do estado ou município em uma única plataforma.'
    },
    {
      icon: Users,
      title: 'Conectividade',
      description: 'Integração entre visitantes, empresas turísticas e gestores públicos para criar um ecossistema colaborativo.'
    },
    {
      icon: BarChart3,
      title: 'Análise e Relatórios',
      description: 'Dashboards e relatórios detalhados que fornecem insights estratégicos para tomada de decisões.'
    },
    {
      icon: Shield,
      title: 'Segurança Governamental',
      description: 'Infraestrutura segura e confiável, adequada para órgãos públicos com conformidade LGPD.'
    }
  ];

  return (
    <section id="funcionalidades" className="py-20 bg-flowtrip-gray-light">
      <div className="flowtrip-container">
        <div className="text-center mb-16">
          <h2 className="flowtrip-title-section mb-6">Como Funciona</h2>
          <p className="flowtrip-text-lead max-w-3xl mx-auto">
            Plataforma completa que moderniza a gestão turística através de tecnologia 
            profissional e processos otimizados
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flowtrip-card text-center">
              <div className="w-16 h-16 bg-flowtrip-navy-primary rounded-lg flex items-center justify-center mx-auto mb-6">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-flowtrip-navy-primary mb-4">
                {feature.title}
              </h3>
              <p className="flowtrip-text-lead">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlowTripFeaturesSection;
