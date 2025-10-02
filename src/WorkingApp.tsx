import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { TourismDataProvider } from "@/context/TourismDataContext";
import { BrandProvider } from "@/context/BrandContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Componentes principais
import OverFlowOneSaaS from "@/pages/OverFlowOneSaaS";
import MSIndex from "@/pages/MSIndex";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Welcome from "@/pages/Welcome";

// Componente de fallback simples
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Carregando...
  </div>
);

const WorkingApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  console.log("🚀 WORKING APP: Aplicação completa carregando");

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <TourismDataProvider>
              <BrandProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Routes>
                      {/* Rota principal */}
                      <Route path="/" element={<OverFlowOneSaaS />} />
                      
                      {/* Rotas MS */}
                      <Route path="/ms" element={<MSIndex />} />
                      <Route path="/ms/welcome" element={<Welcome />} />
                      <Route path="/ms/login" element={<Login />} />
                      <Route path="/ms/register" element={<Register />} />
                      
                      {/* Rota de fallback */}
                      <Route path="*" element={
                        <div style={{ 
                          padding: '20px', 
                          textAlign: 'center',
                          minHeight: '100vh',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
                          <p style={{ fontSize: '18px', color: '#666' }}>
                            Página não encontrada
                          </p>
                          <a 
                            href="/" 
                            style={{ 
                              color: '#007bff', 
                              textDecoration: 'none',
                              marginTop: '20px',
                              fontSize: '16px'
                            }}
                          >
                            Voltar para o início
                          </a>
                        </div>
                      } />
                    </Routes>
                  </div>
                </BrowserRouter>
              </BrandProvider>
            </TourismDataProvider>
          </AuthProvider>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default WorkingApp;
