import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { ViaJARAuthProvider } from "@/hooks/auth/ViaJARAuthProvider";
import { OverflowOneAuthProvider } from "@/hooks/auth/OverflowOneAuthProvider";
import { CSRFProvider } from "@/components/security/CSRFProtection";
import { BrandProvider } from "@/context/BrandContext";
import LoadingFallback from "@/components/ui/loading-fallback";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import SecurityProvider from "@/components/security/SecurityProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
import ParaGovernos from "@/pages/ParaGovernos";
import Sobre from "@/pages/Sobre";
import Contato from "@/pages/Contato";

// ViaJAR Dashboard Pages (Lazy loaded)
const ViaJARDashboard = lazy(() => import("@/pages/ViaJARDynamicDashboard"));
const ViaJARUnifiedDashboard = lazy(() => import("@/pages/ViaJARUnifiedDashboard"));
const ViaJARLogin = lazy(() => import("@/pages/OverflowOneLogin"));
const ViaJARRegister = lazy(() => import("@/pages/OverflowOneRegister"));
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

// State Pages
import MSIndex from "@/pages/MSIndex";
import Destinos from "@/pages/Destinos";
import Partners from "@/pages/Partners";
import Guata from "@/pages/Guata";
import GuataTest from "@/pages/GuataTest";
import EventosMS from "@/pages/ms/EventosMS";
import PassaporteLista from "@/pages/ms/PassaporteLista";
import DestinoDetalhes from "@/pages/DestinoDetalhes";
import ProfilePageFixed from "@/pages/ProfilePageFixed";
import Register from "@/pages/Register";
import AuthPage from "@/pages/AuthPage";

const queryClient = new QueryClient();

function App() {
  console.log("🚀 APP: Componente App sendo renderizado");
  
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
                    <BrowserRouter>
                      <BrandProvider>
                        <div className="min-h-screen bg-background font-sans antialiased">
                          <Routes>
                            {/* ViaJAR SaaS Routes */}
                            <Route path="/" element={<ViaJARSaaS />} />
                            <Route path="/viajar" element={<ViaJARSaaS />} />
                            <Route path="/solucoes" element={<Solucoes />} />
                            <Route path="/casos-sucesso" element={<CasosSucesso />} />
                            <Route path="/precos" element={<Precos />} />
                            <Route path="/governos" element={<ParaGovernos />} />
                            <Route path="/sobre" element={<Sobre />} />
                            <Route path="/contato" element={<Contato />} />
                            
                            {/* ViaJAR Auth Routes (públicas) */}
                            <Route path="/viajar/login" element={<Suspense fallback={<LoadingFallback />}><ViaJARLogin /></Suspense>} />
                            <Route path="/viajar/register" element={<Suspense fallback={<LoadingFallback />}><ViaJARRegister /></Suspense>} />
                            <Route path="/viajar/forgot-password" element={<Suspense fallback={<LoadingFallback />}><ViaJARForgotPassword /></Suspense>} />
                            
                            {/* ViaJAR Onboarding & Pricing (públicas) */}
                            <Route path="/viajar/onboarding" element={<Suspense fallback={<LoadingFallback />}><ViaJAROnboarding /></Suspense>} />
                            <Route path="/viajar/smart-onboarding" element={<Suspense fallback={<LoadingFallback />}><SmartOnboarding /></Suspense>} />
                            <Route path="/viajar/pricing" element={<Suspense fallback={<LoadingFallback />}><ViaJARPricing /></Suspense>} />
                            <Route path="/viajar/diagnostico" element={<Suspense fallback={<LoadingFallback />}><DiagnosticPage /></Suspense>} />
                            <Route path="/test-login" element={<Suspense fallback={<LoadingFallback />}><TestLogin /></Suspense>} />
                            
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
                            
                            {/* MS Routes */}
                            <Route path="/ms" element={<MSIndex />} />
                            <Route path="/ms/destinos" element={<Destinos />} />
                            <Route path="/ms/destinos/:id" element={<DestinoDetalhes />} />
                            <Route path="/ms/eventos" element={<EventosMS />} />
                            <Route path="/ms/parceiros" element={<Partners />} />
                            <Route path="/ms/guata" element={<Guata />} />
                            <Route path="/ms/guata-test" element={<GuataTest />} />
                            <Route path="/ms/passaporte" element={<PassaporteLista />} />
                            <Route path="/ms/profile" element={<ProfilePageFixed />} />
                            
                            {/* MS Auth Routes - usando sistema original do Descubra MS */}
                            <Route path="/ms/login" element={<AuthPage />} />
                            <Route path="/ms/register" element={<Register />} />
                            <Route path="/ms/forgot-password" element={<Suspense fallback={<LoadingFallback />}><ViaJARForgotPassword /></Suspense>} />
                            
                            <Route path="/ms/*" element={<MSIndex />} />
                            
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
