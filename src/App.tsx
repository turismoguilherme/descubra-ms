
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { CSRFProvider } from "@/components/security/CSRFProtection";
import { TourismDataProvider } from "@/context/TourismDataContext";
import { BrandProvider } from "@/context/BrandContext";
import ProfileCompletionChecker from "@/components/auth/ProfileCompletionChecker";
import LoadingFallback from "@/components/ui/loading-fallback";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import SecurityProvider from "@/components/security/SecurityProvider";
import VLibrasWithPreferences from "@/components/accessibility/VLibrasWithPreferences";
import AccessibilityButton from "@/components/layout/AccessibilityButton";

// Critical components (no lazy loading)
import FlowTripSaaS from "@/pages/FlowTripSaaS";
import MSIndex from "@/pages/MSIndex";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Welcome from "@/pages/Welcome";
import AuthPage from "@/pages/AuthPage";
import FlowTripMasterDashboard from "@/pages/FlowTripMasterDashboard";

// FlowTrip SaaS Pages
const Solucoes = lazy(() => import("@/pages/Solucoes"));
const CasosSucesso = lazy(() => import("@/pages/CasosSucesso"));
const Precos = lazy(() => import("@/pages/Precos"));
const SobreFlowTrip = lazy(() => import("@/pages/SobreFlowTrip"));
const BlogFlowTrip = lazy(() => import("@/pages/BlogFlowTrip"));
const Documentacao = lazy(() => import("@/pages/Documentacao"));
const SuporteFlowTrip = lazy(() => import("@/pages/SuporteFlowTrip"));
const AdminPortal = lazy(() => import("@/pages/AdminPortal"));
const TestDashboards = lazy(() => import("@/pages/TestDashboards"));
const ContatoFlowTrip = lazy(() => import("@/pages/ContatoFlowTrip"));
const RecursosAnalytics = lazy(() => import("@/pages/RecursosAnalytics"));
const RecursosWhiteLabel = lazy(() => import("@/pages/RecursosWhiteLabel"));
const RecursosMultiTenant = lazy(() => import("@/pages/RecursosMultiTenant"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));

// Security components
const PasswordResetForm = lazy(() => import("@/components/auth/PasswordResetForm"));
const AdminSeedForm = lazy(() => import("@/components/auth/AdminSeedForm"));
const Management = lazy(() => import("@/pages/Management"));
const TechnicalAdmin = lazy(() => import("@/pages/TechnicalAdmin"));
const DigitalPassport = lazy(() => import("@/pages/DigitalPassport"));
const Guata = lazy(() => import("@/pages/Guata"));
const CATAttendant = lazy(() => import("@/pages/CATAttendant"));
const MunicipalAdmin = lazy(() => import("@/pages/MunicipalAdmin"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Destinos = lazy(() => import("@/pages/Destinos"));
const Eventos = lazy(() => import("@/pages/Eventos"));
const Roteiros = lazy(() => import("@/pages/Roteiros"));
const Partners = lazy(() => import("@/pages/Partners"));
const Sobre = lazy(() => import("@/pages/Sobre"));
const Mapa = lazy(() => import("@/pages/Mapa"));
const Profile = lazy(() => import("@/pages/Profile"));
const BecomePartner = lazy(() => import("@/pages/BecomePartner"));
const Contribute = lazy(() => import("@/pages/Contribute"));
const Colaborador = lazy(() => import("@/pages/Colaborador"));
const RoleDashboard = lazy(() => import("@/pages/RoleDashboard"));
const DestinationEditor = lazy(() => import("@/pages/DestinationEditor"));
const EventEditor = lazy(() => import("@/pages/EventEditor"));
const DestinoDetalhes = lazy(() => import("@/pages/DestinoDetalhes"));
const EventoDetalhes = lazy(() => import("@/pages/EventoDetalhes"));
const TourismData = lazy(() => import("@/pages/TourismData"));
const GuataAI = lazy(() => import("@/pages/GuataAI"));
const ManagementAI = lazy(() => import("@/pages/ManagementAI"));
const EnhancedDigitalPassport = lazy(() => import("@/pages/EnhancedDigitalPassport"));
const EventsManagement = lazy(() => import("@/pages/EventsManagement"));
const Regions = lazy(() => import("@/pages/Regions"));
const Resultados = lazy(() => import("@/pages/Resultados"));
const CasesSucesso = lazy(() => import("@/pages/CasesSucesso"));
const Personalizar = lazy(() => import("@/pages/Personalizar"));

const queryClient = new QueryClient();

// Wrapper para monitoramento de segurança
function SecurityWrapper({ children }: { children: React.ReactNode }) {
  useSecurityMonitoring();
  return <>{children}</>;
}

// Componente de teste simples
function TestComponent() {
  console.log("🧪 TEST: Componente de teste sendo renderizado");
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      color: '#333',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1>🚀 Aplicação Funcionando!</h1>
      <p>Se você está vendo esta mensagem, o React está funcionando corretamente.</p>
      <p>Verifique o console do navegador para ver os logs de debug.</p>
    </div>
  );
}

function App() {
  console.log("🚀 APP: Componente App sendo renderizado");
  
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityHeaders />
      <TourismDataProvider>
        <AuthProvider>
          <CSRFProvider>
            <SecurityProvider
              enableSessionTimeout={true}
              sessionTimeoutMinutes={30}
              sessionWarningMinutes={5}
            >
            <SecurityWrapper>
              <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <BrandProvider>
                  <ProfileCompletionChecker>
                    <div className="min-h-screen bg-background font-sans antialiased">
                    <Routes>
                      {/* Rota de teste */}
                      <Route path="/test" element={<TestComponent />} />
                      
                      {/* FlowTrip SaaS Routes */}
                      <Route path="/" element={<FlowTripSaaS />} />
                      <Route path="/flowtrip" element={<FlowTripSaaS />} />
                      <Route path="/contato" element={<Suspense fallback={<LoadingFallback />}><ContatoFlowTrip /></Suspense>} />
                      <Route path="/contato-flowtrip" element={<Suspense fallback={<LoadingFallback />}><ContatoFlowTrip /></Suspense>} />
                      <Route path="/solucoes" element={<Suspense fallback={<LoadingFallback />}><Solucoes /></Suspense>} />
                      <Route path="/casos-sucesso" element={<Suspense fallback={<LoadingFallback />}><CasosSucesso /></Suspense>} />
                      <Route path="/precos" element={<Suspense fallback={<LoadingFallback />}><Precos /></Suspense>} />
                      <Route path="/sobre-flowtrip" element={<Suspense fallback={<LoadingFallback />}><SobreFlowTrip /></Suspense>} />
                      <Route path="/blog" element={<Suspense fallback={<LoadingFallback />}><BlogFlowTrip /></Suspense>} />
                      <Route path="/documentacao" element={<Suspense fallback={<LoadingFallback />}><Documentacao /></Suspense>} />
                      <Route path="/suporte" element={<Suspense fallback={<LoadingFallback />}><SuporteFlowTrip /></Suspense>} />
                      <Route path="/admin-portal" element={<Suspense fallback={<LoadingFallback />}><AdminPortal /></Suspense>} />
                      <Route path="/test-dashboards" element={<Suspense fallback={<LoadingFallback />}><TestDashboards /></Suspense>} />
                      <Route path="/admin-login" element={<Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>} />
                      <Route path="/master-dashboard" element={<FlowTripMasterDashboard />} />
                      
                      {/* FlowTrip Resources Routes */}
                      <Route path="/recursos/analytics" element={<Suspense fallback={<LoadingFallback />}><RecursosAnalytics /></Suspense>} />
                      <Route path="/recursos/white-label" element={<Suspense fallback={<LoadingFallback />}><RecursosWhiteLabel /></Suspense>} />
                      <Route path="/recursos/multi-tenant" element={<Suspense fallback={<LoadingFallback />}><RecursosMultiTenant /></Suspense>} />
                      
                      {/* MS Routes */}
                      <Route path="/ms" element={<MSIndex />} />
                      <Route path="/ms/welcome" element={<Welcome />} />
                      <Route path="/ms/register" element={<Register />} />
                      <Route path="/ms/login" element={<Login />} />
                      <Route path="/ms/auth" element={<AuthPage />} />
                      <Route path="/ms/password-reset" element={<Suspense fallback={<LoadingFallback />}><PasswordResetForm /></Suspense>} />
                      <Route path="/ms/admin" element={<Suspense fallback={<LoadingFallback />}><AdminPortal /></Suspense>} />
                      <Route path="/ms/admin-seed" element={<Suspense fallback={<LoadingFallback />}><AdminSeedForm /></Suspense>} />
                      <Route path="/ms/management" element={<Suspense fallback={<LoadingFallback />}><Management /></Suspense>} />
                      <Route path="/ms/technical-admin" element={<Suspense fallback={<LoadingFallback />}><TechnicalAdmin /></Suspense>} />
                      <Route path="/ms/passaporte" element={<Suspense fallback={<LoadingFallback />}><DigitalPassport /></Suspense>} />
                      <Route path="/ms/guata" element={<Suspense fallback={<LoadingFallback />}><Guata /></Suspense>} />
                      <Route path="/ms/delinha" element={<Suspense fallback={<LoadingFallback />}><Guata /></Suspense>} />
                      <Route path="/ms/cat-attendant" element={<Suspense fallback={<LoadingFallback />}><CATAttendant /></Suspense>} />
                      <Route path="/ms/municipal-admin" element={<Suspense fallback={<LoadingFallback />}><MunicipalAdmin /></Suspense>} />
                      <Route path="/ms/destinos" element={<Suspense fallback={<LoadingFallback />}><Destinos /></Suspense>} />
                      <Route path="/ms/destinos/:id" element={<Suspense fallback={<LoadingFallback />}><DestinoDetalhes /></Suspense>} />
                      <Route path="/ms/eventos" element={<Suspense fallback={<LoadingFallback />}><Eventos /></Suspense>} />
                      <Route path="/ms/eventos/:id" element={<Suspense fallback={<LoadingFallback />}><EventoDetalhes /></Suspense>} />
                      <Route path="/ms/roteiros" element={<Suspense fallback={<LoadingFallback />}><Roteiros /></Suspense>} />
                      <Route path="/ms/parceiros" element={<Suspense fallback={<LoadingFallback />}><Partners /></Suspense>} />
                      <Route path="/ms/sobre" element={<Suspense fallback={<LoadingFallback />}><Sobre /></Suspense>} />
                      <Route path="/ms/mapa" element={<Suspense fallback={<LoadingFallback />}><Mapa /></Suspense>} />
                      <Route path="/ms/profile" element={<Suspense fallback={<LoadingFallback />}><Profile /></Suspense>} />
                      <Route path="/ms/seja-um-parceiro" element={<Suspense fallback={<LoadingFallback />}><BecomePartner /></Suspense>} />
                      <Route path="/ms/contribuir" element={<Suspense fallback={<LoadingFallback />}><Contribute /></Suspense>} />
                      <Route path="/ms/colaborador" element={<Suspense fallback={<LoadingFallback />}><Colaborador /></Suspense>} />
                      <Route path="/ms/role-dashboard" element={<Suspense fallback={<LoadingFallback />}><RoleDashboard /></Suspense>} />
                      <Route path="/ms/destination-editor" element={<Suspense fallback={<LoadingFallback />}><DestinationEditor /></Suspense>} />
                      <Route path="/ms/event-editor" element={<Suspense fallback={<LoadingFallback />}><EventEditor /></Suspense>} />
                      <Route path="/ms/tourism-data" element={<Suspense fallback={<LoadingFallback />}><TourismData /></Suspense>} />
                      <Route path="/ms/guata-ai" element={<Suspense fallback={<LoadingFallback />}><GuataAI /></Suspense>} />
                      <Route path="/ms/delinha-ai" element={<Suspense fallback={<LoadingFallback />}><GuataAI /></Suspense>} />
                      <Route path="/ms/management-ai" element={<Suspense fallback={<LoadingFallback />}><ManagementAI /></Suspense>} />
                      <Route path="/ms/enhanced-passport" element={<Suspense fallback={<LoadingFallback />}><EnhancedDigitalPassport /></Suspense>} />
                      <Route path="/ms/events-management" element={<Suspense fallback={<LoadingFallback />}><EventsManagement /></Suspense>} />
                      <Route path="/ms/regioes" element={<Suspense fallback={<LoadingFallback />}><Regions /></Suspense>} />
                      <Route path="/ms/test-dashboards" element={<Suspense fallback={<LoadingFallback />}><TestDashboards /></Suspense>} />
                      
                      {/* Páginas FlowTrip SaaS */}
                      <Route path="/resultados" element={<Suspense fallback={<LoadingFallback />}><Resultados /></Suspense>} />
                      <Route path="/cases-sucesso" element={<Suspense fallback={<LoadingFallback />}><CasesSucesso /></Suspense>} />
                      <Route path="/personalizar" element={<Suspense fallback={<LoadingFallback />}><Personalizar /></Suspense>} />
                      
                      {/* Legacy redirects - manter compatibilidade */}
                      <Route path="/welcome" element={<Navigate to="/ms/welcome" replace />} />
                      <Route path="/register" element={<Navigate to="/ms/register" replace />} />
                      <Route path="/login" element={<Navigate to="/ms/login" replace />} />
                      <Route path="/auth" element={<Navigate to="/ms/auth" replace />} />
                      <Route path="/passaporte" element={<Navigate to="/ms/passaporte" replace />} />
                      <Route path="/guata" element={<Navigate to="/ms/guata" replace />} />
                      <Route path="/delinha" element={<Navigate to="/ms/delinha" replace />} />
                      <Route path="/destinos" element={<Navigate to="/ms/destinos" replace />} />
                      <Route path="/destinos/:id" element={<Navigate to="/ms/destinos/:id" replace />} />
                      <Route path="/eventos" element={<Navigate to="/ms/eventos" replace />} />
                      <Route path="/eventos/:id" element={<Navigate to="/ms/eventos/:id" replace />} />
                      <Route path="/roteiros" element={<Navigate to="/ms/roteiros" replace />} />
                      <Route path="/parceiros" element={<Navigate to="/ms/parceiros" replace />} />
                      <Route path="/sobre" element={<Navigate to="/ms/sobre" replace />} />
                      <Route path="/mapa" element={<Navigate to="/ms/mapa" replace />} />
                      
                      <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
                    </Routes>
                    </div>
                  </ProfileCompletionChecker>
                  <VLibrasWithPreferences />
                  <AccessibilityButton />
                </BrandProvider>
              </BrowserRouter>
              </TooltipProvider>
            </SecurityWrapper>
            </SecurityProvider>
          </CSRFProvider>
        </AuthProvider>
      </TourismDataProvider>
    </QueryClientProvider>
  );
}

export default App;
