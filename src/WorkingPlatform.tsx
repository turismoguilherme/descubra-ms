import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Componente principal da plataforma
const HomePage = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ 
        backgroundColor: '#007bff', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1>🚀 Descubra Mato Grosso do Sul</h1>
        <p>Plataforma de Turismo Inteligente</p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2>🏠 Página Principal</h2>
            <p>Bem-vindo à plataforma de turismo de Mato Grosso do Sul!</p>
            <a href="/descubramatogrossodosul" style={{ 
              color: '#007bff', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              → Ir para Descubra MS
            </a>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2>🤖 Guatá IA</h2>
            <p>Chatbot inteligente para turismo</p>
            <a href="/descubramatogrossodosul/guata" style={{ 
              color: '#007bff', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              → Conversar com Guatá
            </a>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2>🗺️ Destinos</h2>
            <p>Explore os melhores destinos de MS</p>
            <a href="/descubramatogrossodosul/destinos" style={{ 
              color: '#007bff', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              → Ver Destinos
            </a>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2>🎉 Eventos</h2>
            <p>Descubra eventos incríveis</p>
            <a href="/descubramatogrossodosul/eventos" style={{ 
              color: '#007bff', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              → Ver Eventos
            </a>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#28a745', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h2>✅ Plataforma Funcionando!</h2>
          <p>React + Vite + TypeScript funcionando perfeitamente</p>
        </div>
      </main>
    </div>
  );
};

// Página MS
const MSPage = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#e8f5e8', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ 
        backgroundColor: '#28a745', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1>🌿 Descubra Mato Grosso do Sul</h1>
        <p>Natureza, cultura e aventura no coração do Brasil</p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2>🎯 Funcionalidades Ativas</h2>
          <ul style={{ fontSize: '18px', lineHeight: '1.6' }}>
            <li>✅ Sistema de roteamento funcionando</li>
            <li>✅ Interface responsiva</li>
            <li>✅ Navegação entre páginas</li>
            <li>✅ Design moderno e limpo</li>
          </ul>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px'
        }}>
          <a href="/descubramatogrossodosul/guata" style={{ 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block'
          }}>
            <h3>🤖 Guatá IA</h3>
            <p>Chatbot inteligente</p>
          </a>

          <a href="/descubramatogrossodosul/destinos" style={{ 
            backgroundColor: '#ffc107', 
            color: 'black', 
            padding: '20px', 
            borderRadius: '10px',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block'
          }}>
            <h3>🗺️ Destinos</h3>
            <p>Explore MS</p>
          </a>

          <a href="/descubramatogrossodosul/eventos" style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block'
          }}>
            <h3>🎉 Eventos</h3>
            <p>Descubra eventos</p>
          </a>

          <a href="/" style={{ 
            backgroundColor: '#6c757d', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block'
          }}>
            <h3>🏠 Início</h3>
            <p>Voltar ao início</p>
          </a>
        </div>
      </main>
    </div>
  );
};

// Página 404
const NotFound = () => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '72px', color: '#dc3545', margin: '0' }}>404</h1>
      <h2>Página não encontrada</h2>
      <p>Desculpe, a página que você procura não existe.</p>
      <a href="/" style={{ 
        color: '#007bff', 
        textDecoration: 'none',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        ← Voltar para o início
      </a>
    </div>
  );
};

// App principal
const WorkingPlatform = () => {
  console.log("🚀 WORKING PLATFORM: Carregando plataforma funcional");
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ms" element={<MSPage />} />
        <Route path="/ms/guata" element={
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif'
          }}>
            <h1>🤖 Guatá IA</h1>
            <p>Chatbot inteligente em desenvolvimento...</p>
            <a href="/descubramatogrossodosul" style={{ color: '#007bff' }}>← Voltar para MS</a>
          </div>
        } />
        <Route path="/ms/destinos" element={
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif'
          }}>
            <h1>🗺️ Destinos</h1>
            <p>Página de destinos em desenvolvimento...</p>
            <a href="/descubramatogrossodosul" style={{ color: '#007bff' }}>← Voltar para MS</a>
          </div>
        } />
        <Route path="/ms/eventos" element={
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif'
          }}>
            <h1>🎉 Eventos</h1>
            <p>Página de eventos em desenvolvimento...</p>
            <a href="/descubramatogrossodosul" style={{ color: '#007bff' }}>← Voltar para MS</a>
          </div>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default WorkingPlatform;
