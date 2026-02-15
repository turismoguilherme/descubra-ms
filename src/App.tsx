import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { ViaJARAuthProvider } from "@/hooks/auth/ViaJARAuthProvider";
import { OverflowOneAuthProvider } from "@/hooks/auth/OverflowOneAuthProvider";
import { CSRFProvider } from "@/components/security/CSRFProtection";
import { BrandProvider } from "@/context/BrandContext";
import { LanguageProvider } from "@/context/LanguageContext";
import LoadingFallback from "@/components/ui/loading-fallback";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import SecurityProvider from "@/components/security/SecurityProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import VLibrasWidget from "@/components/accessibility/VLibrasWidget";
import "@/i18n/config";
// Removendo imports complexos temporariamente
// import DebugPanel from "@/components/debug/DebugPanel";
// import { ErrorMonitorPanel } from "@/services/ErrorMonitor";

// Inicializar serviços de eventos automaticamente
import "@/services/events/EventServiceInitializer";
import "@/services/events/AutoEventActivator";
import "@/services/events/IntelligentEventService";
import "@/services/events/IntelligentEventActivator";
// EventSystemTester removido - serviço de teste não deve executar em produção

// Importar utilitário centralizado de log seguro
import { safeLog } from "@/utils/safeLog";
import { initSupabaseInterceptor } from "@/utils/supabaseInterceptor";
import { useDomainValidation } from "@/hooks/useDomainValidation";

// Inicializar interceptor do Supabase para renovação automática de tokens
initSupabaseInterceptor();

// ViaJAR SaaS Pages
import ViaJARSaaS from "@/pages/ViaJARSaaS";
import Solucoes from "@/pages/Solucoes";
import CasosSucesso from "@/pages/CasosSucesso";
import Precos from "@/pages/Precos";
import Sobre from "@/pages/Sobre";
import Contato from "@/pages/Contato";
import DadosTurismo from "@/pages/DadosTurismo";

// ViaJAR Dashboard Pages (Lazy loaded)
const ViaJARUnifiedDashboard = lazy(() => import("@/pages/ViaJARUnifiedDashboard"));
const ViaJARLogin = lazy(() => import("@/pages/OverflowOneLogin"));
const ViaJARRegister = lazy(() => import("@/pages/OverflowOneRegister"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const IARoutePaymentSuccess = lazy(() => import("@/pages/IARoutePaymentSuccess"));
const IARoutesPage = lazy(() => import("@/pages/IARoutesPage"));
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
import Eventos from "@/pages/Eventos";
import Koda from "@/pages/Koda";
import KodaPrivacy from "@/pages/koda/Privacy";
import KodaTerms from "@/pages/koda/Terms";
import EventosMS from "@/pages/ms/EventosMS";
import PassaporteLista from "@/pages/ms/PassaporteLista";
import PassportDigital from "@/pages/PassportDigital";
import RegiaoDetalhes from "@/pages/RegiaoDetalhes";
import ProfilePageFixed from "@/pages/ProfilePageFixed";
import Register from "@/pages/Register";
const EventPaymentReturn = lazy(() => import("@/pages/ms/EventPaymentReturn"));
const EventPaymentSuccess = lazy(() => import("@/pages/ms/EventPaymentSuccess"));
const EventStatus = lazy(() => import("@/pages/ms/EventStatus"));
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
import CookiesMS from "@/pages/ms/CookiesMS";
import PartnerReservationPage from "@/pages/PartnerReservationPage";

// ViaJAR Legal Pages
import ViaJARPrivacidade from "@/pages/viajar/Privacidade";
import ViaJARTermosUso from "@/pages/viajar/TermosUso";
import ViaJARCookies from "@/pages/viajar/Cookies";
import MapaTuristico from "@/pages/MapaTuristico";
import Documentacao from "@/pages/Documentacao";
import SobreOverFlowOne from "@/pages/SobreOverFlowOne";
import Delinha from "@/pages/Delinha";
import Welcome from "@/pages/Welcome";
import BlogOverFlowOne from "@/pages/BlogOverFlowOne";
import { OAuthCallback } from "@/components/auth/OAuthCallback";

const queryClient = new QueryClient();

// Componente para normalizar barras invertidas em rotas (Windows usa \ mas URLs usam /)
const NormalizePathRoute = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:124',message:'NormalizePathRoute executado',data:{windowLocation:window.location.href,windowPathname:window.location.pathname},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  try {
    const location = useLocation();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:127',message:'useLocation retornado',data:{pathname:location.pathname,search:location.search,hasBackslash:location.pathname.includes('\\')},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const normalizedPath = location.pathname.replace(/\\/g, '/');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:130',message:'Path normalizado',data:{original:location.pathname,normalized:normalizedPath,changed:normalizedPath!==location.pathname},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Se o path foi alterado (tinha barras invertidas), redirecionar
    if (normalizedPath !== location.pathname) {
      const newPath = normalizedPath + location.search;
      console.log(`🔄 [NormalizePath] Normalizando rota: ${location.pathname} -> ${newPath}`);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:135',message:'Redirecionando para path normalizado',data:{from:location.pathname,to:newPath},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return <Navigate to={newPath} replace />;
    }
    
    return null;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:142',message:'ERRO em NormalizePathRoute',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    console.error('❌ [NormalizePath] Erro ao normalizar path:', error);
    return null;
  }
};

// Componente para redirecionar rotas antigas para /descubrams
const RedirectOldMSRoute = () => {
  const location = useLocation();
  const path = location.pathname.replace('/descubramatogrossodosul', '/descubrams');
  const search = location.search;
  const newPath = path + search;
  console.log(`🔄 [Redirect] Redirecionando ${location.pathname} -> ${newPath}`);
  return <Navigate to={newPath} replace />;
};

// Componente interno que usa useLocation (deve estar dentro do Router)
function AppRoutes() {
  // Validar domínio e determinar qual conteúdo mostrar
  const { shouldShowMSContent, shouldShowViajarContent, currentDomain } = useDomainValidation();
  const location = useLocation();

  // Lógica: mostrar conteúdo baseado no domínio E no path (para permitir testar MS em localhost)
  // Em produção (descubrams.com), sempre mostrar MS
  // Em localhost, mostrar MS se o path começar com /descubrams
  const showMS = currentDomain === 'descubrams.com' || 
                 (currentDomain === 'localhost' && location.pathname.startsWith('/descubrams'));
  const showViajar = currentDomain === 'viajartur.com' || 
                     (currentDomain === 'localhost' && !location.pathname.startsWith('/descubrams')) ||
                     (!showMS && currentDomain !== 'descubrams.com' && currentDomain !== 'localhost');
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:153',message:'Domínio detectado',data:{currentDomain,pathname:location.pathname,showMS,showViajar},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  return (
    <BrandProvider>
      {/* Normalizar barras invertidas em rotas (Windows usa \ mas URLs usam /) */}
      <NormalizePathRoute />
      {/* VLibras - Controle de visibilidade por rota */}
      <VLibrasWidget />
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
                            {/* ViaJAR SaaS Routes - apenas se não for domínio MS */}
                            {showViajar && (
                              <>
                                <Route path="/" element={<ViaJARSaaS />} />
                                <Route path="/viajar" element={<ViaJARSaaS />} />
                                <Route path="/solucoes" element={<Solucoes />} />
                                <Route path="/casos-sucesso" element={<CasosSucesso />} />
                                <Route path="/precos" element={<Precos />} />
                                <Route path="/sobre" element={<Sobre />} />
                                <Route path="/contato" element={<Contato />} />
                                <Route path="/dados-turismo" element={<DadosTurismo />} />
                                <Route path="/documentacao" element={<Documentacao />} />
                                <Route path="/sobre-overflow-one" element={<SobreOverFlowOne />} />
                                <Route path="/delinha" element={<Delinha />} />
                                <Route path="/welcome" element={<Welcome />} />
                                <Route path="/blog" element={<BlogOverFlowOne />} />

                                {/* Chatbot Guatá Standalone - Totem */}
                                <Route path="/chatguata" element={<ChatGuata />} />

                                {/* Eventos - Página separada no estilo chatguata */}
                                <Route path="/eventos" element={<Eventos />} />

                                {/* Koda - Canadian Travel Guide */}
                                <Route path="/koda" element={<Koda />} />
                                <Route path="/koda/privacy" element={<KodaPrivacy />} />
                                <Route path="/koda/terms" element={<KodaTerms />} />

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

                                {/* Fallback */}
                                <Route path="*" element={<ViaJARSaaS />} />
                              </>
                            )}

                            {/* Descubra Mato Grosso do Sul Routes - apenas se for domínio MS */}
                            {showMS && (
                              <>
                                <Route path="/descubrams" element={<MSIndex />} />
                                <Route path="/descubrams/mapa-turistico" element={<MapaTuristico />} />
                                <Route path="/descubrams/destinos" element={<Destinos />} />
                                <Route path="/descubrams/regioes/:slug" element={<RegiaoDetalhes />} />
                                <Route path="/descubrams/eventos" element={<EventosMS />} />
                                <Route path="/descubrams/cadastrar-evento" element={<Suspense fallback={<LoadingFallback />}><CadastrarEventoMS /></Suspense>} />
                                <Route path="/eventos/payment-return" element={<Suspense fallback={<LoadingFallback />}><EventPaymentReturn /></Suspense>} />
                                <Route path="/descubrams/eventos/payment-success" element={<Suspense fallback={<LoadingFallback />}><EventPaymentSuccess /></Suspense>} />
                                <Route path="/descubrams/eventos/status/:eventId" element={<Suspense fallback={<LoadingFallback />}><EventStatus /></Suspense>} />
                                <Route path="/descubrams/promover-evento" element={<Suspense fallback={<LoadingFallback />}><PromoverEventoMS /></Suspense>} />
                                <Route path="/descubrams/parceiros" element={<Partners />} />
                                <Route path="/descubrams/parceiros/:id/reservar" element={<Suspense fallback={<LoadingFallback />}><PartnerReservationPage /></Suspense>} />
                                <Route path="/descubrams/seja-um-parceiro" element={<Suspense fallback={<LoadingFallback />}><SejaUmParceiroMS /></Suspense>} />
                                <Route path="/descubrams/seja-um-parceiro/success" element={<Suspense fallback={<LoadingFallback />}><PartnerSuccessPage /></Suspense>} />
                                <Route path="/descubrams/partner/login" element={<PartnerLoginPage />} />
                                <Route path="/partner/dashboard" element={<Suspense fallback={<LoadingFallback />}><PartnerDashboard /></Suspense>} />
                                <Route path="/minhas-reservas" element={<Suspense fallback={<LoadingFallback />}><UserReservationsPage /></Suspense>} />
                                <Route path="/reservas" element={<Suspense fallback={<LoadingFallback />}><UserReservationsPage /></Suspense>} />
                                <Route path="/descubrams/sobre" element={<SobreMS />} />
                                <Route path="/descubrams/guata" element={<Guata />} />
                                <Route path="/descubrams/chatguata" element={<ChatGuata />} />
                                <Route path="/descubrams/guata-test" element={<GuataTest />} />
                                <Route path="/descubrams/passaporte" element={<PassaporteLista />} />
                                <Route path="/descubrams/passaporte/:routeId?" element={<Suspense fallback={<LoadingFallback />}><PassportDigital /></Suspense>} />
                                <Route path="/descubrams/profile" element={<ProfilePageFixed />} />
                                <Route path="/descubrams/roteiros-personalizados" element={<Suspense fallback={<LoadingFallback />}><IARoutesPage /></Suspense>} />
                                <Route path="/descubrams/roteiros-ia/success" element={<Suspense fallback={<LoadingFallback />}><IARoutePaymentSuccess /></Suspense>} />

                                {/* Descubra MS Auth Routes */}
                                <Route path="/descubrams/login" element={<AuthPage />} />
                                <Route path="/descubrams/register" element={<Register />} />
                                <Route path="/descubrams/forgot-password" element={<Suspense fallback={<LoadingFallback />}><ViaJARForgotPassword /></Suspense>} />

                                {/* Descubra MS - Políticas */}
                                <Route path="/descubrams/privacidade" element={<PrivacidadeMS />} />
                                <Route path="/descubrams/termos" element={<TermosUsoMS />} />
                                <Route path="/descubrams/cookies" element={<CookiesMS />} />

                                {/* Redirecionamentos de /descubramatogrossodosul para /descubrams (compatibilidade) */}
                                <Route path="/descubramatogrossodosul" element={<Navigate to="/descubrams" replace />} />
                                <Route
                                  path="/descubramatogrossodosul/:path*"
                                  element={<RedirectOldMSRoute />}
                                />

                                {/* Redirecionamentos legados de /ms para /descubrams */}
                                <Route path="/ms/login" element={<AuthPage />} />
                                <Route path="/ms/register" element={<Register />} />
                                {/* Callback OAuth - processar antes de redirecionar */}
                                <Route path="/ms" element={<Suspense fallback={<LoadingFallback />}><OAuthCallback /></Suspense>} />
                                <Route path="/ms/*" element={<Navigate to="/descubrams" replace />} />

                                {/* Fallback para MS */}
                                <Route path="/descubrams/*" element={<MSIndex />} />
                                <Route path="*" element={<MSIndex />} />
                              </>
                            )}

                            {/* Rotas compartilhadas (sempre disponíveis independente do domínio) */}
                            {/* Dashboard Routes Específicos - compartilhados entre domínios */}
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
                            
                            {/* Rotas de parceiros - compartilhadas */}
                            <Route path="/partner/dashboard" element={<Suspense fallback={<LoadingFallback />}><PartnerDashboard /></Suspense>} />
                            <Route path="/minhas-reservas" element={<Suspense fallback={<LoadingFallback />}><UserReservationsPage /></Suspense>} />
                            <Route path="/reservas" element={<Suspense fallback={<LoadingFallback />}><UserReservationsPage /></Suspense>} />
                            
                            {/* Redirecionamentos legados - compartilhados */}
                            <Route path="/descubramatogrossodosul" element={<Navigate to="/descubrams" replace />} />
                            <Route path="/descubramatogrossodosul/:path*" element={<RedirectOldMSRoute />} />
                            <Route path="/ms/login" element={<AuthPage />} />
                            <Route path="/ms/register" element={<Register />} />
                            <Route path="/ms" element={<Suspense fallback={<LoadingFallback />}><OAuthCallback /></Suspense>} />
                            <Route path="/ms/*" element={<Navigate to="/descubrams" replace />} />
                            
                            {/* Fallback baseado no domínio */}
                            {showMS ? (
                              <Route path="*" element={<MSIndex />} />
                            ) : (
                              <Route path="*" element={<ViaJARSaaS />} />
                            )}
        </Routes>
      </div>
    </BrandProvider>
  );
}

function App() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:147',message:'App component renderizando',data:{windowLocation:window.location.href,windowPathname:window.location.pathname,hasBackslash:window.location.pathname.includes('\\')},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
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
                  <LanguageProvider>
                    <TooltipProvider>
                      <Toaster />
                      <BrowserRouter
                        future={{
                          v7_startTransition: true,
                          v7_relativeSplatPath: true,
                        }}
                      >
                        <AppRoutes />
                      </BrowserRouter>
                    </TooltipProvider>
                  </LanguageProvider>
                </SecurityProvider>
              </CSRFProvider>
            </OverflowOneAuthProvider>
          </ViaJARAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
  );
}

export default App;
