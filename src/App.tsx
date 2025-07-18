
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { CSRFProvider } from "@/components/security/CSRFProtection";
import { TourismDataProvider } from "@/context/TourismDataContext";
import ProfileCompletionChecker from "@/components/auth/ProfileCompletionChecker";
import LoadingFallback from "@/components/ui/loading-fallback";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import SecurityProvider from "@/components/security/SecurityProvider";

// Critical components (no lazy loading)
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Welcome from "@/pages/Welcome";
import AuthPage from "@/pages/AuthPage";

// Security components
const PasswordResetForm = lazy(() => import("@/components/auth/PasswordResetForm"));
const AdminSeedForm = lazy(() => import("@/components/auth/AdminSeedForm"));
const Management = lazy(() => import("@/pages/Management"));
const TechnicalAdmin = lazy(() => import("@/pages/TechnicalAdmin"));
const DigitalPassport = lazy(() => import("@/pages/DigitalPassport"));
const Guata = lazy(() => import("@/pages/Guata"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
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

const queryClient = new QueryClient();

// Wrapper para monitoramento de segurança
function SecurityWrapper({ children }: { children: React.ReactNode }) {
  useSecurityMonitoring();
  return <>{children}</>;
}

function App() {
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
                <ProfileCompletionChecker>
                  <div className="min-h-screen bg-background font-sans antialiased">
                  <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/register" element={<Register />} />
                   <Route path="/login" element={<Login />} />
                   <Route path="/auth" element={<AuthPage />} />
                   <Route path="/password-reset" element={<Suspense fallback={<LoadingFallback />}><PasswordResetForm /></Suspense>} />
                   <Route path="/admin-seed" element={<Suspense fallback={<LoadingFallback />}><AdminSeedForm /></Suspense>} />
                  <Route path="/management" element={<Suspense fallback={<LoadingFallback />}><Management /></Suspense>} />
                  <Route path="/technical-admin" element={<Suspense fallback={<LoadingFallback />}><TechnicalAdmin /></Suspense>} />
                  <Route path="/passaporte" element={<Suspense fallback={<LoadingFallback />}><DigitalPassport /></Suspense>} />
                    <Route path="/guata" element={<Suspense fallback={<LoadingFallback />}><Guata /></Suspense>} />
                     <Route path="/delinha" element={<Suspense fallback={<LoadingFallback />}><Guata /></Suspense>} />
                  <Route path="/admin-login" element={<Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>} />
                  <Route path="/cat-attendant" element={<Suspense fallback={<LoadingFallback />}><CATAttendant /></Suspense>} />
                  <Route path="/municipal-admin" element={<Suspense fallback={<LoadingFallback />}><MunicipalAdmin /></Suspense>} />
                  <Route path="/destinos" element={<Suspense fallback={<LoadingFallback />}><Destinos /></Suspense>} />
                  <Route path="/destinos/:id" element={<Suspense fallback={<LoadingFallback />}><DestinoDetalhes /></Suspense>} />
                  <Route path="/eventos" element={<Suspense fallback={<LoadingFallback />}><Eventos /></Suspense>} />
                  <Route path="/eventos/:id" element={<Suspense fallback={<LoadingFallback />}><EventoDetalhes /></Suspense>} />
                  <Route path="/roteiros" element={<Suspense fallback={<LoadingFallback />}><Roteiros /></Suspense>} />
                  <Route path="/parceiros" element={<Suspense fallback={<LoadingFallback />}><Partners /></Suspense>} />
                  <Route path="/sobre" element={<Suspense fallback={<LoadingFallback />}><Sobre /></Suspense>} />
                  <Route path="/mapa" element={<Suspense fallback={<LoadingFallback />}><Mapa /></Suspense>} />
                  <Route path="/profile" element={<Suspense fallback={<LoadingFallback />}><Profile /></Suspense>} />
                  <Route path="/seja-um-parceiro" element={<Suspense fallback={<LoadingFallback />}><BecomePartner /></Suspense>} />
                  <Route path="/contribuir" element={<Suspense fallback={<LoadingFallback />}><Contribute /></Suspense>} />
                  <Route path="/colaborador" element={<Suspense fallback={<LoadingFallback />}><Colaborador /></Suspense>} />
                  <Route path="/role-dashboard" element={<Suspense fallback={<LoadingFallback />}><RoleDashboard /></Suspense>} />
                  <Route path="/destination-editor" element={<Suspense fallback={<LoadingFallback />}><DestinationEditor /></Suspense>} />
                  <Route path="/event-editor" element={<Suspense fallback={<LoadingFallback />}><EventEditor /></Suspense>} />
                  <Route path="/tourism-data" element={<Suspense fallback={<LoadingFallback />}><TourismData /></Suspense>} />
                    <Route path="/guata-ai" element={<Suspense fallback={<LoadingFallback />}><GuataAI /></Suspense>} />
                     <Route path="/delinha-ai" element={<Suspense fallback={<LoadingFallback />}><GuataAI /></Suspense>} />
                  <Route path="/management-ai" element={<Suspense fallback={<LoadingFallback />}><ManagementAI /></Suspense>} />
                  <Route path="/enhanced-passport" element={<Suspense fallback={<LoadingFallback />}><EnhancedDigitalPassport /></Suspense>} />
                  <Route path="/events-management" element={<Suspense fallback={<LoadingFallback />}><EventsManagement /></Suspense>} />
                  <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
                  </Routes>
                  </div>
                </ProfileCompletionChecker>
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
