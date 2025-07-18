
import React from 'react';
import { MapPin } from 'lucide-react';

const FlowTripStatesSection = () => {
  const states = [
    { name: 'Mato Grosso do Sul', status: 'Implementado', municipalities: '79 municípios' },
    { name: 'São Paulo', status: 'Em desenvolvimento', municipalities: '15 municípios piloto' },
    { name: 'Rio de Janeiro', status: 'Fase de análise', municipalities: '10 municípios' },
    { name: 'Minas Gerais', status: 'Interesse manifestado', municipalities: '20 municípios' },
    { name: 'Paraná', status: 'Negociação', municipalities: '12 municípios' },
    { name: 'Santa Catarina', status: 'Proposta enviada', municipalities: '8 municípios' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Implementado':
        return 'bg-green-100 text-green-800';
      case 'Em desenvolvimento':
        return 'bg-blue-100 text-blue-800';
      case 'Fase de análise':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section id="cases" className="py-20 bg-flowtrip-gray-light">
      <div className="flowtrip-container">
        <div className="text-center mb-16">
          <h2 className="flowtrip-title-section mb-6">Estados Atendidos</h2>
          <p className="flowtrip-text-lead max-w-3xl mx-auto">
            Presença nacional crescente com implementações bem-sucedidas 
            em diferentes regiões do Brasil
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {states.map((state, index) => (
            <div key={index} className="flowtrip-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-flowtrip-navy-primary" />
                  <h3 className="font-bold text-flowtrip-navy-primary">
                    {state.name}
                  </h3>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(state.status)}`}>
                  {state.status}
                </span>
              </div>
              <p className="text-flowtrip-text-secondary">
                {state.municipalities}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlowTripStatesSection;
