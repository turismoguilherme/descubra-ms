import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { TourismDataProvider } from "@/context/TourismDataContext";
import { SimpleBrandProvider } from "@/context/SimpleBrandContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Componentes principais
import OverFlowOneSaaS from "@/pages/OverFlowOneSaaS";
import MSIndex from "@/pages/MSIndex";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Welcome from "@/pages/Welcome";

// Componentes lazy
const Guata = React.lazy(() => import("@/pages/Guata"));
const GuataPublic = React.lazy(() => import("@/pages/GuataPublic"));
const Destinos = React.lazy(() => import("@/pages/Destinos"));
// const Eventos = React.lazy(() => import("@/pages/Eventos")); // Temporariamente desabilitado
const RoteirosMS = React.lazy(() => import("@/pages/ms/RoteirosMS"));
const Mapa = React.lazy(() => import("@/pages/Mapa"));
const Sobre = React.lazy(() => import("@/pages/Sobre"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const AdminPortal = React.lazy(() => import("@/pages/AdminPortal"));

// Componente de fallback
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

const CompleteApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  console.log("🚀 COMPLETE APP: Aplicação completa carregando");

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <TourismDataProvider>
              <SimpleBrandProvider>
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
                      <Route path="/ms/guata" element={
                        <React.Suspense fallback={<LoadingFallback />}>
                          <Guata />
                        </React.Suspense>
                      } />
                      <Route path="/chatguata" element={
                        <React.Suspense fallback={<LoadingFallback />}>
                          <GuataPublic />
                        </React.Suspense>
                      } />
                      <Route path="/ms/destinos" element={
                        <React.Suspense fallback={<LoadingFallback />}>
                          <Destinos />
                        </React.Suspense>
                      } />
                      {/* Eventos temporariamente desabilitado
                      <Route path="/ms/eventos" element={
                        <React.Suspense fallback={<LoadingFallback />}>
                          <Eventos />
                        </React.Suspense>
                      } />
                      */}
                      <Route path="/ms/roteiros" element={
                        <React.Suspense fallback={<LoadingFallback />}>
                          <RoteirosMS />
                        </React.Suspense>
                      } />
                      <Route path="/ms/mapa" element={
                        <React.Suspense fallback={<LoadingFallback />}>
                          <Mapa />
                        </React.Suspense>
                      } />
                      <Route path="/ms/sobre" element={
                        <React.Suspense fallback={<LoadingFallback />}>
                          <Sobre />
                        </React.Suspense>
                      } />
                      <Route path="/ms/profile" element={
                        <React.Suspense fallback={<LoadingFallback />}>
                          <Profile />
                        </React.Suspense>
                      } />
                      <Route path="/ms/admin" element={
                        <React.Suspense fallback={<LoadingFallback />}>
                          <AdminPortal />
                        </React.Suspense>
                      } />
                      
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
              </SimpleBrandProvider>
            </TourismDataProvider>
          </AuthProvider>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default CompleteApp;
