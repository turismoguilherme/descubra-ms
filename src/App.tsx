import { Suspense, lazy } from "react";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SearchOverlayProvider } from "@/context/SearchOverlayContext";
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
import DynamicBranding from "@/components/DynamicBranding";
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
import { isViajarTestLoginEnabled } from "@/utils/viajarTestLogin";
import {
  brandFromHost,
  stripBrandPrefix,
  MS_PREFIX,
  LABS_PREFIX,
} from "@/lib/brandRoutes";

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
const ViaJARForgotPassword = lazy(() => import("@/pages/OverflowOneForgotPassword"));
const ResetPasswordUpdate = lazy(() => import("@/pages/ResetPasswordUpdate"));
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
import ChatGuata from "@/pages/ChatGuata";
import Eventos from "@/pages/Eventos";
import Koda from "@/pages/Koda";
import KodaPrivacy from "@/pages/koda/Privacy";
import KodaTerms from "@/pages/koda/Terms";
import EventosMS from "@/pages/ms/EventosMS";
import EventShareRedirect from "@/pages/EventShareRedirect";
import PassaporteLista from "@/pages/ms/PassaporteLista";
import PassportDigital from "@/pages/PassportDigital";
import RankingSharePage from "@/pages/ms/RankingSharePage";
import RegiaoDetalhes from "@/pages/RegiaoDetalhes";
import ProfilePageFixed from "@/pages/ProfilePageFixed";
import Register from "@/pages/Register";
const EventStatus = lazy(() => import("@/pages/ms/EventStatus"));
import AuthPage from "@/pages/AuthPage";
import OAuthConsent from "@/pages/OAuthConsent";

import SobreMS from "@/pages/ms/SobreMS";
import BaixarAppMS from "@/pages/ms/BaixarAppMS";
import CartilhasMS from "@/pages/ms/CartilhasMS";
import CartilhaViewer from "@/pages/ms/CartilhaViewer";
import SejaUmParceiroMS from "@/pages/ms/SejaUmParceiroMS";
import PartnerDashboard from "@/components/partners/PartnerDashboard";
import PartnerLoginPage from "@/pages/PartnerLoginPage";
import PartnerSuccessPage from "@/pages/PartnerSuccessPage";
import UserReservationsPage from "@/pages/UserReservationsPage";
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
  try {
    const location = useLocation();
    const normalizedPath = location.pathname.replace(/\\/g, '/');
    
    // Se o path foi alterado (tinha barras invertidas), redirecionar
    if (normalizedPath !== location.pathname) {
      const newPath = normalizedPath + location.search;
      console.log(`🔄 [NormalizePath] Normalizando rota: ${location.pathname} -> ${newPath}`);
      return <Navigate to={newPath} replace />;
    }
    
    return null;
  } catch (error) {
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

// /login legado → login Descubra MS (preserva ?redirect=)
const RedirectToMsLogin = () => {
  const location = useLocation();
  return <Navigate to={`${MS_PREFIX}/login${location.search}`} replace />;
};

// Em domínio próprio, o prefixo legado é redirecionado para a URL limpa
const RedirectToCleanUrl = () => {
  const location = useLocation();
  const target = `${stripBrandPrefix(location.pathname)}${location.search}${location.hash}`;
  return <Navigate to={target} replace />;
};

// Componente interno que usa useLocation (deve estar dentro do Router)
function AppRoutes() {
  const location = useLocation();

  // Marca definida pelo domínio próprio (null em preview/localhost/vercel)
  const hostBrand = brandFromHost();
  const cleanUrls = hostBrand !== null;

  // Em domínio compartilhado, o prefixo do caminho continua decidindo a marca
  const pathIsMS =
    location.pathname === MS_PREFIX ||
    location.pathname.startsWith(`${MS_PREFIX}/`) ||
    location.pathname.startsWith('/descubramatogrossodosul') ||
    location.pathname === '/ms' ||
    location.pathname.startsWith('/ms/');

  const showMS = hostBrand === 'ms' || (!cleanUrls && pathIsMS);
  const showViajar = hostBrand === 'labs' || (!cleanUrls && !pathIsMS);


  return (
    <BrandProvider>
      {/* Normalizar barras invertidas em rotas (Windows usa \ mas URLs usam /) */}
      <NormalizePathRoute />
      <DynamicBranding />
      <VLibrasWidget />
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
                            {/* Consentimento OAuth (integrações de agentes / MCP) — sempre disponível */}
                            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

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

                                {/* /login sem prefixo caía no catch-all Guatá Labs — redireciona ao login MS */}
                                <Route path="/login" element={<RedirectToMsLogin />} />


                                {/* Chatbot Guatá Standalone - Totem */}
                                <Route path="/chatguata" element={<ChatGuata />} />

                                {/* Eventos - Página separada no estilo chatguata */}
                                <Route path="/eventos" element={<Eventos />} />
                                <Route path="/evento/:eventId" element={<EventShareRedirect />} />

                                {/* Koda - Canadian Travel Guide */}
                                <Route path="/koda" element={<Koda />} />
                                <Route path="/koda/privacy" element={<KodaPrivacy />} />
                                <Route path="/koda/terms" element={<KodaTerms />} />

                                {/* ViaJAR Auth Routes (públicas) */}
                                <Route path="/viajar/login" element={<Suspense fallback={<LoadingFallback />}><ViaJARLogin /></Suspense>} />
                                <Route path="/viajar/register" element={<Suspense fallback={<LoadingFallback />}><ViaJARRegister /></Suspense>} />
                                <Route path="/viajar/forgot-password" element={<Suspense fallback={<LoadingFallback />}><ViaJARForgotPassword /></Suspense>} />
                                <Route path="/reset-password" element={<Suspense fallback={<LoadingFallback />}><ResetPasswordUpdate /></Suspense>} />

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

                                {isViajarTestLoginEnabled() && (
                                  <Route
                                    path="/test-login"
                                    element={
                                      <Suspense fallback={<LoadingFallback />}>
                                        <TestLogin />
                                      </Suspense>
                                    }
                                  />
                                )}

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

                            {/* Descubra Mato Grosso do Sul */}
                            {showMS && (
                              <>
                                {/* Rotas na raiz (domínio próprio: /passaporte, /parceiros, ...) */}
                                {cleanUrls &&
                                  MS_ROUTE_DEFS.map((r) => (
                                    <Route key={`ms-clean-${r.path}`} path={r.path || '/'} element={r.element} />
                                  ))}

                                {/* Prefixo legado /descubrams — em domínio próprio, redireciona para a URL limpa */}
                                {MS_ROUTE_DEFS.map((r) => (
                                  <Route
                                    key={`ms-legacy-${r.path}`}
                                    path={`${MS_PREFIX}${r.path}`}
                                    element={cleanUrls ? <RedirectToCleanUrl /> : r.element}
                                  />
                                ))}

                                {/* Rotas sem prefixo (válidas nos dois modos) */}
                                <Route path="/partner/dashboard" element={<Suspense fallback={<LoadingFallback />}><PartnerDashboard /></Suspense>} />
                                <Route path="/minhas-reservas" element={<Suspense fallback={<LoadingFallback />}><UserReservationsPage /></Suspense>} />
                                <Route path="/reservas" element={<Suspense fallback={<LoadingFallback />}><UserReservationsPage /></Suspense>} />
                                <Route path="/reset-password" element={<Suspense fallback={<LoadingFallback />}><ResetPasswordUpdate /></Suspense>} />
                                {!cleanUrls && (
                                  <Route path="/baixar-app" element={<Navigate to={`${MS_PREFIX}/baixar-app`} replace />} />
                                )}

                                {/* Compatibilidade: /descubramatogrossodosul → /descubrams */}
                                <Route path="/descubramatogrossodosul" element={<Navigate to={MS_PREFIX} replace />} />
                                <Route path="/descubramatogrossodosul/:path*" element={<RedirectOldMSRoute />} />

                                {/* Legado /ms (callback OAuth precisa processar antes de redirecionar) */}
                                <Route path="/ms/login" element={<AuthPage />} />
                                <Route path="/ms/register" element={<Register />} />
                                <Route path="/ms" element={<Suspense fallback={<LoadingFallback />}><OAuthCallback /></Suspense>} />
                                <Route path="/ms/*" element={<Navigate to={cleanUrls ? '/' : MS_PREFIX} replace />} />

                                {/* Fallback para MS */}
                                <Route path={`${MS_PREFIX}/*`} element={cleanUrls ? <RedirectToCleanUrl /> : <MSIndex />} />
                                <Route path="*" element={<MSIndex />} />
                              </>
                            )}


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
                      <SonnerToaster />
                      <BrowserRouter
                        future={{
                          v7_startTransition: true,
                          v7_relativeSplatPath: true,
                        }}
                      >
                        <SearchOverlayProvider>
                          <AppRoutes />
                        </SearchOverlayProvider>
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
