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
import VLibrasWidget from "@/components/accessibility/VLibrasWidget";
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
// #region agent log
fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:35',message:'Antes do import DadosTurismo',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
// #endregion
import DadosTurismo from "@/pages/DadosTurismo";
// #region agent log
fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:37',message:'Após import DadosTurismo',data:{dadosTurismoDefined:typeof DadosTurismo!=='undefined',dadosTurismoValue:DadosTurismo?.toString?.()?.substring(0,50)||'undefined',timestamp:Date.now()},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
// #endregion

// ViaJAR Dashboard Pages (Lazy loaded)
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
import PartnerDashboard from "@/components/partners/PartnerDashboard";
import PartnerLoginPage from "@/pages/PartnerLoginPage";
import PartnerSuccessPage from "@/pages/PartnerSuccessPage";
import UserReservationsPage from "@/pages/UserReservationsPage";
import PromoverEventoMS from "@/pages/ms/PromoverEventoMS";
import CadastrarEventoMS from "@/pages/ms/CadastrarEventoMS";
import PrivacidadeMS from "@/pages/ms/PrivacidadeMS";
import TermosUsoMS from "@/pages/ms/TermosUsoMS";

// ViaJAR Legal Pages
import ViaJARPrivacidade from "@/pages/viajar/Privacidade";
import ViaJARTermosUso from "@/pages/viajar/TermosUso";
import ViaJARCookies from "@/pages/viajar/Cookies";
import MapaTuristico from "@/pages/MapaTuristico";
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
                        {/* VLibras - Controle de visibilidade por rota */}
                        <VLibrasWidget />
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
                            {/* #region agent log */}
                            {(() => {
                              fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:130',message:'Verificando DadosTurismo antes de usar na rota',data:{dadosTurismoDefined:typeof DadosTurismo!=='undefined',dadosTurismoType:typeof DadosTurismo,dadosTurismoIsFunction:typeof DadosTurismo==='function',dadosTurismoIsObject:typeof DadosTurismo==='object',timestamp:Date.now()},sessionId:'debug-session',runId:'run1',hypothesisId:'B',timestamp:Date.now()})}).catch(()=>{});
                              return null;
                            })()}
                            {/* #endregion */}
                            <Route path="/dados-turismo" element={typeof DadosTurismo !== 'undefined' ? <DadosTurismo /> : <div>Erro: DadosTurismo não carregado</div>} />
                            
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
                            
                            {/* ViaJAR Legal Pages (públicas) */}
                            <Route path="/viajar/privacidade" element={<ViaJARPrivacidade />} />
                            <Route path="/viajar/termos" element={<ViaJARTermosUso />} />
                            <Route path="/viajar/cookies" element={<ViaJARCookies />} />
                            
                            <Route path="/test-login" element={<Suspense fallback={<LoadingFallback />}><TestLogin /></Suspense>} />
                            
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
                            <Route path="/descubramatogrossodosul/mapa-turistico" element={<MapaTuristico />} />
                            <Route path="/descubramatogrossodosul/destinos" element={<Destinos />} />
                            <Route path="/descubramatogrossodosul/destinos/:id" element={<DestinoDetalhes />} />
                            <Route path="/descubramatogrossodosul/eventos" element={<EventosMS />} />
                            <Route path="/descubramatogrossodosul/cadastrar-evento" element={<Suspense fallback={<LoadingFallback />}><CadastrarEventoMS /></Suspense>} />
                            <Route path="/descubramatogrossodosul/promover-evento" element={<Navigate to="/descubramatogrossodosul/cadastrar-evento" replace />} />
                            <Route path="/descubramatogrossodosul/parceiros" element={<Partners />} />
                            <Route path="/descubramatogrossodosul/seja-um-parceiro" element={<Suspense fallback={<LoadingFallback />}><SejaUmParceiroMS /></Suspense>} />
                            <Route path="/descubramatogrossodosul/seja-um-parceiro/success" element={<Suspense fallback={<LoadingFallback />}><PartnerSuccessPage /></Suspense>} />
                            <Route path="/descubramatogrossodosul/partner/login" element={<PartnerLoginPage />} />
                            <Route path="/partner/dashboard" element={<Suspense fallback={<LoadingFallback />}><PartnerDashboard /></Suspense>} />
                            <Route path="/minhas-reservas" element={<Suspense fallback={<LoadingFallback />}><UserReservationsPage /></Suspense>} />
                            <Route path="/reservas" element={<Suspense fallback={<LoadingFallback />}><UserReservationsPage /></Suspense>} />
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
                            
                            {/* Descubra MS - Políticas */}
                            <Route path="/descubramatogrossodosul/privacidade" element={<PrivacidadeMS />} />
                            <Route path="/descubramatogrossodosul/termos" element={<TermosUsoMS />} />
                            
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
