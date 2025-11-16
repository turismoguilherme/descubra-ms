import React from 'react';

const TourismStatsSection: React.FC = () => {
  return (
    <section className="py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Estatísticas do Turismo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Visitantes</h3>
            <p className="text-muted-foreground">Dados em desenvolvimento</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Eventos</h3>
            <p className="text-muted-foreground">Dados em desenvolvimento</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Destinos</h3>
            <p className="text-muted-foreground">Dados em desenvolvimento</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourismStatsSection;
