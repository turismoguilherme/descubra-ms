import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { ViaJARAuthProvider } from "@/hooks/auth/ViaJARAuthProvider";
import { OverflowOneAuthProvider } from "@/hooks/auth/OverflowOneAuthProviderFinal";
import { CSRFProvider } from "@/components/security/CSRFProtection";
import { TourismDataProvider } from "@/context/TourismDataContext";
import { BrandProvider } from "@/context/BrandContext";
import ProfileCompletionChecker from "@/components/auth/ProfileCompletionChecker";
import LoadingFallback from "@/components/ui/loading-fallback";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import SecurityProvider from "@/components/security/SecurityProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import RouteLogger from "@/components/common/RouteLogger";
import ParamRedirect from "@/components/common/ParamRedirect";

// Critical components (no lazy loading)
import ViaJARSaaS from "@/pages/ViaJARSaaS";
import MSIndex from "@/pages/MSIndex";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Welcome from "@/pages/Welcome";
import AuthPage from "@/pages/AuthPage";
import OverFlowOneMasterDashboard from "@/pages/OverFlowOneMasterDashboard";

// OverFlow One SaaS Pages
const Solucoes = lazy(() => import("@/pages/Solucoes"));
const CasosSucesso = lazy(() => import("@/pages/CasosSucesso"));
const Precos = lazy(() => import("@/pages/Precos"));
const SobreOverFlowOne = lazy(() => import("@/pages/SobreOverFlowOne"));
const ParceirosComerciais = lazy(() => import("@/pages/ParceirosComerciais"));
const ServicosStakeholders = lazy(() => import("@/pages/ServicosStakeholders"));
const BlogOverFlowOne = lazy(() => import("@/pages/BlogOverFlowOne"));
const Documentacao = lazy(() => import("@/pages/Documentacao"));
const SuporteOverFlowOne = lazy(() => import("@/pages/SuporteOverFlowOne"));
const AdminPortal = lazy(() => import("@/pages/AdminPortal"));
// TestDashboards removido - não necessário em produção
const ContatoOverFlowOne = lazy(() => import("@/pages/ContatoOverFlowOne"));
const RecursosAnalytics = lazy(() => import("@/pages/RecursosAnalytics"));
const RecursosWhiteLabel = lazy(() => import("@/pages/RecursosWhiteLabel"));
const RecursosMultiTenant = lazy(() => import("@/pages/RecursosMultiTenant"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));

// ViaJAR Specific Pages
const ViaJARPrecos = lazy(() => import("@/pages/ViaJARPrecos"));
const ViaJARContato = lazy(() => import("@/pages/ViaJARContato"));
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const LeadsPage = lazy(() => import("@/pages/LeadsPage"));
const PublicSectorPage = lazy(() => import("@/pages/PublicSectorPage"));

// Security components
const PasswordResetForm = lazy(() => import("@/components/auth/PasswordResetForm"));
const AdminSeedForm = lazy(() => import("@/components/auth/AdminSeedForm"));
// const Management = lazy(() => import("@/pages/Management")); // Disabled
const TechnicalAdmin = lazy(() => import("@/pages/TechnicalAdmin"));
const DigitalPassport = lazy(() => import("@/pages/DigitalPassport"));
const Guata = lazy(() => import("@/pages/Guata")); // Guata original restaurado
const Delinha = lazy(() => import("@/pages/Delinha"));
// const CATAttendant = lazy(() => import("@/pages/CATAttendant")); // Disabled
const AttendantCheckIn = lazy(() => import("@/pages/AttendantCheckIn"));
const MunicipalAdmin = lazy(() => import("@/pages/MunicipalAdmin"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Destinos = lazy(() => import("@/pages/Destinos"));
const Eventos = lazy(() => import("@/pages/ms/EventosMS")); // Nova página de eventos
// const Roteiros = lazy(() => import("@/pages/Roteiros")); // Disabled
const Partners = lazy(() => import("@/pages/Partners"));
const Sobre = lazy(() => import("@/pages/Sobre"));
const Mapa = lazy(() => import("@/pages/Mapa"));
const Profile = lazy(() => import("@/pages/Profile"));
const BecomePartner = lazy(() => import("@/pages/BecomePartner"));
const Contribute = lazy(() => import("@/pages/Contribute"));
// MS Route components
const RoteirosMS = lazy(() => import("./pages/ms/RoteirosMS"));
const RouteDetailsMS = lazy(() => import("./pages/ms/RouteDetailsMS"));
const PassaporteRouteMS = lazy(() => import("./pages/ms/PassaporteRouteMS"));
const Colaborador = lazy(() => import("@/pages/Colaborador"));
// const RoleDashboard = lazy(() => import("@/pages/RoleDashboard")); // Disabled
// const CommunitySuggestionDetail = lazy(() => import("@/pages/CommunitySuggestionDetail")); // Disabled
// const DestinationEditor = lazy(() => import("@/pages/DestinationEditor")); // Disabled
// const EventEditor = lazy(() => import("@/pages/EventEditor")); // Disabled
const DestinoDetalhes = lazy(() => import("@/pages/DestinoDetalhes"));
const EventoDetalhes = lazy(() => import("@/pages/EventoDetalhes"));
const TourismData = lazy(() => import("@/pages/TourismData"));
const ManagementAI = lazy(() => import("@/pages/ManagementAI"));
const EnhancedDigitalPassportPage = lazy(() => import("@/pages/EnhancedDigitalPassportPage"));
const EventsManagement = lazy(() => import("@/pages/EventsManagement"));
const Regions = lazy(() => import("@/pages/Regions"));
const Resultados = lazy(() => import("@/pages/Resultados"));
const CasesSucesso = lazy(() => import("@/pages/CasesSucesso"));
const Personalizar = lazy(() => import("@/pages/Personalizar"));
const TourismManagement = lazy(() => import("@/pages/TourismManagement"));
// const RoutesManagement = lazy(() => import("@/pages/RoutesManagement")); // Disabled
// const RouteEditorPage = lazy(() => import("@/pages/RouteEditorPage")); // Disabled
// const LeaderboardsPage = lazy(() => import("@/pages/LeaderboardsPage")); // Disabled
const RewardsManagement = lazy(() => import("@/components/management/RewardsManager"));
// const RouteDetailsPage = lazy(() => import("@/pages/RouteDetailsPage")); // Disabled
const GuataHumanInterface = lazy(() => import("@/components/guata/GuataHumanInterface")); // Sistema Guatá Human
const GuataPublic = lazy(() => import("@/pages/GuataPublic")); // Guatá sem autenticação
const EmergencyTest = lazy(() => import("@/pages/test/EmergencyTest")); // Nova importação para teste de emergência
const MLTest = lazy(() => import("@/pages/test/MLTest")); // Nova importação para teste de ML
const GuataReliabilityDashboard = lazy(() => import("@/pages/GuataReliabilityDashboard")); // Painel de Confiabilidade
const DynamicSearchTest = lazy(() => import("@/pages/DynamicSearchTest")); // Teste de busca dinâmica
const CommercialPartnersPortal = lazy(() => import("@/pages/CommercialPartnersPortal"));
const CommercialDashboard = lazy(() => import("@/pages/CommercialDashboard"));
const OverflowOnePartners = lazy(() => import("@/pages/OverflowOnePartners"));
const OverflowOneServices = lazy(() => import("@/pages/OverflowOneServices"));
const OverflowOneDashboard = lazy(() => import("@/pages/OverflowOneDashboard"));
const OverflowOneInventory = lazy(() => import("@/pages/OverflowOneInventory"));
const OverflowOneLogin = lazy(() => import("@/pages/OverflowOneLogin"));
const OverflowOneRegister = lazy(() => import("@/pages/OverflowOneRegister"));
const OverflowOneForgotPassword = lazy(() => import("@/pages/OverflowOneForgotPassword"));
const OverflowOneTestLogin = lazy(() => import("@/pages/OverflowOneTestLogin"));
const OverflowOneMasterDashboard = lazy(() => import("@/pages/OverFlowOneMasterDashboard"));
const OverflowOneAtendenteDashboard = lazy(() => import("@/pages/OverflowOneAtendenteDashboard"));
const OverflowOneMunicipalDashboard = lazy(() => import("@/pages/OverflowOneMunicipalDashboard"));
const OverflowOneEstadualDashboard = lazy(() => import("@/pages/OverflowOneEstadualDashboard"));

const queryClient = new QueryClient();

function App() {
  console.log("🚀 APP: Componente App sendo renderizado");
  
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityHeaders />
      <TourismDataProvider>
        <AuthProvider>
          <ViaJARAuthProvider>
            {/* OverflowOneAuthProvider temporariamente desabilitado devido a erros de tipo */}
            <CSRFProvider>
              <SecurityProvider
                enableSessionTimeout={true}
                sessionTimeoutMinutes={30}
                sessionWarningMinutes={5}
              >
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <RouteLogger />
                <BrandProvider>
                  <ProfileCompletionChecker>
                    <div className="min-h-screen bg-background font-sans antialiased">
                    <Routes>
                      
                      {/* ViaJAR SaaS Routes */}
                      <Route path="/" element={<ViaJARSaaS />} />
                      <Route path="/viajar" element={<ViaJARSaaS />} />
                      
                      {/* Legacy Overflow One Routes - Redirect to ViaJAR */}
                      <Route path="/overflow-one" element={<Navigate to="/viajar" replace />} />
                      <Route path="/contato" element={<Suspense fallback={<LoadingFallback />}><ContatoOverFlowOne /></Suspense>} />
                      <Route path="/contato-overflow-one" element={<Suspense fallback={<LoadingFallback />}><ContatoOverFlowOne /></Suspense>} />
                      <Route path="/solucoes" element={<Suspense fallback={<LoadingFallback />}><Solucoes /></Suspense>} />
                      <Route path="/casos-sucesso" element={<Suspense fallback={<LoadingFallback />}><CasosSucesso /></Suspense>} />
                      <Route path="/precos" element={<Suspense fallback={<LoadingFallback />}><Precos /></Suspense>} />
                      <Route path="/parceiros-comerciais" element={<Suspense fallback={<LoadingFallback />}><ParceirosComerciais /></Suspense>} />
                      <Route path="/parceiros" element={<Suspense fallback={<LoadingFallback />}><ParceirosComerciais /></Suspense>} />
                      <Route path="/servicos" element={<Suspense fallback={<LoadingFallback />}><OverflowOneServices /></Suspense>} />
                      <Route path="/sobre-overflow-one" element={<Suspense fallback={<LoadingFallback />}><SobreOverFlowOne /></Suspense>} />
                      <Route path="/sobre-flowtrip" element={<Navigate to="/sobre-overflow-one" replace />} />
                      <Route path="/blog" element={<Suspense fallback={<LoadingFallback />}><BlogOverFlowOne /></Suspense>} />
                      <Route path="/documentacao" element={<Suspense fallback={<LoadingFallback />}><Documentacao /></Suspense>} />
                      <Route path="/suporte" element={<Suspense fallback={<LoadingFallback />}><SuporteOverFlowOne /></Suspense>} />
                      {/* <Route path="/admin-portal" element={<Suspense fallback={<LoadingFallback />}><AdminPortal /></Suspense>} /> */}
                      {/* TestDashboards removido - não necessário em produção */}
                      <Route path="/admin-login" element={<Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>} />
                      <Route path="/master-dashboard" element={<OverFlowOneMasterDashboard />} />
                      
                      {/* OverFlow One Resources Routes */}
                      <Route path="/recursos/analytics" element={<Suspense fallback={<LoadingFallback />}><RecursosAnalytics /></Suspense>} />
                      <Route path="/recursos/white-label" element={<Suspense fallback={<LoadingFallback />}><RecursosWhiteLabel /></Suspense>} />
                      <Route path="/recursos/multi-tenant" element={<Suspense fallback={<LoadingFallback />}><RecursosMultiTenant /></Suspense>} />
                      
                      {/* Rotas Comerciais OverFlow One */}
                      <Route path="/parceiros-comerciais" element={<Suspense fallback={<LoadingFallback />}><CommercialPartnersPortal /></Suspense>} />
                      <Route path="/comercial-dashboard" element={<Suspense fallback={<LoadingFallback />}><CommercialDashboard /></Suspense>} />
                      <Route path="/comercial-login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
                      <Route path="/comercial-register" element={<Suspense fallback={<LoadingFallback />}><Register /></Suspense>} />
                      
                      {/* OverFlow One Partners Routes */}
                      <Route path="/parceiros" element={<Suspense fallback={<LoadingFallback />}><OverflowOnePartners /></Suspense>} />
                      <Route path="/overflow-one-parceiros" element={<Suspense fallback={<LoadingFallback />}><OverflowOnePartners /></Suspense>} />
                      
                      {/* OverFlow One Services Routes */}
                      <Route path="/servicos" element={<Suspense fallback={<LoadingFallback />}><OverflowOneServices /></Suspense>} />
                      <Route path="/overflow-one-servicos" element={<Suspense fallback={<LoadingFallback />}><OverflowOneServices /></Suspense>} />
                      <Route path="/dashboard-empresarial" element={<Suspense fallback={<LoadingFallback />}><OverflowOneDashboard /></Suspense>} />
                      <Route path="/inventario-turistico" element={<Suspense fallback={<LoadingFallback />}><InventoryPage /></Suspense>} />
                      <Route path="/relatorios" element={<Suspense fallback={<LoadingFallback />}><ReportsPage /></Suspense>} />
                      <Route path="/leads" element={<Suspense fallback={<LoadingFallback />}><LeadsPage /></Suspense>} />
                      <Route path="/setor-publico" element={<Suspense fallback={<LoadingFallback />}><PublicSectorPage /></Suspense>} />
                      
                      {/* ViaJAR Auth Routes */}
                      <Route path="/viajar/login" element={<Suspense fallback={<LoadingFallback />}><OverflowOneLogin /></Suspense>} />
                      <Route path="/viajar/register" element={<Suspense fallback={<LoadingFallback />}><OverflowOneRegister /></Suspense>} />
                      <Route path="/viajar/forgot-password" element={<Suspense fallback={<LoadingFallback />}><OverflowOneForgotPassword /></Suspense>} />
                      <Route path="/viajar/dashboard" element={<Suspense fallback={<LoadingFallback />}><OverflowOneDashboard /></Suspense>} />
                      <Route path="/viajar/inventario" element={<Suspense fallback={<LoadingFallback />}><InventoryPage /></Suspense>} />
                      <Route path="/viajar/relatorios" element={<Suspense fallback={<LoadingFallback />}><ReportsPage /></Suspense>} />
                      <Route path="/viajar/leads" element={<Suspense fallback={<LoadingFallback />}><LeadsPage /></Suspense>} />
                      <Route path="/viajar/setor-publico" element={<Suspense fallback={<LoadingFallback />}><PublicSectorPage /></Suspense>} />
                      <Route path="/viajar/test-login" element={<Suspense fallback={<LoadingFallback />}><OverflowOneTestLogin /></Suspense>} />
                      <Route path="/viajar/master-dashboard" element={<Suspense fallback={<LoadingFallback />}><OverflowOneMasterDashboard /></Suspense>} />
                      
                      {/* ViaJAR Specific Dashboards */}
                      <Route path="/viajar/atendente" element={<Suspense fallback={<LoadingFallback />}><OverflowOneAtendenteDashboard /></Suspense>} />
                      <Route path="/viajar/municipal" element={<Suspense fallback={<LoadingFallback />}><OverflowOneMunicipalDashboard /></Suspense>} />
                      <Route path="/viajar/estadual" element={<Suspense fallback={<LoadingFallback />}><OverflowOneEstadualDashboard /></Suspense>} />
                      <Route path="/viajar/master" element={<Suspense fallback={<LoadingFallback />}><OverflowOneMasterDashboard /></Suspense>} />
                      
                      {/* ViaJAR Navigation Routes */}
                      <Route path="/viajar/precos" element={<Suspense fallback={<LoadingFallback />}><ViaJARPrecos /></Suspense>} />
                      <Route path="/viajar/sobre" element={<Suspense fallback={<LoadingFallback />}><SobreOverFlowOne /></Suspense>} />
                      <Route path="/viajar/contato" element={<Suspense fallback={<LoadingFallback />}><ViaJARContato /></Suspense>} />
                      
                      {/* Legacy Overflow One Routes - Redirect to ViaJAR */}
                      <Route path="/overflow-one/login" element={<Navigate to="/viajar/login" replace />} />
                      <Route path="/overflow-one/register" element={<Navigate to="/viajar/register" replace />} />
                      <Route path="/overflow-one/forgot-password" element={<Navigate to="/viajar/forgot-password" replace />} />
                      <Route path="/overflow-one/dashboard" element={<Navigate to="/viajar/dashboard" replace />} />
                      <Route path="/overflow-one/inventario" element={<Navigate to="/viajar/inventario" replace />} />
                      <Route path="/overflow-one/test-login" element={<Navigate to="/viajar/test-login" replace />} />
                      <Route path="/overflow-one/master-dashboard" element={<Navigate to="/viajar/master-dashboard" replace />} />
                      <Route path="/overflow-one/atendente" element={<Navigate to="/viajar/atendente" replace />} />
                      <Route path="/overflow-one/municipal" element={<Navigate to="/viajar/municipal" replace />} />
                      <Route path="/overflow-one/estadual" element={<Navigate to="/viajar/estadual" replace />} />
                      <Route path="/overflow-one/master" element={<Navigate to="/viajar/master" replace />} />
                      
                      {/* MS Routes */}
                      <Route path="/ms" element={<MSIndex />} />
                      <Route path="/ms/welcome" element={<Welcome />} />
                      <Route path="/ms/register" element={<Register />} />
                      <Route path="/ms/login" element={<Login />} />
                      <Route path="/ms/auth" element={<AuthPage />} />
                      <Route path="/ms/password-reset" element={<Suspense fallback={<LoadingFallback />}><PasswordResetForm /></Suspense>} />
                      <Route path="/ms/admin" element={<Suspense fallback={<LoadingFallback />}><AdminPortal /></Suspense>} />
                      <Route path="/ms/admin-seed" element={<Suspense fallback={<LoadingFallback />}><AdminSeedForm /></Suspense>} />
                      {/* <Route path="/ms/management" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin']}>
                          <Management />
                        </ProtectedRoute>
                      } /> */}
                      <Route path="/ms/technical-admin" element={<Suspense fallback={<LoadingFallback />}><TechnicalAdmin /></Suspense>} />
                      <Route path="/ms/passaporte" element={<Suspense fallback={<LoadingFallback />}><DigitalPassport /></Suspense>} />
                      <Route path="/ms/guata" element={<Suspense fallback={<LoadingFallback />}><Guata /></Suspense>} />
                      <Route path="/ms/emergency-test" element={<Suspense fallback={<LoadingFallback />}><EmergencyTest /></Suspense>} />
                      <Route path="/ms/ml-test" element={<Suspense fallback={<LoadingFallback />}><MLTest /></Suspense>} />
                      <Route path="/ms/dynamic-search-test" element={<Suspense fallback={<LoadingFallback />}><DynamicSearchTest /></Suspense>} />
                      <Route path="/chatguata" element={<Suspense fallback={<LoadingFallback />}><GuataPublic /></Suspense>} />
                      <Route path="/ms/chatguata" element={<Navigate to="/chatguata" replace />} />
                      <Route path="/auth/callback" element={<Navigate to="/ms/welcome" replace />} />
                      <Route path="/guata-reliability" element={<Suspense fallback={<LoadingFallback />}><GuataReliabilityDashboard /></Suspense>} />
                      <Route path="/ms/delinha" element={<Suspense fallback={<LoadingFallback />}><Delinha /></Suspense>} />
                      {/* <Route path="/ms/cat-attendant" element={
                        <ProtectedRoute allowedRoles={['cat_attendant']} requireCity>
                          <CATAttendant />
                        </ProtectedRoute>
                      } /> */}
                      <Route path="/ms/attendant-checkin" element={
                        <ProtectedRoute allowedRoles={['atendente']} requireCity>
                          <Suspense fallback={<LoadingFallback />}><AttendantCheckIn /></Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="/ms/municipal-admin" element={
                        <ProtectedRoute allowedRoles={['city_admin']} requireCity>
                          <MunicipalAdmin />
                        </ProtectedRoute>
                      } />
                      <Route path="/ms/destinos" element={<Suspense fallback={<LoadingFallback />}><Destinos /></Suspense>} />
                      <Route path="/ms/destinos/:id" element={<Suspense fallback={<LoadingFallback />}><DestinoDetalhes /></Suspense>} />
                      <Route path="/ms/eventos" element={<Suspense fallback={<LoadingFallback />}><Eventos /></Suspense>} />
                      <Route path="/ms/eventos/:id" element={<Suspense fallback={<LoadingFallback />}><EventoDetalhes /></Suspense>} />
                      <Route path="/ms/roteiros" element={<Suspense fallback={<LoadingFallback />}><RoteirosMS /></Suspense>} />
                      <Route path="/ms/roteiros/:routeId" element={<Suspense fallback={<LoadingFallback />}><RouteDetailsMS /></Suspense>} />
                      <Route path="/ms/passaporte/:routeId" element={<Suspense fallback={<LoadingFallback />}><PassaporteRouteMS /></Suspense>} />
                       <Route path="/ms/parceiros" element={<Suspense fallback={<LoadingFallback />}><Partners /></Suspense>} />
                        {/* Rotas comerciais movidas para OverFlow One */}
                       <Route path="/ms/sobre" element={<Suspense fallback={<LoadingFallback />}><Sobre /></Suspense>} />
                      <Route path="/ms/mapa" element={<Suspense fallback={<LoadingFallback />}><Mapa /></Suspense>} />
                      <Route path="/ms/profile" element={<Suspense fallback={<LoadingFallback />}><Profile /></Suspense>} />
                      <Route path="/ms/seja-um-parceiro" element={<Suspense fallback={<LoadingFallback />}><BecomePartner /></Suspense>} />
                      <Route path="/ms/contribuir" element={<Suspense fallback={<LoadingFallback />}><Contribute /></Suspense>} />
                      {/* <Route path="/ms/contribuir/:id" element={<Suspense fallback={<LoadingFallback />}><CommunitySuggestionDetail /></Suspense>} /> */}
                      <Route path="/ms/collaborator" element={
                        <ProtectedRoute allowedRoles={['collaborator']}>
                          <Colaborador />
                        </ProtectedRoute>
                      } />
                      {/* <Route path="/ms/role-dashboard" element={<Suspense fallback={<LoadingFallback />}><RoleDashboard /></Suspense>} /> */}

                      {/* Rotas de Administração de Conteúdo (Protegidas) */}
                      {/* <Route path="/ms/admin/destination-editor/:id?" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin', 'city_admin', 'gestor_municipal']}>
                          <Suspense fallback={<LoadingFallback />}><DestinationEditor /></Suspense>
                        </ProtectedRoute>
                      } /> */}
                      {/* <Route path="/ms/admin/event-editor/:id?" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin', 'city_admin', 'gestor_municipal']}>
                          <Suspense fallback={<LoadingFallback />}><EventEditor /></Suspense>
                        </ProtectedRoute>
                      } /> */}
                      <Route path="/ms/admin/events-management" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin', 'city_admin', 'gestor_municipal']}>
                          <Suspense fallback={<LoadingFallback />}><EventsManagement /></Suspense>
                        </ProtectedRoute>
                      } />

                      {/* Novas Rotas de Administração de Roteiros (Protegidas) */}
                      {/* <Route path="/ms/admin/routes-management" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin', 'city_admin', 'gestor_municipal']}>
                          <Suspense fallback={<LoadingFallback />}><RoutesManagement /></Suspense>
                        </ProtectedRoute>
                      } /> */}
                      {/* <Route path="/ms/admin/route-editor/:id?" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin', 'city_admin', 'gestor_municipal']}>
                          <Suspense fallback={<LoadingFallback />}><RouteEditorPage /></Suspense>
                        </ProtectedRoute>
                      } /> */}

                      <Route path="/ms/tourism-data" element={<Suspense fallback={<LoadingFallback />}><TourismData /></Suspense>} />
                      <Route path="/ms/delinha-ai" element={<Suspense fallback={<LoadingFallback />}><ManagementAI /></Suspense>} />
                      <Route path="/ms/management-ai" element={<Suspense fallback={<LoadingFallback />}><ManagementAI /></Suspense>} />
                      <Route path="/ms/enhanced-passport" element={<Suspense fallback={<LoadingFallback />}><EnhancedDigitalPassportPage /></Suspense>} />
                      <Route path="/passport/enhanced" element={<Suspense fallback={<LoadingFallback />}><EnhancedDigitalPassportPage /></Suspense>} />

                      {/* <Route path="/ms/leaderboards" element={<Suspense fallback={<LoadingFallback />}><LeaderboardsPage /></Suspense>} /> */}
                      <Route path="/ms/rewards-management" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin', 'city_admin', 'gestor_municipal']}>
                          <Suspense fallback={<LoadingFallback />}><RewardsManagement /></Suspense>
                        </ProtectedRoute>
                      } />

                      <Route path="/ms/regioes" element={<Suspense fallback={<LoadingFallback />}><Regions /></Suspense>} />
                      {/* TestDashboards removido - não necessário em produção */}
                      <Route path="/ms/tourism-management" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin', 'city_admin', 'gestor_municipal']}>
                          <TourismManagement />
                        </ProtectedRoute>
                      } />
                      
                      {/* Páginas OverFlow One SaaS */}
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
                      <Route path="/roteiros/:routeId" element={<Navigate to="/ms/roteiros/:routeId" replace />} /> {/* Nova rota para detalhes do roteiro */}
                      <Route path="/parceiros" element={<Navigate to="/ms/parceiros" replace />} />
                      <Route path="/sobre" element={<Navigate to="/ms/sobre" replace />} />
                      <Route path="/mapa" element={<Navigate to="/ms/mapa" replace />} />
                      
                      <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
                    </Routes>
                    </div>
                  </ProfileCompletionChecker>
                </BrandProvider>
              </BrowserRouter>
              </TooltipProvider>
            </SecurityProvider>
          </CSRFProvider>
            {/* </OverflowOneAuthProvider> - temporariamente desabilitado */}
            </ViaJARAuthProvider>
        </AuthProvider>
      </TourismDataProvider>
    </QueryClientProvider>
  );
}

export default App;
