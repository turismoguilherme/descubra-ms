import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { ViaJARAuthProvider } from "@/hooks/auth/ViaJARAuthProvider";
import { OverflowOneAuthProvider } from "@/hooks/auth/OverflowOneAuthProvider";
import { CSRFProvider } from "@/components/security/CSRFProtection";
import { TourismDataProvider } from "@/context/TourismDataContext";
import { BrandProvider } from "@/context/BrandContext";
import LoadingFallback from "@/components/ui/loading-fallback";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import SecurityProvider from "@/components/security/SecurityProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// ViaJAR SaaS Pages
import ViaJARSaaS from "@/pages/ViaJARSaaS";
import Solucoes from "@/pages/Solucoes";
import CasosSucesso from "@/pages/CasosSucesso";
import Precos from "@/pages/Precos";
import ParaGovernos from "@/pages/ParaGovernos";
import Sobre from "@/pages/Sobre";
import Contato from "@/pages/Contato";

// ViaJAR Dashboard Pages (Lazy loaded)
const ViaJARDashboard = lazy(() => import("@/pages/OverflowOneDashboard"));
const ViaJARLogin = lazy(() => import("@/pages/OverflowOneLogin"));
const ViaJARRegister = lazy(() => import("@/pages/OverflowOneRegister"));
const ViaJARForgotPassword = lazy(() => import("@/pages/OverflowOneForgotPassword"));
const ViaJARInventory = lazy(() => import("@/pages/OverflowOneInventory"));
const ViaJARReports = lazy(() => import("@/pages/ReportsPage"));
const ViaJARLeads = lazy(() => import("@/pages/LeadsPage"));
const ViaJARPublicSector = lazy(() => import("@/pages/PublicSectorPage"));
const CATLogin = lazy(() => import("@/pages/CATLogin"));
const CATDashboard = lazy(() => import("@/pages/CATDashboard"));
const AttendantCheckIn = lazy(() => import("@/pages/AttendantCheckIn"));

// State Pages
import MSIndex from "@/pages/MSIndex";

const queryClient = new QueryClient();

function App() {
  console.log("🚀 APP: Componente App sendo renderizado");
  
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityHeaders />
      <TourismDataProvider>
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
                            
                            {/* ViaJAR Dashboard Routes (protegidas) */}
                            <Route path="/viajar/dashboard" element={
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
                            
                            {/* CAT Routes (protegidas) */}
                            <Route path="/viajar/cat-login" element={<Suspense fallback={<LoadingFallback />}><CATLogin /></Suspense>} />
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
      </TourismDataProvider>
    </QueryClientProvider>
  );
}

export default App;
