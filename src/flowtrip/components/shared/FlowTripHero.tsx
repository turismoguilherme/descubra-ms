import React from 'react';
import './FlowTripHero.css';

const FlowTripHero: React.FC = () => {
  return (
    <section className="flowtrip-hero">
      {/* Banner de destaque - Estilo "Destinos Inteligentes" */}
      <div className="hero-badge">
        <span className="badge-icon">⭐</span>
        <span className="badge-text">
          Primeira Plataforma SaaS de Destinos Inteligentes do Brasil
        </span>
      </div>
      
      {/* Título principal - Estilo "Destinos Inteligentes" */}
      <h1 className="hero-title">
        <span className="title-part-blue">Trans</span>
        <span className="title-part-orange">forme</span>
        <br />
        <span className="title-part-gray">seu Destino em</span>
        <br />
        <span className="title-part-teal">Refe</span>
        <span className="title-part-orange">rência</span>
      </h1>
      
      {/* Descrição - Estilo "Destinos Inteligentes" */}
      <p className="hero-description">
        FlowTrip automatiza a gestão turística do seu estado ou município com{' '}
        <strong className="highlight-blue">inteligência artificial</strong>,{' '}
        <strong className="highlight-orange">dados conectados</strong> e{' '}
        <strong>experiências memoráveis</strong>.
      </p>
      
      {/* Botões de ação - Estilo "Destinos Inteligentes" */}
      <div className="hero-actions">
        <button className="btn-primary-large">
          <span className="btn-icon">✈️</span>
          Ver Demonstração Gratuita
        </button>
        <button className="btn-outline-orange">
          <span className="btn-icon">📍</span>
          Case de Sucesso: MS
        </button>
      </div>
      
      {/* Estatísticas - Estilo "Destinos Inteligentes" */}
      <div className="hero-stats">
        <div className="stat-item">
          <span className="stat-number">6</span>
          <span className="stat-label">Estados Atendidos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">150+</span>
          <span className="stat-label">Municípios</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">50k+</span>
          <span className="stat-label">Turistas Atendidos</span>
        </div>
      </div>
    </section>
  );
};

export default FlowTripHero; 