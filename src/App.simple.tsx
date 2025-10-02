import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Componente simples para teste
const SimpleHome = () => (
  <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
    <h1 style={{ color: '#333', textAlign: 'center' }}>🚀 OverFlow One - Funcionando!</h1>
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <p style={{ fontSize: '18px', color: '#666' }}>
        A aplicação está funcionando corretamente!
      </p>
      <div style={{ marginTop: '30px' }}>
        <a 
          href="/parceiros" 
          style={{ 
            display: 'inline-block', 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            margin: '0 10px'
          }}
        >
          Ver Parceiros
        </a>
        <a 
          href="/ms" 
          style={{ 
            display: 'inline-block', 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            margin: '0 10px'
          }}
        >
          Descubra MS
        </a>
      </div>
    </div>
  </div>
);

const SimpleParceiros = () => (
  <div style={{ padding: '20px', backgroundColor: '#e8f4fd', minHeight: '100vh' }}>
    <h1 style={{ color: '#0066cc', textAlign: 'center' }}>👥 Parceiros OverFlow One</h1>
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <p style={{ fontSize: '18px', color: '#666' }}>
        Página de parceiros funcionando!
      </p>
      <div style={{ marginTop: '30px' }}>
        <a 
          href="/" 
          style={{ 
            display: 'inline-block', 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px'
          }}
        >
          Voltar ao Início
        </a>
      </div>
    </div>
  </div>
);

const AppSimple = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleHome />} />
        <Route path="/parceiros" element={<SimpleParceiros />} />
        <Route path="/ms" element={<SimpleHome />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppSimple;

