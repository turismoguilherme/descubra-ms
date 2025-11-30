import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { ViaJARAuthProvider } from "@/hooks/auth/ViaJARAuthProvider";
import { OverflowOneAuthProvider } from "@/hooks/auth/OverflowOneAuthProvider";
import { CSRFProvider } from "@/components/security/CSRFProtection";
import { BrandProvider } from "@/context/BrandContext";
import LoadingFallback from "@/components/ui/loading-fallback";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import SecurityProvider from "@/components/security/SecurityProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
// Removendo imports complexos temporariamente
// import DebugPanel from "@/components/debug/DebugPanel";
// import { ErrorMonitorPanel } from "@/services/ErrorMonitor";

// Inicializar serviços de eventos automaticamente
import "@/services/events/EventServiceInitializer";
import "@/services/events/AutoEventActivator";
import "@/services/events/IntelligentEventService";
import "@/services/events/IntelligentEventActivator";
import "@/services/events/EventSystemTester";

// ViaJAR SaaS Pages
import ViaJARSaaS from "@/pages/ViaJARSaaS";
import Solucoes from "@/pages/Solucoes";
import CasosSucesso from "@/pages/CasosSucesso";
import Precos from "@/pages/Precos";
import Sobre from "@/pages/Sobre";
import Contato from "@/pages/Contato";

// ViaJAR Dashboard Pages (Lazy loaded)
const ViaJARDashboard = lazy(() => import("@/pages/ViaJARDynamicDashboard"));
const ViaJARUnifiedDashboard = lazy(() => import("@/pages/ViaJARUnifiedDashboard"));
const ViaJARLogin = lazy(() => import("@/pages/OverflowOneLogin"));
const ViaJARRegister = lazy(() => import("@/pages/OverflowOneRegister"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const ViaJARForgotPassword = lazy(() => import("@/pages/OverflowOneForgotPassword"));
const ViaJARInventory = lazy(() => import("@/pages/OverflowOneInventory"));
const ViaJARReports = lazy(() => import("@/pages/ReportsPage"));
const ViaJARLeads = lazy(() => import("@/pages/LeadsPage"));
const ViaJARPublicSector = lazy(() => import("@/pages/PublicSectorPage"));
const ViaJARIntelligence = lazy(() => import("@/pages/ViaJARIntelligence"));
const ViaJAROnboarding = lazy(() => import("@/pages/ViaJAROnboarding"));
const ViaJARPricing = lazy(() => import("@/pages/ViaJARPricing"));
const DiagnosticPage = lazy(() => import("@/pages/DiagnosticPage"));
const SmartOnboarding = lazy(() => import("@/pages/SmartOnboarding"));
const TestLogin = lazy(() => import("@/pages/TestLogin"));
const CATDashboard = lazy(() => import("@/pages/CATDashboard"));
const AttendantCheckIn = lazy(() => import("@/pages/AttendantCheckIn"));
const SecretaryDashboard = lazy(() => import("@/components/secretary/SecretaryDashboard"));
const AttendantDashboardRestored = lazy(() => import("@/components/cat/AttendantDashboardRestored"));
const PrivateDashboard = lazy(() => import("@/pages/PrivateDashboard"));
const UnifiedDashboard = lazy(() => import("@/pages/UnifiedDashboard"));
const ViaJARMasterDashboard = lazy(() => import("@/pages/ViaJARMasterDashboard"));
const ViaJARAdminPanel = lazy(() => import("@/pages/admin/ViaJARAdminPanel"));
const AuthDebug = lazy(() => import("@/components/debug/AuthDebug"));

// State Pages
import MSIndex from "@/pages/MSIndex";
import Destinos from "@/pages/Destinos";
import Partners from "@/pages/Partners";
import Guata from "@/pages/Guata";
import GuataTest from "@/pages/GuataTest";
import ChatGuata from "@/pages/ChatGuata";
import EventosMS from "@/pages/ms/EventosMS";
import PassaporteLista from "@/pages/ms/PassaporteLista";
import PassportDigital from "@/pages/PassportDigital";
import DestinoDetalhes from "@/pages/DestinoDetalhes";
import ProfilePageFixed from "@/pages/ProfilePageFixed";
import Register from "@/pages/Register";
import AuthPage from "@/pages/AuthPage";
import SobreMS from "@/pages/ms/SobreMS";
import SejaUmParceiroMS from "@/pages/ms/SejaUmParceiroMS";
import PromoverEventoMS from "@/pages/ms/PromoverEventoMS";
import { OAuthCallback } from "@/components/auth/OAuthCallback";

const queryClient = new QueryClient();

function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityHeaders />
      <AuthProvider>
          <ViaJARAuthProvider>
            <OverflowOneAuthProvider>
              <CSRFProvider>
                <SecurityProvider
                  enableSessionTimeout={true}
                  sessionTimeoutMinutes={30}
                  sessionWarningMinutes={5}
                >
                  <TooltipProvider>
                    <Toaster />
                    <BrowserRouter
                      future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                      }}
                    >
                      <BrandProvider>
                        <div className="min-h-screen bg-background font-sans antialiased">
                          <Routes>
                            {/* ViaJAR SaaS Routes */}
                            <Route path="/" element={<ViaJARSaaS />} />
                            <Route path="/viajar" element={<ViaJARSaaS />} />
                            <Route path="/solucoes" element={<Solucoes />} />
                            <Route path="/casos-sucesso" element={<CasosSucesso />} />
                            <Route path="/precos" element={<Precos />} />
                            <Route path="/sobre" element={<Sobre />} />
                            <Route path="/contato" element={<Contato />} />
                            
                            {/* Chatbot Guatá Standalone - Totem */}
                            <Route path="/chatguata" element={<ChatGuata />} />
                            
                            {/* ViaJAR Auth Routes (públicas) */}
                            <Route path="/viajar/login" element={<Suspense fallback={<LoadingFallback />}><ViaJARLogin /></Suspense>} />
                            <Route path="/viajar/register" element={<Suspense fallback={<LoadingFallback />}><ViaJARRegister /></Suspense>} />
                            <Route path="/viajar/forgot-password" element={<Suspense fallback={<LoadingFallback />}><ViaJARForgotPassword /></Suspense>} />
                            
                            {/* ViaJAR Onboarding & Pricing (públicas) */}
                            <Route path="/viajar/onboarding" element={<Suspense fallback={<LoadingFallback />}><ViaJAROnboarding /></Suspense>} />
                            <Route path="/viajar/onboarding/success" element={<Suspense fallback={<LoadingFallback />}><PaymentSuccess /></Suspense>} />
                            <Route path="/viajar/smart-onboarding" element={<Suspense fallback={<LoadingFallback />}><SmartOnboarding /></Suspense>} />
                            <Route path="/viajar/pricing" element={<Suspense fallback={<LoadingFallback />}><ViaJARPricing /></Suspense>} />
                            <Route path="/viajar/diagnostico" element={<Suspense fallback={<LoadingFallback />}><DiagnosticPage /></Suspense>} />
                            <Route path="/test-login" element={<Suspense fallback={<LoadingFallback />}><TestLogin /></Suspense>} />
                            <Route path="/debug-auth" element={<Suspense fallback={<LoadingFallback />}><AuthDebug /></Suspense>} />
                            
                            {/* Dashboard Routes Específicos */}
                            <Route path="/secretary-dashboard" element={
                              <ProtectedRoute allowedRoles={['gestor_municipal', 'admin']}>
                                <Suspense fallback={<LoadingFallback />}><SecretaryDashboard /></Suspense>
                              </ProtectedRoute>
                            } />
                            <Route path="/attendant-dashboard" element={
                              <ProtectedRoute allowedRoles={['atendente', 'cat_attendant', 'admin']}>
                                <Suspense fallback={<LoadingFallback />}><AttendantDashboardRestored /></Suspense>
                              </ProtectedRoute>
                            } />
                            <Route path="/private-dashboard" element={
                              <ProtectedRoute allowedRoles={['user', 'admin']}>
                                <ErrorBoundary>
                                  <Suspense fallback={<LoadingFallback />}><PrivateDashboard /></Suspense>
                                </ErrorBoundary>
                              </ProtectedRoute>
                            } />
                            <Route path="/unified" element={
                              <ProtectedRoute allowedRoles={['user', 'admin', 'gestor_municipal', 'atendente', 'cat_attendant']}>
                                <Suspense fallback={<LoadingFallback />}><UnifiedDashboard /></Suspense>
                              </ProtectedRoute>
                            } />
                            
                            {/* ViaJAR Dashboard Routes (protegidas) */}
                            <Route path="/viajar/dashboard" element={
                              <ProtectedRoute allowedRoles={['user', 'admin', 'gestor_municipal', 'atendente', 'cat_attendant']}>
                                <Suspense fallback={<LoadingFallback />}><ViaJARUnifiedDashboard /></Suspense>
                              </ProtectedRoute>
                            } />
                            <Route path="/viajar/dashboard-old" element={
                              <ProtectedRoute allowedRoles={['user', 'admin', 'gestor_municipal', 'atendente', 'cat_attendant']}>
                                <Suspense fallback={<LoadingFallback />}><ViaJARDashboard /></Suspense>
                              </ProtectedRoute>
                            } />
                            <Route path="/viajar/master-dashboard" element={
                              <ProtectedRoute allowedRoles={['admin', 'master_admin', 'tech']}>
                                <Suspense fallback={<LoadingFallback />}><ViaJARMasterDashboard /></Suspense>
                              </ProtectedRoute>
                            } />
                            <Route path="/viajar/admin/*" element={
                              <Suspense fallback={<LoadingFallback />}><ViaJARAdminPanel /></Suspense>
                            } />
                            <Route path="/viajar/inventario" element={
                              <ProtectedRoute allowedRoles={['user', 'admin', 'gestor_municipal', 'atendente', 'cat_attendant']}>
                                <Suspense fallback={<LoadingFallback />}><ViaJARInventory /></Suspense>
                              </ProtectedRoute>
                            } />
                            <Route path="/viajar/relatorios" element={
                              <ProtectedRoute allowedRoles={['user', 'admin', 'gestor_municipal', 'atendente', 'cat_attendant']}>
                                <Suspense fallback={<LoadingFallback />}><ViaJARReports /></Suspense>
                              </ProtectedRoute>
                            } />
                            <Route path="/viajar/leads" element={
                              <ProtectedRoute allowedRoles={['user', 'admin', 'gestor_municipal', 'atendente', 'cat_attendant']}>
                                <Suspense fallback={<LoadingFallback />}><ViaJARLeads /></Suspense>
                              </ProtectedRoute>
                            } />
                                        <Route path="/viajar/setor-publico" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'gestor_municipal', 'atendente', 'cat_attendant']}>
                <Suspense fallback={<LoadingFallback />}><ViaJARPublicSector /></Suspense>
              </ProtectedRoute>
            } />
            <Route path="/viajar/intelligence" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'gestor_municipal', 'atendente', 'cat_attendant']}>
                <Suspense fallback={<LoadingFallback />}><ViaJARIntelligence /></Suspense>
              </ProtectedRoute>
            } />
            
            {/* CAT Routes (protegidas) */}
                            <Route path="/viajar/cat-dashboard" element={
                              <ProtectedRoute allowedRoles={['cat_attendant', 'admin', 'gestor_municipal']}>
                                <Suspense fallback={<LoadingFallback />}><CATDashboard /></Suspense>
                              </ProtectedRoute>
                            } />
                            <Route path="/viajar/attendant-checkin" element={
                              <ProtectedRoute allowedRoles={['cat_attendant', 'atendente', 'admin', 'gestor_municipal']}>
                                <Suspense fallback={<LoadingFallback />}><AttendantCheckIn /></Suspense>
                              </ProtectedRoute>
                            } />
                            
                            {/* Descubra Mato Grosso do Sul Routes */}
                            <Route path="/descubramatogrossodosul" element={<MSIndex />} />
                            <Route path="/descubramatogrossodosul/destinos" element={<Destinos />} />
                            <Route path="/descubramatogrossodosul/destinos/:id" element={<DestinoDetalhes />} />
                            <Route path="/descubramatogrossodosul/eventos" element={<EventosMS />} />
                            <Route path="/descubramatogrossodosul/promover-evento" element={<Suspense fallback={<LoadingFallback />}><PromoverEventoMS /></Suspense>} />
                            <Route path="/descubramatogrossodosul/parceiros" element={<Partners />} />
                            <Route path="/descubramatogrossodosul/seja-um-parceiro" element={<Suspense fallback={<LoadingFallback />}><SejaUmParceiroMS /></Suspense>} />
                            <Route path="/descubramatogrossodosul/sobre" element={<SobreMS />} />
                            <Route path="/descubramatogrossodosul/guata" element={<Guata />} />
                            <Route path="/descubramatogrossodosul/chatguata" element={<ChatGuata />} />
                            <Route path="/descubramatogrossodosul/guata-test" element={<GuataTest />} />
                            <Route path="/descubramatogrossodosul/passaporte" element={<PassaporteLista />} />
                            <Route path="/descubramatogrossodosul/passaporte/:routeId?" element={<Suspense fallback={<LoadingFallback />}><PassportDigital /></Suspense>} />
                            <Route path="/descubramatogrossodosul/profile" element={<ProfilePageFixed />} />
                            
                            {/* Descubra MS Auth Routes */}
                            <Route path="/descubramatogrossodosul/login" element={<AuthPage />} />
                            <Route path="/descubramatogrossodosul/register" element={<Register />} />
                            <Route path="/descubramatogrossodosul/forgot-password" element={<Suspense fallback={<LoadingFallback />}><ViaJARForgotPassword /></Suspense>} />
                            
                            <Route path="/descubramatogrossodosul/*" element={<MSIndex />} />
                            
                            {/* Redirecionamentos legados de /ms para /descubramatogrossodosul */}
                            <Route path="/ms/login" element={<AuthPage />} />
                            <Route path="/ms/register" element={<Register />} />
                            {/* Callback OAuth - processar antes de redirecionar */}
                            <Route path="/ms" element={<Suspense fallback={<LoadingFallback />}><OAuthCallback /></Suspense>} />
                            <Route path="/ms/*" element={<Navigate to="/descubramatogrossodosul" replace />} />
                            
                            {/* Fallback */}
                            <Route path="*" element={<ViaJARSaaS />} />
                          </Routes>
                        </div>
                      </BrandProvider>
                    </BrowserRouter>
                  </TooltipProvider>
                </SecurityProvider>
              </CSRFProvider>
            </OverflowOneAuthProvider>
          </ViaJARAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
  );
}

export default App;
