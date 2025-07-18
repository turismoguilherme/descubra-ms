import React from 'react';
import './FlowTripHeader.css';

const FlowTripHeader: React.FC = () => {
  return (
    <header className="flowtrip-header">
      {/* Logo FlowTrip - Estilo "Destinos Inteligentes" */}
      <div className="flowtrip-logo">
        <div className="logo-circle">
          <img src="/flowtrip-logo.svg" alt="FlowTrip" />
        </div>
        <div className="logo-text">
          <h1>FlowTrip</h1>
          <span>DESTINOS INTELIGENTES</span>
        </div>
      </div>
      
      {/* Navegação - Limpa e profissional */}
      <nav className="flowtrip-nav">
        <a href="/funcionalidades">Funcionalidades</a>
        <a href="/resultados">Resultados</a>
        <a href="/cases">Cases</a>
        <a href="/portal">Portal do Cliente</a>
      </nav>
      
      {/* Botões de ação - Estilo "Destinos Inteligentes" */}
      <div className="header-actions">
        <button className="btn-outline">Ver Demo MS</button>
        <button className="btn-primary">Falar Conosco</button>
      </div>
    </header>
  );
};

export default FlowTripHeader; 