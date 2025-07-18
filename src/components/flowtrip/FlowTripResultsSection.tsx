
import React from 'react';
import { CheckCircle } from 'lucide-react';

const FlowTripResultsSection = () => {
  const benefits = [
    'Aumento de 40% no engajamento turístico',
    'Redução de 60% no tempo de gestão administrativa',
    'Centralização completa de dados turísticos',
    'Relatórios automatizados para tomada de decisão',
    'Integração com sistemas existentes',
    'Suporte técnico especializado 24/7'
  ];

  return (
    <section id="resultados" className="py-20 bg-white">
      <div className="flowtrip-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="flowtrip-title-section mb-6">
              Resultados Comprovados
            </h2>
            <p className="flowtrip-text-lead mb-8">
              FlowTrip não é apenas uma ferramenta - é uma solução completa que 
              entrega resultados mensuráveis para a gestão turística governamental.
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-flowtrip-text-primary font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flowtrip-card">
            <div className="text-center">
              <div className="text-4xl font-bold text-flowtrip-navy-primary mb-4">
                Mato Grosso do Sul
              </div>
              <p className="text-lg text-flowtrip-text-secondary mb-6">
                Primeiro estado brasileiro a implementar gestão turística inteligente
              </p>
              <blockquote className="text-xl italic text-flowtrip-text-primary mb-6">
                "FlowTrip transformou nossa capacidade de gestão turística, 
                proporcionando dados precisos e insights estratégicos."
              </blockquote>
              <div className="text-flowtrip-text-secondary">
                — Secretaria de Turismo de MS
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowTripResultsSection;
